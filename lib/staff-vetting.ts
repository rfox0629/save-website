import type { Database } from "@/lib/supabase/types";

/**
 * Projects the ministry's submitted Complete Application into the eight
 * sections it was completed in, for read-only review by SAVE staff.
 *
 * This is ministry-submitted evidence and nothing else. No score, no risk
 * interpretation, no AI synthesis and no reviewer judgement enters this
 * projection — a reviewer reading it is reading what the ministry said.
 *
 * Two storage details are hidden from the reviewer:
 *
 * 1. Persistence shortens some stored values ("Yes formal", "No reserve"),
 *    so they are translated back to the wording the ministry actually chose.
 * 2. Many answers live in `raw_data` rather than their own column. Which side
 *    a value came from is an implementation detail and never surfaces.
 */

type VettingRow = Database["public"]["Tables"]["vetting_responses"]["Row"];

export type VettingSectionRow = {
  /** True for free-text answers, which read better as prose than as a value. */
  narrative?: boolean;
  label: string;
  value: string;
};

export type VettingSection = {
  rows: VettingSectionRow[];
  title: string;
};

/** The minimal query shape needed to read one application's responses. */
export type VettingQueryBuilder = {
  select: (columns: string) => {
    eq: (
      column: string,
      value: string,
    ) => {
      maybeSingle: () => PromiseLike<{ data: unknown }>;
    };
  };
};

/**
 * Reads one ministry's Complete Application, always filtered to a single
 * application, so no caller can fetch or render another organisation's
 * responses against this assessment.
 */
export function selectVettingForApplication(
  from: (table: string) => VettingQueryBuilder,
  applicationId: string,
) {
  return from("vetting_responses")
    .select("*")
    .eq("application_id", applicationId)
    .maybeSingle();
}

function text(value: unknown): string | undefined {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : undefined;
}

function yesNo(value: unknown): string | undefined {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return undefined;
}

function confirmed(value: unknown): string | undefined {
  if (value === true) return "Confirmed";
  if (value === false) return "Not confirmed";
  return undefined;
}

function count(value: unknown): string | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-US")
    : undefined;
}

function scale(value: unknown): string | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value} of 5`
    : undefined;
}

function percent(value: unknown): string | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value}%`
    : undefined;
}

function rawRecord(raw: VettingRow["raw_data"]): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

/** Persisted shorthand is shown as the option the ministry actually chose. */
const STORED_VALUE_LABELS: Record<string, string> = {
  "Divorced during ministry": "Divorced, during ministry",
  "Divorced prior to ministry": "Divorced, prior to ministry",
  "Lead pastor with staff": "Lead pastor with staff input",
  "Less than 3 months": "Less than 3 months operating",
  "No reserve": "No reserve fund",
  "Significantly below": "Significantly below peer benchmark",
  "Yes formal": "Yes, formal structure",
  "Yes informal": "Yes, informal",
};

function choice(value: unknown): string | undefined {
  const resolved = text(value);
  if (!resolved) return undefined;
  return STORED_VALUE_LABELS[resolved] ?? resolved;
}

function row(
  label: string,
  value: string | undefined,
  options: { narrative?: boolean } = {},
): VettingSectionRow | null {
  if (!value) return null;
  return options.narrative
    ? { label, narrative: true, value }
    : { label, value };
}

function section(title: string, rows: Array<VettingSectionRow | null>) {
  return {
    rows: rows.filter((entry): entry is VettingSectionRow => entry !== null),
    title,
  };
}

/** A named reference or church partner, kept together as one entry. */
function contactRow(
  label: string,
  parts: Array<string | undefined>,
): VettingSectionRow | null {
  const present = parts.filter((part): part is string => Boolean(part));
  return present.length > 0 ? { label, value: present.join(" · ") } : null;
}

/** The moment the ministry submitted — not when the record was created. */
export function getVettingSubmittedAt(
  vetting: Pick<VettingRow, "submitted_at"> | null | undefined,
): string | null {
  return vetting?.submitted_at ?? null;
}

export function buildVettingSections(
  vetting: VettingRow | null | undefined,
): VettingSection[] {
  if (!vetting) {
    return [];
  }

  const raw = rawRecord(vetting.raw_data);
  const marriageSexualityPublic = raw.marriage_sexuality_public;
  const familyOnBoard = vetting.family_on_board;
  const recentDeficit = vetting.recent_deficit;
  const negativePress = raw.negative_press;
  const ecfaMember = raw.ecfa_member;

  return [
    section("Leadership Character", [
      row("Call to ministry", text(vetting.leader_conversion_narrative), {
        narrative: true,
      }),
      row("Marital status", choice(vetting.leader_marital_status)),
      row("Accountability structure", choice(vetting.leader_accountability)),
      row("Decision-making model", choice(vetting.decision_making_model)),
      row(
        "Compensation set by the board",
        yesNo(vetting.compensation_set_by_board),
      ),
      row(
        "Leadership conflict history",
        text(vetting.leadership_conflict_notes),
        {
          narrative: true,
        },
      ),
      row(
        "Board confrontation willingness",
        scale(vetting.board_confrontation_willingness),
      ),
    ]),

    section("Doctrinal Depth", [
      row(
        "Staff doctrinal affirmation required",
        yesNo(raw.doctrinal_affirmation_required),
      ),
      row("Gospel presentation", text(raw.gospel_presentation), {
        narrative: true,
      }),
      row("Syncretism practice", choice(raw.syncretism_practice)),
      row(
        "Marriage and sexuality position public",
        yesNo(marriageSexualityPublic),
      ),
      // Conditional: only asked when the position is public.
      marriageSexualityPublic === true
        ? row(
            "Marriage and sexuality statement",
            text(raw.marriage_sexuality_url),
          )
        : null,
      row(
        "Doctrinal clarity self-score",
        scale(raw.doctrinal_clarity_self_score),
      ),
    ]),

    section("Governance", [
      row("Independent board members", count(vetting.independent_board_count)),
      row("Board meeting frequency", choice(vetting.board_meeting_frequency)),
      row(
        "Conflict-of-interest policy",
        yesNo(vetting.conflict_of_interest_policy),
      ),
      row("Whistleblower policy", yesNo(vetting.whistleblower_policy)),
      row("Annual executive review", yesNo(vetting.annual_ed_review)),
      row("Family members on the board", yesNo(familyOnBoard)),
      // Conditional: only asked when family serve on the board.
      familyOnBoard === true
        ? row("Family relationship", text(raw.family_on_board_relationship))
        : null,
      row("Board turnover", text(raw.board_turnover_notes), {
        narrative: true,
      }),
    ]),

    section("Financial Stewardship", [
      row("Program expenses", percent(vetting.program_expense_pct)),
      row("Overhead expenses", percent(vetting.overhead_expense_pct)),
      row("Reserve fund level", choice(vetting.reserve_fund_level)),
      row(
        "Executive salary benchmarking",
        choice(vetting.exec_salary_benchmark),
      ),
      row("Recent deficit", yesNo(recentDeficit)),
      // Conditional: only asked when a deficit was disclosed.
      recentDeficit === true
        ? row("Deficit explanation", text(raw.deficit_explanation), {
            narrative: true,
          })
        : null,
      row("Restricted funds tracked", yesNo(vetting.restricted_funds_tracked)),
      row("Restricted funds misused", yesNo(vetting.restricted_funds_misused)),
      row("Cryptocurrency policy", yesNo(raw.crypto_policy)),
    ]),

    section("Fruit & Effectiveness", [
      contactRow("Primary output", [
        count(raw.primary_output_count),
        text(raw.primary_output_unit),
      ]),
      row("Theory of change", text(raw.theory_of_change), { narrative: true }),
      row(
        "How spiritual transformation is measured",
        text(raw.spiritual_measurement_method),
        { narrative: true },
      ),
      row("Case study", text(raw.case_study_1), { narrative: true }),
      row("Third-party evaluation", yesNo(raw.third_party_evaluation)),
      row("Fruit self-score", scale(raw.fruit_self_score)),
    ]),

    section("External Relationships", [
      contactRow("Reference 1", [
        text(raw.ref_1_name),
        text(raw.ref_1_role),
        text(raw.ref_1_email),
        text(raw.ref_1_relationship),
      ]),
      contactRow("Reference 2", [
        text(raw.ref_2_name),
        text(raw.ref_2_role),
        text(raw.ref_2_email),
        text(raw.ref_2_relationship),
      ]),
      contactRow("Reference 3", [
        text(raw.ref_3_name),
        text(raw.ref_3_role),
        text(raw.ref_3_email),
        text(raw.ref_3_relationship),
      ]),
      contactRow("Church partner 1", [
        text(raw.partner_1_name),
        text(raw.partner_1_pastor),
        text(raw.partner_1_contact),
      ]),
      contactRow("Church partner 2", [
        text(raw.partner_2_name),
        text(raw.partner_2_pastor),
        text(raw.partner_2_contact),
      ]),
      row("Negative press", yesNo(negativePress)),
      // Conditional: only asked when negative press was disclosed.
      negativePress === true
        ? row("Negative press detail", text(raw.negative_press_notes), {
            narrative: true,
          })
        : null,
      row("ECFA member", yesNo(ecfaMember)),
      // Conditional: only asked of an accountability-body member.
      ecfaMember === true
        ? row("Accountability body", text(raw.ecfa_body))
        : null,
      row("ECFA membership lapsed", yesNo(raw.ecfa_lapsed)),
    ]),

    section("Strategy", [
      row("Strategy", text(raw.strategy_description), { narrative: true }),
      row("Three-year plan", text(raw.three_year_plan), { narrative: true }),
      row("Funding impact", text(raw.funding_impact), { narrative: true }),
      row("If funding were reduced", text(raw.funding_reduction_response), {
        narrative: true,
      }),
      row(
        "Strategic clarity self-score",
        scale(raw.strategic_clarity_self_score),
      ),
    ]),

    section("Documents & Attestation", [
      row(
        "Information is accurate and complete",
        confirmed(
          vetting.attests_information_is_true ?? raw.attestation_complete,
        ),
      ),
      row(
        "Authorises SAVE to contact references and research independently",
        confirmed(raw.attestation_research),
      ),
      row("Signatory", text(vetting.attestation_name ?? raw.signatory_name)),
      row(
        "Signatory title",
        text(vetting.attestation_title ?? raw.signatory_title),
      ),
      row(
        "Signed",
        text(
          typeof vetting.attestation_signed_at === "string"
            ? vetting.attestation_signed_at.slice(0, 10)
            : raw.signed_at,
        ),
      ),
    ]),
  ];
}
