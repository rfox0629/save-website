import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Applications,
  ExternalCheck,
  InquiryResponse,
  Organizations,
  RiskFlag,
  Score,
  ScoreComponent,
  VettingResponse,
} from "@/lib/supabase/types";

const DEFAULT_MODEL = "claude-sonnet-4-6";

type LoadedApplication = Pick<
  Applications,
  "id" | "organization_id" | "ai_summary"
> & {
  organizations: Organizations | null;
};

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment before generating reviewer summaries.",
    );
  }

  return new Anthropic({ apiKey });
}

function joinLines(lines: string[]) {
  return lines.filter(Boolean).join("\n");
}

export async function generateReviewerSummary(applicationId: string) {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const anthropic = getAnthropicClient();

  const { data: application } = await admin
    .from("applications")
    .select("id, organization_id, ai_summary, organizations(*)")
    .eq("id", applicationId)
    .maybeSingle();
  const resolvedApplication = application as LoadedApplication | null;

  if (!resolvedApplication?.organizations) {
    throw new Error("Application organization could not be loaded.");
  }

  const [
    inquiryResponse,
    vettingResponse,
    scores,
    flags,
    externalChecks,
  ] = await Promise.all([
    admin
      .from("inquiry_responses")
      .select("*")
      .eq("application_id", applicationId)
      .maybeSingle(),
    admin
      .from("vetting_responses")
      .select("*")
      .eq("application_id", applicationId)
      .maybeSingle(),
    admin
      .from("scores")
      .select("*")
      .eq("application_id", applicationId)
      .order("calculated_at", { ascending: false }),
    admin
      .from("risk_flags")
      .select("*")
      .eq("application_id", applicationId)
      .order("flagged_at", { ascending: false }),
    admin
      .from("external_checks")
      .select("*")
      .eq("application_id", applicationId)
      .order("checked_at", { ascending: false }),
  ]);

  const latestScore = ((scores.data ?? []) as Score[])[0] ?? null;

  if (!latestScore) {
    throw new Error("No score found for this application.");
  }

  const { data: scoreComponents } = await admin
    .from("score_components")
    .select("*")
    .eq("score_id", latestScore.id)
    .order("category", { ascending: true });

  const inquiry = inquiryResponse.data as InquiryResponse | null;
  const vetting = vettingResponse.data as VettingResponse | null;
  const flagsList = (flags.data ?? []) as RiskFlag[];
  const checksList = (externalChecks.data ?? []) as ExternalCheck[];
  const componentsList = (scoreComponents ?? []) as ScoreComponent[];
  const org = resolvedApplication.organizations;
  const rawVetting =
    vetting?.raw_data && typeof vetting.raw_data === "object" && !Array.isArray(vetting.raw_data)
      ? (vetting.raw_data as Record<string, unknown>)
      : {};

  const prompt = `You are a ministry vetting analyst at SAVE.
Review this complete ministry application and write a structured analyst summary.

Organization: ${org.legal_name}
Total Score: ${latestScore.total_score}/100
Hard Stop: ${latestScore.is_hard_stop ? "true" : "false"}

Score breakdown:
${componentsList
  .map((component) => `- ${component.criterion}: ${component.awarded_points}/${component.max_points}`)
  .join("\n")}

Risk flags:
${flagsList.length > 0 ? flagsList.map((flag) => `[${flag.severity.toUpperCase()}] ${flag.description}`).join("\n") : "None identified"}

External checks:
${checksList.length > 0 ? checksList.map((check) => `${check.source}: ${check.status} — ${check.summary ?? "No summary"}`).join("\n") : "None recorded"}

Self-reported highlights:
- Gospel clarity: ${inquiry?.gospel_clarity ?? "Not provided"}
- Accountability structure: ${vetting?.leader_accountability ?? "Not provided"}
- Program expense ratio: ${vetting?.program_expense_pct ?? "Not provided"}%
- Reserve fund: ${vetting?.reserve_fund_level ?? "Not provided"}
- ECFA member: ${String(rawVetting.ecfa_member ?? "Not provided")}

Write a structured summary with these exact sections:
1. OVERALL ASSESSMENT (2-3 sentences)
2. STRENGTHS (3 bullet points max)
3. CONCERNS (bullet points, or "None identified")
4. RECOMMENDED NEXT STEPS (what the human reviewer should do)
5. DRAFT RECOMMENDATION (one of: Strongly Recommend / Recommend / Recommend with Conditions / Do Not Recommend)

Be direct. Be specific. Cite actual data points.`;

  const response = await anthropic.messages.create({
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: DEFAULT_MODEL,
  });

  const summary = joinLines(
    response.content
      .filter(
        (block): block is Anthropic.Messages.TextBlock => block.type === "text",
      )
      .map((block) => block.text.trim()),
  );

  if (!summary) {
    throw new Error("Claude did not return a reviewer summary.");
  }

  const { error } = await db
    .from("applications")
    .update({ ai_summary: summary })
    .eq("id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  return summary;
}
