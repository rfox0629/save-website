import "server-only";

import {
  completeWithWebSearch,
  extractJsonObject,
  OPENAI_MODEL,
} from "@/lib/ai/openai";
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

function normalizeResult(value: unknown): ReputationResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The AI reputation response could not be parsed.");
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
  const admin = createAdminClient();
  const db = admin;

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

  const responseText = await completeWithWebSearch(
    `Research the Christian ministry named "${orgName}" (EIN: ${ein}).
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
    1024,
  );

  const parsed = normalizeResult(JSON.parse(extractJsonObject(responseText)));
  const status = parsed.concerns_found ? "flag" : "pass";

  await db.from("external_checks").insert({
    application_id: applicationId,
    raw_result: {
      ...parsed,
      model: OPENAI_MODEL,
    },
    score_impact: parsed.concerns_found ? -1 : 1,
    source: "news_search",
    status,
    summary: parsed.concern_summary,
  } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

  const ecfaResponseText = await completeWithWebSearch(
    `Search: "${orgName} ECFA member site:ecfa.org"
Check whether this organization appears on ECFA's site as a current or historical member.

Respond ONLY with a JSON object:
{
  "ecfa_found": boolean,
  "summary": "string",
  "sources": ["url1", "url2"]
}`,
    512,
  );

  const ecfaRaw = JSON.parse(extractJsonObject(ecfaResponseText)) as {
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
