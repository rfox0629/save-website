import { describe, expect, it } from "vitest";

import {
  buildVettingSections,
  getVettingSubmittedAt,
  selectVettingForApplication,
  type VettingSection,
} from "@/lib/staff-vetting";
import type { Database } from "@/lib/supabase/types";

type VettingRow = Database["public"]["Tables"]["vetting_responses"]["Row"];

const vetting = {
  annual_ed_review: true,
  application_id: "app-1",
  attestation_name: "Jordan Pilot",
  attestation_signed_at: "2026-09-20T00:00:00.000Z",
  attestation_title: "Executive Director",
  attests_information_is_true: true,
  board_confrontation_willingness: 4,
  board_meeting_frequency: "Quarterly",
  compensation_set_by_board: true,
  conflict_of_interest_policy: true,
  created_at: "2026-09-20T09:00:00.000Z",
  decision_making_model: "Lead pastor with staff",
  exec_salary_benchmark: "Significantly below",
  family_on_board: true,
  id: "vetting-1",
  independent_board_count: 3,
  leader_accountability: "Yes formal",
  leader_conversion_narrative: "A long account of the call to ministry.",
  leader_marital_status: "Divorced prior to ministry",
  leadership_conflict_notes: "A disagreement over staffing, resolved in 2025.",
  overhead_expense_pct: 18,
  program_expense_pct: 82,
  raw_data: {
    attestation_complete: true,
    attestation_research: true,
    board_turnover_notes: "Two members rotated off.",
    case_study_1: "A family began meeting weekly around their table.",
    crypto_policy: false,
    deficit_explanation: "A one-off building repair.",
    doctrinal_affirmation_required: true,
    doctrinal_clarity_self_score: 4,
    ecfa_body: "Fictional Accountability Alliance",
    ecfa_lapsed: false,
    ecfa_member: true,
    family_on_board_relationship: "Spouse of the executive director.",
    fruit_self_score: 3,
    funding_impact: "Funding sustains field staff.",
    funding_reduction_response: "We would reduce travel first.",
    gospel_presentation: "We explain the gospel plainly and personally.",
    marriage_sexuality_public: true,
    marriage_sexuality_url: "https://pilot-test-ministry.example.org/marriage",
    negative_press: false,
    negative_press_notes: "",
    partner_1_contact: "partner@example.org",
    partner_1_name: "Faith Alive Church",
    partner_1_pastor: "Pastor Example",
    primary_output_count: 24,
    primary_output_unit: "disciples meeting weekly",
    ref_1_email: "ref1@example.org",
    ref_1_name: "Reference One",
    ref_1_relationship: "Partner pastor",
    ref_1_role: "Senior pastor",
    signatory_name: "Jordan Pilot",
    signatory_title: "Executive Director",
    signed_at: "2026-09-20",
    spiritual_measurement_method: "We track obedience over attendance.",
    strategic_clarity_self_score: 4,
    strategy_description: "Train ordinary Christians to disciple others.",
    syncretism_practice: "Never",
    theory_of_change: "Disciples who make disciples multiply households.",
    third_party_evaluation: false,
    three_year_plan: "Expand to four additional cities.",
  },
  recent_deficit: true,
  reserve_fund_level: "No reserve",
  restricted_funds_misused: false,
  restricted_funds_tracked: true,
  submitted_at: "2026-09-20T10:15:00.000Z",
  updated_at: "2026-09-20T10:15:00.000Z",
  whistleblower_policy: false,
} as unknown as VettingRow;

const find = (sections: VettingSection[], title: string) =>
  sections.find((entry) => entry.title === title);

const valueOf = (sections: VettingSection[], title: string, label: string) =>
  find(sections, title)?.rows.find((entry) => entry.label === label)?.value;

const labelsOf = (sections: VettingSection[], title: string) =>
  find(sections, title)?.rows.map((entry) => entry.label) ?? [];

describe("the eight application sections", () => {
  it("keeps the order the ministry completed them in", () => {
    expect(buildVettingSections(vetting).map((entry) => entry.title)).toEqual([
      "Leadership Character",
      "Doctrinal Depth",
      "Governance",
      "Financial Stewardship",
      "Fruit & Effectiveness",
      "External Relationships",
      "Strategy",
      "Documents & Attestation",
    ]);
  });

  it("returns nothing when no application has been submitted", () => {
    expect(buildVettingSections(null)).toEqual([]);
  });
});

describe("ministry-facing meaning is preserved", () => {
  it("shows the option the ministry chose, not the stored shorthand", () => {
    const sections = buildVettingSections(vetting);

    expect(
      valueOf(sections, "Leadership Character", "Accountability structure"),
    ).toBe("Yes, formal structure");
    expect(
      valueOf(sections, "Leadership Character", "Decision-making model"),
    ).toBe("Lead pastor with staff input");
    expect(valueOf(sections, "Leadership Character", "Marital status")).toBe(
      "Divorced, prior to ministry",
    );
    expect(
      valueOf(sections, "Financial Stewardship", "Reserve fund level"),
    ).toBe("No reserve fund");
    expect(
      valueOf(
        sections,
        "Financial Stewardship",
        "Executive salary benchmarking",
      ),
    ).toBe("Significantly below peer benchmark");
  });

  it("renders scales, percentages and booleans readably", () => {
    const sections = buildVettingSections(vetting);

    expect(
      valueOf(
        sections,
        "Leadership Character",
        "Board confrontation willingness",
      ),
    ).toBe("4 of 5");
    expect(valueOf(sections, "Financial Stewardship", "Program expenses")).toBe(
      "82%",
    );
    expect(valueOf(sections, "Governance", "Whistleblower policy")).toBe("No");
    expect(valueOf(sections, "Fruit & Effectiveness", "Primary output")).toBe(
      "24 · disciples meeting weekly",
    );
  });

  it("reads answers stored in either place without revealing which", () => {
    const sections = buildVettingSections(vetting);

    // Column-backed and raw_data-backed answers appear identically.
    expect(valueOf(sections, "Governance", "Independent board members")).toBe(
      "3",
    );
    expect(
      valueOf(sections, "Doctrinal Depth", "Gospel presentation"),
    ).toContain("plainly");
  });
});

describe("conditional answers stay with their parent question", () => {
  it("shows a conditional answer when its parent was answered yes", () => {
    const sections = buildVettingSections(vetting);

    expect(valueOf(sections, "Governance", "Family members on the board")).toBe(
      "Yes",
    );
    expect(valueOf(sections, "Governance", "Family relationship")).toContain(
      "Spouse",
    );
    expect(valueOf(sections, "Financial Stewardship", "Recent deficit")).toBe(
      "Yes",
    );
    expect(
      valueOf(sections, "Financial Stewardship", "Deficit explanation"),
    ).toContain("building repair");
    expect(
      valueOf(sections, "External Relationships", "Accountability body"),
    ).toBe("Fictional Accountability Alliance");
    expect(
      valueOf(sections, "Doctrinal Depth", "Marriage and sexuality statement"),
    ).toContain("marriage");
  });

  it("hides a conditional answer when its parent was answered no", () => {
    const sections = buildVettingSections({
      ...vetting,
      family_on_board: false,
      recent_deficit: false,
      raw_data: {
        ...(vetting.raw_data as Record<string, unknown>),
        ecfa_member: false,
        marriage_sexuality_public: false,
      },
    } as VettingRow);

    expect(labelsOf(sections, "Governance")).not.toContain(
      "Family relationship",
    );
    expect(labelsOf(sections, "Financial Stewardship")).not.toContain(
      "Deficit explanation",
    );
    expect(labelsOf(sections, "External Relationships")).not.toContain(
      "Accountability body",
    );
    expect(labelsOf(sections, "Doctrinal Depth")).not.toContain(
      "Marriage and sexuality statement",
    );
  });

  it("omits blank optional answers entirely", () => {
    const sections = buildVettingSections(vetting);

    // Only one reference and one partner were provided.
    expect(labelsOf(sections, "External Relationships")).toContain(
      "Reference 1",
    );
    expect(labelsOf(sections, "External Relationships")).not.toContain(
      "Reference 2",
    );
    expect(labelsOf(sections, "External Relationships")).not.toContain(
      "Church partner 2",
    );
    expect(labelsOf(sections, "External Relationships")).not.toContain(
      "Negative press detail",
    );
  });
});

describe("references and attestations are visible to staff", () => {
  it("keeps a reference's details together as one entry", () => {
    const sections = buildVettingSections(vetting);

    expect(valueOf(sections, "External Relationships", "Reference 1")).toBe(
      "Reference One · Senior pastor · ref1@example.org · Partner pastor",
    );
  });

  it("shows the attestations and who signed them", () => {
    const sections = buildVettingSections(vetting);

    expect(
      valueOf(
        sections,
        "Documents & Attestation",
        "Information is accurate and complete",
      ),
    ).toBe("Confirmed");
    expect(valueOf(sections, "Documents & Attestation", "Signatory")).toBe(
      "Jordan Pilot",
    );
    expect(valueOf(sections, "Documents & Attestation", "Signed")).toBe(
      "2026-09-20",
    );
  });

  it("falls back to the stored answers when the columns are not populated", () => {
    const legacy = buildVettingSections({
      ...vetting,
      attestation_name: null,
      attestation_signed_at: null,
      attestation_title: null,
      attests_information_is_true: null,
    } as VettingRow);

    expect(
      valueOf(
        legacy,
        "Documents & Attestation",
        "Information is accurate and complete",
      ),
    ).toBe("Confirmed");
    expect(valueOf(legacy, "Documents & Attestation", "Signatory")).toBe(
      "Jordan Pilot",
    );
  });
});

describe("this projection is evidence only", () => {
  it("contains no score, risk, AI or reviewer material", () => {
    const rendered = JSON.stringify(
      buildVettingSections(vetting),
    ).toLowerCase();

    for (const forbidden of [
      "score_components",
      "risk_flag",
      "hard_stop",
      "ai_summary",
      "reviewer_note",
      "recommendation",
      "tier",
    ]) {
      expect(rendered).not.toContain(forbidden);
    }
  });

  it("emits no raw keys, JSON or placeholder values", () => {
    const sections = buildVettingSections(vetting);
    const rendered = sections
      .flatMap((entry) => entry.rows)
      .map((entry) => `${entry.label}=${entry.value}`)
      .join("|");

    for (const forbidden of [
      "raw_data",
      "[object Object]",
      "undefined",
      "null",
      "application_id",
      "_pct",
    ]) {
      expect(rendered).not.toContain(forbidden);
    }

    for (const entry of sections.flatMap((s) => s.rows)) {
      expect(entry.value.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("retrieval is scoped to a single application", () => {
  function recordingClient(data: unknown) {
    const seen: Record<string, unknown> = {};
    const from = (table: string) => {
      seen.table = table;
      return {
        select: (columns: string) => {
          seen.columns = columns;
          return {
            eq: (column: string, value: string) => {
              seen.column = column;
              seen.value = value;
              return {
                maybeSingle: async () => {
                  seen.single = true;
                  return { data };
                },
              };
            },
          };
        },
      };
    };
    return { from, seen };
  }

  it("reads the canonical table filtered by this application only", async () => {
    const client = recordingClient({ id: "vetting-1" });

    await selectVettingForApplication(client.from, "app-1");

    expect(client.seen).toEqual({
      column: "application_id",
      columns: "*",
      single: true,
      table: "vetting_responses",
      value: "app-1",
    });
  });

  it("never widens the filter for a different application", async () => {
    const client = recordingClient(null);

    await selectVettingForApplication(client.from, "another-application");

    expect(client.seen.column).toBe("application_id");
    expect(client.seen.value).toBe("another-application");
    expect(client.seen.single).toBe(true);
  });

  it("projects only the record it is handed", () => {
    const other = buildVettingSections({
      ...vetting,
      leader_conversion_narrative: "A different ministry's account.",
      raw_data: {
        ...(vetting.raw_data as Record<string, unknown>),
        ref_1_email: "someone-else@example.org",
        ref_1_name: "Another Reference",
      },
    } as VettingRow);
    const rendered = JSON.stringify(other);

    expect(rendered).not.toContain("Reference One");
    expect(rendered).not.toContain("ref1@example.org");
    expect(valueOf(other, "External Relationships", "Reference 1")).toContain(
      "Another Reference",
    );
  });
});

describe("submission timestamp", () => {
  it("reports the submission moment, not the record's creation", () => {
    expect(getVettingSubmittedAt(vetting)).toBe("2026-09-20T10:15:00.000Z");
    expect(getVettingSubmittedAt(null)).toBeNull();
    expect(getVettingSubmittedAt({ submitted_at: null })).toBeNull();
  });
});
