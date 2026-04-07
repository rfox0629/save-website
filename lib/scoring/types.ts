import type { Database } from "@/lib/supabase/types";

export type ScoreInsert = Database["public"]["Tables"]["scores"]["Insert"];
export type ScoreComponentInsert =
  Database["public"]["Tables"]["score_components"]["Insert"];
export type RiskFlagInsert =
  Database["public"]["Tables"]["risk_flags"]["Insert"];
export type ExternalCheckRow =
  Database["public"]["Tables"]["external_checks"]["Row"];
export type InquiryRow =
  Database["public"]["Tables"]["inquiry_responses"]["Row"];
export type VettingRow =
  Database["public"]["Tables"]["vetting_responses"]["Row"];

export type EngineScoreComponent = Omit<
  ScoreComponentInsert,
  "id" | "score_id"
>;
export type EngineRiskFlag = Omit<RiskFlagInsert, "application_id" | "id">;

export type CategoryScoreResult = {
  score: number;
  max: number;
  components: EngineScoreComponent[];
  flags: EngineRiskFlag[];
};

export type ReferenceContact = {
  email: string | null;
  name: string | null;
  relationship: string | null;
  role: string | null;
};

export type NormalizedInquiry = {
  audit_level: string | null;
  board_approved_budget: boolean | null;
  board_size: number | null;
  doctrinal_statement_public: "none" | "on_request" | "yes";
  gospel_clarity: string | null;
  scripture_position: string | null;
};

export type NormalizedVetting = {
  annual_ed_review: boolean | null;
  board_confrontation_willingness: number | null;
  board_meeting_frequency: string | null;
  board_size: number | null;
  compensation_set_by_board: boolean | null;
  conflict_of_interest_policy: boolean | null;
  decision_making_model: string | null;
  ecfa_lapsed: boolean | null;
  ecfa_member: boolean | null;
  family_on_board: boolean | null;
  fruit_self_score: number | null;
  independent_board_count: number | null;
  leader_accountability: string | null;
  leader_marital_status: string | null;
  leadership_conflict_notes: string | null;
  negative_press: boolean | null;
  overhead_expense_pct: number | null;
  program_expense_pct: number | null;
  recent_deficit: boolean | null;
  references: ReferenceContact[];
  reserve_fund_level: string | null;
  restricted_funds_misused: boolean | null;
  restricted_funds_tracked: boolean | null;
  staff_doctrinal_affirmation: boolean | null;
  spiritual_measurement_method: string | null;
  syncretism_practice: string | null;
  theory_of_change: string | null;
  third_party_evaluation: boolean | null;
  whistleblower_policy: boolean | null;
};

export type ScoringResult = Omit<
  ScoreInsert,
  "application_id" | "id" | "override_by" | "override_notes"
> & {
  application_id: string;
  components: EngineScoreComponent[];
  flags: EngineRiskFlag[];
  max_score: number;
};

export function createComponent(
  category: string,
  criterion: string,
  awarded_points: number,
  max_points: number,
  rationale: string,
): EngineScoreComponent {
  return {
    awarded_points,
    category,
    criterion,
    max_points,
    rationale,
  };
}

export function createFlag(
  severity: EngineRiskFlag["severity"],
  category: string,
  flag_code: string,
  description: string,
): EngineRiskFlag {
  return {
    category,
    description,
    flag_code,
    flagged_by: "engine",
    flagged_at: new Date().toISOString(),
    resolution_notes: null,
    resolved: false,
    resolved_at: null,
    resolved_by: null,
    severity,
  };
}
