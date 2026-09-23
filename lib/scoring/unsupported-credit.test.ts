import { describe, expect, it } from "vitest";

import { scoreDoctrine } from "@/lib/scoring/categories/doctrine";
import {
  scoreExternal,
  scoreIrsVerification,
} from "@/lib/scoring/categories/external";
import { scoreFinancial } from "@/lib/scoring/categories/financial";
import { scoreFruit } from "@/lib/scoring/categories/fruit";
import { scoreGovernance } from "@/lib/scoring/categories/governance";
import { scoreLeadership } from "@/lib/scoring/categories/leadership";
import type {
  CategoryScoreResult,
  NormalizedInquiry,
  NormalizedVetting,
} from "@/lib/scoring/types";

/**
 * Two components awarded points for judgements nobody had made, and said so in
 * their own rationales: "pending manual review" and "pending analyst review".
 * One of them granted clean IRS credit to a ministry whose IRS check had
 * flagged its EIN as not found — SAVE's score contradicting SAVE's evidence.
 *
 * A pending judgment is not positive evidence.
 */

function component(result: CategoryScoreResult, criterion: string) {
  return result.components.find((entry) => entry.criterion === criterion);
}

// The disposable pilot exactly as submitted, so the recompute is the real one.
const pilotInquiry: NormalizedInquiry = {
  audit_level: "No audit",
  board_approved_budget: true,
  board_size: 4,
  doctrinal_statement_public: "yes",
  gospel_clarity: "Faith alone in Christ alone",
  scripture_position: "Inerrant",
};

const pilotVetting: NormalizedVetting = {
  annual_ed_review: true,
  board_confrontation_willingness: 4,
  board_meeting_frequency: "Quarterly",
  board_size: 4,
  compensation_set_by_board: true,
  conflict_of_interest_policy: true,
  decision_making_model: "Board approval required",
  ecfa_lapsed: true,
  ecfa_member: true,
  family_on_board: true,
  fruit_self_score: 4,
  independent_board_count: 3,
  leader_accountability: "Yes formal",
  leader_marital_status: "Married and stable",
  leadership_conflict_notes:
    "In 2023 a regional director and the executive director disagreed over the pace of national staff handover. The board appointed two outside elders to mediate, heard both parties separately, and adopted a revised three-year transition plan.",
  negative_press: false,
  overhead_expense_pct: 18,
  program_expense_pct: 82,
  recent_deficit: true,
  references: [
    {
      email: "m.achebe@example.edu",
      name: "Dr. Miriam Achebe",
      relationship: "Former seminary advisor",
      role: "Professor",
    },
    {
      email: "t.lindgren@example.org",
      name: "Rev. Thomas Lindgren",
      relationship: "Sending church pastor",
      role: "Senior Pastor",
    },
    {
      email: "a.nwosu@example.org",
      name: "Adaeze Nwosu",
      relationship: "Peer ministry leader",
      role: "Executive Director",
    },
  ],
  reserve_fund_level: "3–6 months",
  restricted_funds_misused: false,
  restricted_funds_tracked: true,
  spiritual_measurement_method:
    "Each household group keeps a simple quarterly record: who is reading scripture regularly, who has been baptized, who has begun leading a group of their own, and who has reconciled a broken relationship. Leaders review these with a mentor twice a year.",
  staff_doctrinal_affirmation: true,
  syncretism_practice: "Never",
  theory_of_change:
    "We believe ordinary believers, not professional staff, are the primary carriers of the gospel. We train household leaders over a nine-month cycle, send them back into their own streets and workplaces, and measure whether those they disciple begin discipling others in turn through ongoing discipleship.",
  third_party_evaluation: false,
  whistleblower_policy: true,
};

// What the pipeline actually recorded for the pilot.
const pilotChecks = [
  { source: "irs_teos", status: "flag" },
  { source: "website", status: "flag" },
  { source: "bylaws_analysis", status: "flag" },
  { source: "doctrinal_analysis", status: "flag" },
  { source: "news_search", status: "pass" },
  { source: "990_analysis", status: "pass" },
  { source: "ecfa_search", status: "not_applicable" },
  { source: "charity_navigator", status: "not_applicable" },
];

describe("a pending reviewer judgment earns nothing", () => {
  it("awards no honesty credit before a reviewer has assessed it", () => {
    const honesty = component(scoreFruit(pilotVetting), "self_score_honesty");

    expect(honesty?.awarded_points).toBe(0);
    expect(honesty?.max_points).toBe(3);
    expect(honesty?.rationale).toMatch(/not yet completed/i);
  });

  it("never describes the missing judgment as credit already given", () => {
    const honesty = component(scoreFruit(pilotVetting), "self_score_honesty");

    expect(honesty?.rationale).not.toMatch(/default|applied/i);
  });
});

describe("IRS credit follows SAVE's own check", () => {
  it("gives nothing when verification has not been established", () => {
    expect(scoreIrsVerification([]).points).toBe(0);
    expect(scoreIrsVerification([]).rationale).toMatch(/not been established/i);
    expect(
      scoreIrsVerification([{ source: "irs_teos", status: "pending" }]).points,
    ).toBe(0);
  });

  it("refuses credit when the check returned adverse evidence", () => {
    const flagged = scoreIrsVerification([
      { source: "irs_teos", status: "flag" },
    ]);

    expect(flagged.points).toBe(0);
    expect(flagged.rationale).toMatch(/adverse/i);
    expect(
      scoreIrsVerification([{ source: "irs_teos", status: "fail" }]).points,
    ).toBe(0);
  });

  it("gives credit only for a check that actually passed", () => {
    expect(
      scoreIrsVerification([{ source: "irs_teos", status: "pass" }]).points,
    ).toBe(2);
  });

  it("does not treat another source's pass as IRS standing", () => {
    expect(
      scoreIrsVerification([{ source: "news_search", status: "pass" }]).points,
    ).toBe(0);
  });

  it("scores the pilot's flagged EIN at zero rather than clean", () => {
    const irs = component(
      scoreExternal(pilotVetting, pilotChecks),
      "irs_clean",
    );

    expect(irs?.awarded_points).toBe(0);
  });
});

describe("the submitted pilot recomputes to 78", () => {
  it("totals 78 of 100 once unsupported credit is removed", () => {
    const categories = [
      scoreLeadership(pilotVetting),
      scoreDoctrine(pilotVetting, pilotInquiry),
      scoreGovernance(pilotVetting),
      scoreFinancial(pilotVetting, pilotInquiry),
      scoreFruit(pilotVetting),
      scoreExternal(pilotVetting, pilotChecks),
    ];
    const total = categories.reduce((sum, category) => sum + category.score, 0);
    const max = categories.reduce((sum, category) => sum + category.max, 0);

    expect(max).toBe(100);
    expect(total).toBe(78);
  });

  it("removes exactly the five unsupported points and nothing else", () => {
    // The repair corrects two components. Every other component keeps the value
    // it had at the 83/100 baseline.
    const fruit = scoreFruit(pilotVetting);
    const external = scoreExternal(pilotVetting, pilotChecks);

    expect(fruit.score).toBe(13);
    expect(external.score).toBe(5);
    expect(component(external, "references")?.awarded_points).toBe(3);
    expect(component(external, "ecfa_membership")?.awarded_points).toBe(1);
    expect(component(fruit, "theory_of_change")?.awarded_points).toBe(5);
  });
});
