import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ReputationResult = {
  concern_summary: string;
  concerns_found: boolean;
  sources: string[];
  watchdog_listed: boolean;
  watchdog_notes: string;
};

type ReputationCheckResult = ReputationResult & {
  ecfa_summary: string;
  status: "flag" | "pass";
};

const DEFAULT_MODEL = "claude-sonnet-4-6";

function extractTextContent(content: Anthropic.Messages.ContentBlock[]) {
  return content
    .filter(
      (block): block is Anthropic.Messages.TextBlock => block.type === "text",
    )
    .map((block) => block.text)
    .join("\n")
    .trim();
}

function extractJsonObject(text: string) {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fencedMatch?.[1] ?? text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Claude response did not contain valid JSON.");
  }

  return raw.slice(start, end + 1);
}

function normalizeResult(value: unknown): ReputationResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Claude reputation response could not be parsed.");
  }

  const result = value as Record<string, unknown>;

  return {
    concern_summary:
      typeof result.concern_summary === "string" &&
      result.concern_summary.trim().length > 0
        ? result.concern_summary
        : "No significant concerns identified",
    concerns_found: Boolean(result.concerns_found),
    sources: Array.isArray(result.sources)
      ? result.sources.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    watchdog_listed: Boolean(result.watchdog_listed),
    watchdog_notes:
      typeof result.watchdog_notes === "string" &&
      result.watchdog_notes.trim().length > 0
        ? result.watchdog_notes
        : "No watchdog listing identified",
  };
}

export async function checkReputation(
  orgName: string,
  ein: string,
  applicationId: string,
): Promise<ReputationCheckResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment before running reputation checks.",
    );
  }

  const anthropic = new Anthropic({ apiKey });
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  await db
    .from("external_checks")
    .delete()
    .eq("application_id", applicationId)
    .eq("source", "news_search");

  await db
    .from("external_checks")
    .delete()
    .eq("application_id", applicationId)
    .eq("source", "ecfa_search");

  const response = await anthropic.messages.create({
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Research the Christian ministry named "${orgName}" (EIN: ${ein}).
Search for: any news articles, controversies, lawsuits, leadership scandals,
financial fraud allegations, or doctrinal concerns.
Also check if they appear in ministry watchdog sites like MinistryWatch or ECFA.

Respond ONLY with a JSON object:
{
  "concerns_found": boolean,
  "concern_summary": "string describing any concerns found, or 'No significant concerns identified' if clean",
  "sources": ["url1", "url2"],
  "watchdog_listed": boolean,
  "watchdog_notes": "string"
}`,
      },
    ],
    model: DEFAULT_MODEL,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      },
    ],
  });

  const parsed = normalizeResult(
    JSON.parse(extractJsonObject(extractTextContent(response.content))),
  );
  const status = parsed.concerns_found ? "flag" : "pass";

  await db.from("external_checks").insert({
    application_id: applicationId,
    raw_result: {
      ...parsed,
      anthropic_model: DEFAULT_MODEL,
    },
    score_impact: parsed.concerns_found ? -1 : 1,
    source: "news_search",
    status,
    summary: parsed.concern_summary,
  } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

  const ecfaResponse = await anthropic.messages.create({
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Search: "${orgName} ECFA member site:ecfa.org"
Check whether this organization appears on ECFA's site as a current or historical member.

Respond ONLY with a JSON object:
{
  "ecfa_found": boolean,
  "summary": "string",
  "sources": ["url1", "url2"]
}`,
      },
    ],
    model: DEFAULT_MODEL,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 3,
      },
    ],
  });

  const ecfaRaw = JSON.parse(
    extractJsonObject(extractTextContent(ecfaResponse.content)),
  ) as {
    ecfa_found?: boolean;
    sources?: string[];
    summary?: string;
  };

  const ecfaSummary =
    typeof ecfaRaw.summary === "string" && ecfaRaw.summary.trim().length > 0
      ? ecfaRaw.summary
      : "No ECFA listing found";

  await db.from("external_checks").insert({
    application_id: applicationId,
    raw_result: ecfaRaw,
    score_impact: null,
    source: "ecfa_search",
    status: ecfaRaw.ecfa_found ? "pass" : "not_applicable",
    summary: ecfaSummary,
  } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

  return {
    ...parsed,
    ecfa_summary: ecfaSummary,
    status,
  };
}
