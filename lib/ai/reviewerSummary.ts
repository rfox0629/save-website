import "server-only";

import { z } from "zod";

import { completeJson, extractJsonObject } from "@/lib/ai/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Applications,
  ExternalCheck,
  InquiryResponse,
  Organizations,
  ReviewerNote,
  VettingResponse,
} from "@/lib/supabase/types";

const confidenceSchema = z.enum(["low", "medium", "high"]);

const reviewerSummarySchema = z.object({
  executive_summary: z.string(),
  top_strengths: z.array(z.string()),
  top_risks: z.array(z.string()),
  leadership_integrity: z.object({
    assessment: z.string(),
    confidence: confidenceSchema,
  }),
  doctrine: z.object({
    assessment: z.string(),
    confidence: confidenceSchema,
  }),
  governance: z.object({
    assessment: z.string(),
    confidence: confidenceSchema,
  }),
  financial_stewardship: z.object({
    assessment: z.string(),
    confidence: confidenceSchema,
  }),
  fruit: z.object({
    assessment: z.string(),
    confidence: confidenceSchema,
  }),
  follow_up_questions: z.array(z.string()),
  recommendation: z.enum(["advance", "needs_review", "hold"]),
});

export type ReviewerSummary = z.infer<typeof reviewerSummarySchema>;

type LoadedApplication = Pick<
  Applications,
  "id" | "organization_id" | "ai_summary"
> & {
  organizations: Organizations | null;
};

function compactValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    const compacted = value
      .map((item) => compactValue(item))
      .filter((item): item is NonNullable<typeof item> => item !== undefined);

    return compacted.length > 0 ? compacted : undefined;
  }

  return value;
}

function compactRecord(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).flatMap(([key, value]) => {
      const compacted = compactValue(value);
      return compacted === undefined ? [] : [[key, compacted]];
    }),
  );
}

function buildOrganizationPayload(organization: Organizations) {
  return compactRecord({
    legal_name: organization.legal_name,
    dba_name: organization.dba_name,
    entity_type: organization.entity_type,
    year_founded: organization.year_founded,
    state_of_incorporation: organization.state_of_incorporation,
    website_url: organization.website_url,
    ein: organization.ein,
    primary_focus: organization.primary_focus,
    geographic_scope: organization.geographic_scope,
    countries: organization.countries,
  });
}

function buildInquiryPayload(inquiry: InquiryResponse | null) {
  if (!inquiry) {
    return null;
  }

  return compactRecord({
    lead_name: inquiry.lead_name,
    years_in_role: inquiry.years_in_role,
    denomination: inquiry.denomination,
    theological_education: inquiry.theological_education,
    ordination_status: inquiry.ordination_status,
    gospel_clarity: inquiry.gospel_clarity,
    scripture_position: inquiry.scripture_position,
    baptism_position: inquiry.baptism_position,
    annual_revenue_range: inquiry.annual_revenue_range,
    annual_reach: inquiry.annual_reach,
    key_metric: inquiry.key_metric,
    funding_sources: inquiry.funding_sources,
    funding_rationale: inquiry.funding_rationale,
    board_size: inquiry.board_size,
    board_approved_budget: inquiry.board_approved_budget,
    board_compensated: inquiry.board_compensated,
    files_990: inquiry.files_990,
    has_references: inquiry.has_references,
    legal_action: inquiry.legal_action,
    moral_failure: inquiry.moral_failure,
    financial_investigation: inquiry.financial_investigation,
  });
}

function buildVettingPayload(vetting: VettingResponse | null) {
  if (!vetting) {
    return null;
  }

  return compactRecord({
    leader_accountability: vetting.leader_accountability,
    leader_conversion_narrative: vetting.leader_conversion_narrative,
    leadership_conflict_notes: vetting.leadership_conflict_notes,
    decision_making_model: vetting.decision_making_model,
    board_meeting_frequency: vetting.board_meeting_frequency,
    board_confrontation_willingness: vetting.board_confrontation_willingness,
    independent_board_count: vetting.independent_board_count,
    family_on_board: vetting.family_on_board,
    conflict_of_interest_policy: vetting.conflict_of_interest_policy,
    whistleblower_policy: vetting.whistleblower_policy,
    annual_ed_review: vetting.annual_ed_review,
    compensation_set_by_board: vetting.compensation_set_by_board,
    exec_salary_benchmark: vetting.exec_salary_benchmark,
    program_expense_pct: vetting.program_expense_pct,
    overhead_expense_pct: vetting.overhead_expense_pct,
    recent_deficit: vetting.recent_deficit,
    reserve_fund_level: vetting.reserve_fund_level,
    restricted_funds_tracked: vetting.restricted_funds_tracked,
    restricted_funds_misused: vetting.restricted_funds_misused,
  });
}

function buildChecksPayload(checks: ExternalCheck[]) {
  const getCheck = (source: string) =>
    checks.find((check) => check.source === source) ?? null;
  const documentChecks = checks.filter((check) =>
    ["990_analysis", "bylaws_analysis", "doctrinal_analysis"].includes(
      check.source,
    ),
  );
  const charityNavigator = getCheck("charity_navigator");
  const charityNavigatorRaw =
    charityNavigator?.raw_result &&
    typeof charityNavigator.raw_result === "object" &&
    !Array.isArray(charityNavigator.raw_result)
      ? (charityNavigator.raw_result as Record<string, unknown>)
      : null;

  return compactRecord({
    irs: buildSingleCheckPayload(getCheck("irs_teos")),
    website: buildSingleCheckPayload(getCheck("website")),
    reputation: compactRecord({
      news_search: buildSingleCheckPayload(getCheck("news_search")),
      ecfa_search: buildSingleCheckPayload(getCheck("ecfa_search")),
    }),
    documents:
      documentChecks.length > 0
        ? documentChecks.map((check) => buildSingleCheckPayload(check))
        : undefined,
    charity_navigator: charityNavigator
      ? compactRecord({
          integration_status:
            typeof charityNavigatorRaw?.status === "string"
              ? charityNavigatorRaw.status
              : charityNavigator.status === "pass"
                ? "found"
                : undefined,
          note:
            typeof charityNavigatorRaw?.note === "string"
              ? charityNavigatorRaw.note
              : charityNavigator.summary,
          status: charityNavigator.status,
          summary: charityNavigator.summary,
        })
      : undefined,
  });
}

function buildSingleCheckPayload(check: ExternalCheck | null) {
  if (!check) {
    return null;
  }

  return compactRecord({
    source: check.source,
    status: check.status,
    summary: check.summary,
  });
}

function buildReviewerNotesPayload(notes: ReviewerNote[]) {
  return notes
    .filter((note) => note.note.trim().length > 0)
    .slice(0, 8)
    .map((note) =>
      compactRecord({
        is_internal: note.is_internal,
        note: note.note,
        section: note.section,
      }),
    );
}

function buildPrompt(payload: Record<string, unknown>) {
  return `You are preparing a reviewer summary for a nonprofit application at SAVE.

Analyze only the information provided below.
Do not make up facts.
If information is missing or unclear, say so plainly and lower confidence appropriately.
Keep the output concise and useful for a human donor/reviewer.
Stay grounded in leadership integrity, doctrine, governance, financial stewardship, and fruit.

Return ONLY a valid JSON object with this exact structure:
{
  "executive_summary": "",
  "top_strengths": [],
  "top_risks": [],
  "leadership_integrity": {
    "assessment": "",
    "confidence": "low|medium|high"
  },
  "doctrine": {
    "assessment": "",
    "confidence": "low|medium|high"
  },
  "governance": {
    "assessment": "",
    "confidence": "low|medium|high"
  },
  "financial_stewardship": {
    "assessment": "",
    "confidence": "low|medium|high"
  },
  "fruit": {
    "assessment": "",
    "confidence": "low|medium|high"
  },
  "follow_up_questions": [],
  "recommendation": "advance|needs_review|hold"
}

Application data:
${JSON.stringify(payload, null, 2)}`;
}

export function parseReviewerSummary(
  value: string | null | undefined,
): ReviewerSummary | null {
  if (!value) {
    return null;
  }

  try {
    return reviewerSummarySchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}

export async function generateReviewerSummary(applicationId: string) {
  const admin = createAdminClient();
  const db = admin;

  const { data: application } = await admin
    .from("applications")
    .select("id, organization_id, ai_summary, organizations(*)")
    .eq("id", applicationId)
    .maybeSingle();
  const resolvedApplication = application as LoadedApplication | null;

  if (!resolvedApplication?.organizations) {
    throw new Error("Application organization could not be loaded.");
  }

  const [inquiryResponse, vettingResponse, externalChecks, reviewerNotes] =
    await Promise.all([
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
        .from("external_checks")
        .select("*")
        .eq("application_id", applicationId)
        .order("checked_at", { ascending: false }),
      admin
        .from("reviewer_notes")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false }),
    ]);

  const inquiry = inquiryResponse.data as InquiryResponse | null;
  const vetting = vettingResponse.data as VettingResponse | null;
  const checks = (externalChecks.data ?? []) as ExternalCheck[];
  const notes = (reviewerNotes.data ?? []) as ReviewerNote[];

  // The payload separates what the ministry itself submitted from context SAVE
  // gathered or wrote, so the model cannot present SAVE's own material — or a
  // reviewer's note — as the ministry's testimony.
  const payload = compactRecord({
    ministry_submitted: compactRecord({
      organization: buildOrganizationPayload(resolvedApplication.organizations),
      inquiry: buildInquiryPayload(inquiry),
      complete_application: buildVettingPayload(vetting),
    }),
    save_derived_context: compactRecord({
      external_checks: buildChecksPayload(checks),
      reviewer_notes:
        notes.length > 0 ? buildReviewerNotesPayload(notes) : undefined,
    }),
  });

  const text = await completeJson(buildPrompt(payload), 1200);

  if (!text) {
    throw new Error("The AI service did not return a reviewer summary.");
  }

  let summary: ReviewerSummary;

  try {
    summary = reviewerSummarySchema.parse(JSON.parse(extractJsonObject(text)));
  } catch {
    throw new Error("The AI service returned invalid reviewer summary JSON.");
  }

  const serializedSummary = JSON.stringify(summary);
  const { error } = await db
    .from("applications")
    .update({
      ai_summary: serializedSummary,
      ai_summary_generated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  return summary;
}
