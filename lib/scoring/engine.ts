import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { scoreDoctrine } from "@/lib/scoring/categories/doctrine";
import { scoreExternal } from "@/lib/scoring/categories/external";
import { scoreFinancial } from "@/lib/scoring/categories/financial";
import { scoreFruit } from "@/lib/scoring/categories/fruit";
import { scoreGovernance } from "@/lib/scoring/categories/governance";
import { scoreLeadership } from "@/lib/scoring/categories/leadership";
import { compileFlags } from "@/lib/scoring/flags";
import type {
  NormalizedInquiry,
  NormalizedVetting,
  ScoringResult,
} from "@/lib/scoring/types";
import type { Database, Json } from "@/lib/supabase/types";

function createScoringClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function getRawData(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }

  return value as Record<string, unknown>;
}

function getOptionalString(
  raw: Record<string, unknown>,
  key: string,
): string | null {
  return typeof raw[key] === "string" ? (raw[key] as string) : null;
}

function getOptionalBoolean(
  raw: Record<string, unknown>,
  key: string,
): boolean | null {
  return typeof raw[key] === "boolean" ? (raw[key] as boolean) : null;
}

function getReference(raw: Record<string, unknown>, index: 1 | 2 | 3) {
  return {
    email: getOptionalString(raw, `reference_${index}_email`),
    name: getOptionalString(raw, `reference_${index}_name`),
    relationship: getOptionalString(raw, `reference_${index}_relationship`),
    role: getOptionalString(raw, `reference_${index}_role`),
  };
}

function normalizeInquiry(
  inquiry: Database["public"]["Tables"]["inquiry_responses"]["Row"],
): NormalizedInquiry {
  const raw = getRawData(inquiry.raw_data);
  const doctrinalStatementPublic = getOptionalString(
    raw,
    "doctrinal_statement_public_status",
  );

  return {
    audit_level: inquiry.audit_level,
    board_approved_budget: inquiry.board_approved_budget,
    board_size: inquiry.board_size,
    doctrinal_statement_public:
      doctrinalStatementPublic === "on_request"
        ? "on_request"
        : getOptionalBoolean(raw, "doctrinal_statement_public") ||
            Boolean(inquiry.doctrinal_statement_url)
          ? "yes"
          : "none",
    gospel_clarity: inquiry.gospel_clarity,
    scripture_position: inquiry.scripture_position,
  };
}

function normalizeVetting(
  vetting: Database["public"]["Tables"]["vetting_responses"]["Row"],
  inquiry: NormalizedInquiry,
): NormalizedVetting {
  const raw = getRawData(vetting.raw_data);

  return {
    annual_ed_review: vetting.annual_ed_review,
    board_confrontation_willingness: vetting.board_confrontation_willingness,
    board_meeting_frequency: vetting.board_meeting_frequency,
    board_size: inquiry.board_size,
    compensation_set_by_board: vetting.compensation_set_by_board,
    conflict_of_interest_policy: vetting.conflict_of_interest_policy,
    decision_making_model: vetting.decision_making_model,
    ecfa_lapsed: getOptionalBoolean(raw, "ecfa_lapsed"),
    ecfa_member: getOptionalBoolean(raw, "ecfa_member"),
    family_on_board: vetting.family_on_board,
    fruit_self_score:
      typeof raw.fruit_self_score === "number" ? raw.fruit_self_score : null,
    independent_board_count: vetting.independent_board_count,
    leader_accountability: vetting.leader_accountability,
    leader_marital_status: vetting.leader_marital_status,
    leadership_conflict_notes: vetting.leadership_conflict_notes,
    negative_press: getOptionalBoolean(raw, "negative_press"),
    overhead_expense_pct: vetting.overhead_expense_pct,
    program_expense_pct: vetting.program_expense_pct,
    recent_deficit: vetting.recent_deficit,
    references: [
      getReference(raw, 1),
      getReference(raw, 2),
      getReference(raw, 3),
    ],
    reserve_fund_level: vetting.reserve_fund_level,
    restricted_funds_misused: vetting.restricted_funds_misused,
    restricted_funds_tracked: vetting.restricted_funds_tracked,
    staff_doctrinal_affirmation: getOptionalBoolean(
      raw,
      "staff_doctrinal_affirmation",
    ),
    spiritual_measurement_method: getOptionalString(
      raw,
      "spiritual_measurement_method",
    ),
    syncretism_practice: getOptionalString(raw, "syncretism_practice"),
    theory_of_change: getOptionalString(raw, "theory_of_change"),
    third_party_evaluation: getOptionalBoolean(raw, "third_party_evaluation"),
    whistleblower_policy: vetting.whistleblower_policy,
  };
}

export async function runScoringEngine(
  application_id: string,
): Promise<ScoringResult> {
  const supabase = createScoringClient();
  const [
    { data: inquiry, error: inquiryError },
    { data: vetting, error: vettingError },
  ] = await Promise.all([
    supabase
      .from("inquiry_responses")
      .select("*")
      .eq("application_id", application_id)
      .maybeSingle(),
    supabase
      .from("vetting_responses")
      .select("*")
      .eq("application_id", application_id)
      .maybeSingle(),
  ]);

  if (inquiryError) {
    throw new Error(inquiryError.message);
  }

  if (vettingError) {
    throw new Error(vettingError.message);
  }

  if (!inquiry) {
    throw new Error("Inquiry response not found for this application.");
  }

  if (!vetting) {
    throw new Error("Vetting response not found for this application.");
  }

  const normalizedInquiry = normalizeInquiry(inquiry);
  const normalizedVetting = normalizeVetting(vetting, normalizedInquiry);

  const leadership = scoreLeadership(normalizedVetting);
  const doctrine = scoreDoctrine(normalizedVetting, normalizedInquiry);
  const governance = scoreGovernance(normalizedVetting);
  const financial = scoreFinancial(normalizedVetting, normalizedInquiry);
  const fruit = scoreFruit(normalizedVetting);
  const external = scoreExternal(normalizedVetting);

  const components = [
    ...leadership.components,
    ...doctrine.components,
    ...governance.components,
    ...financial.components,
    ...fruit.components,
    ...external.components,
  ];
  const { flags, hard_stop_reason, is_hard_stop } = compileFlags([
    ...leadership.flags,
    ...doctrine.flags,
    ...governance.flags,
    ...financial.flags,
    ...fruit.flags,
    ...external.flags,
  ]);
  const calculated_at = new Date().toISOString();
  const total_score =
    leadership.score +
    doctrine.score +
    governance.score +
    financial.score +
    fruit.score +
    external.score;

  return {
    application_id,
    calculated_at,
    calculated_by: "engine",
    components,
    doctrine_score: doctrine.score,
    external_trust_score: external.score,
    financial_score: financial.score,
    flags,
    fruit_score: fruit.score,
    governance_score: governance.score,
    hard_stop_reason,
    is_hard_stop,
    leadership_score: leadership.score,
    max_score:
      leadership.max +
      doctrine.max +
      governance.max +
      financial.max +
      fruit.max +
      external.max,
    total_score,
  };
}
