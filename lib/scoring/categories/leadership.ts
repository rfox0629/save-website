import type { NormalizedVetting } from "@/lib/scoring/types";
import {
  createComponent,
  createFlag,
  type CategoryScoreResult,
} from "@/lib/scoring/types";

export function scoreLeadership(
  vetting: NormalizedVetting,
): CategoryScoreResult {
  const accountabilityScore =
    vetting.leader_accountability === "Yes formal"
      ? 5
      : vetting.leader_accountability === "Yes informal"
        ? 2
        : 0;
  const compensationScore = vetting.compensation_set_by_board ? 4 : 0;
  const decisionScore =
    vetting.decision_making_model === "Elder plurality" ||
    vetting.decision_making_model === "Board approval required"
      ? 4
      : vetting.decision_making_model === "Lead pastor with staff"
        ? 2
        : 0;
  const maritalScore =
    vetting.leader_marital_status === "Married and stable" ||
    vetting.leader_marital_status === "Single"
      ? 4
      : vetting.leader_marital_status === "Divorced prior to ministry"
        ? 2
        : 0;
  const conflictScore = vetting.leadership_conflict_notes?.trim()
    ? (vetting.board_confrontation_willingness ?? 0) >= 4
      ? 3
      : 1
    : 0;

  const flags = [];

  if ((vetting.board_confrontation_willingness ?? 0) <= 2) {
    flags.push(
      createFlag(
        "medium",
        "leadership",
        "low_board_confrontation_willingness",
        "Board confrontation willingness is low or lacks a clear accountability mechanism.",
      ),
    );
  }

  if (vetting.leader_accountability === "No") {
    flags.push(
      createFlag(
        "high",
        "leadership",
        "no_leader_accountability",
        "Leadership reported no meaningful accountability structure.",
      ),
    );
  }

  const components = [
    createComponent(
      "leadership",
      "leader_accountability",
      accountabilityScore,
      5,
      vetting.leader_accountability ??
        "No accountability details were provided.",
    ),
    createComponent(
      "leadership",
      "compensation_set_by_board",
      compensationScore,
      4,
      vetting.compensation_set_by_board
        ? "Board oversight sets executive compensation."
        : "Board oversight for compensation was not confirmed.",
    ),
    createComponent(
      "leadership",
      "decision_making_model",
      decisionScore,
      4,
      vetting.decision_making_model ?? "No decision-making model was provided.",
    ),
    createComponent(
      "leadership",
      "leader_marital_status",
      maritalScore,
      4,
      vetting.leader_marital_status ?? "Marital status was not provided.",
    ),
    createComponent(
      "leadership",
      "leadership_conflict_notes",
      conflictScore,
      3,
      vetting.leadership_conflict_notes?.trim()
        ? "Leadership conflict notes were provided for review."
        : "No leadership conflict notes were provided.",
    ),
  ];

  return {
    components,
    flags,
    max: 20,
    score: components.reduce(
      (sum, component) => sum + component.awarded_points,
      0,
    ),
  };
}
