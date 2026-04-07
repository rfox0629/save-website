import type { NormalizedVetting } from "@/lib/scoring/types";
import { createComponent, type CategoryScoreResult } from "@/lib/scoring/types";

function scoreFruitSelf(value: number | null) {
  switch (value) {
    case 1:
      return 0;
    case 2:
      return 2;
    case 3:
      return 3;
    case 4:
      return 4;
    case 5:
      return 5;
    default:
      return 0;
  }
}

function hasSpiritualTransformationLanguage(value: string | null) {
  if (!value) {
    return false;
  }

  return /(spiritual transformation|transformation|discipl|gospel|christ|faith)/i.test(
    value,
  );
}

export function scoreFruit(vetting: NormalizedVetting): CategoryScoreResult {
  const fruitSelfScore = scoreFruitSelf(vetting.fruit_self_score);
  const theoryScore =
    (vetting.theory_of_change?.trim().length ?? 0) > 200 &&
    hasSpiritualTransformationLanguage(vetting.theory_of_change)
      ? 5
      : 2;
  const measurementScore =
    (vetting.spiritual_measurement_method?.trim().length ?? 0) > 100 ? 4 : 1;
  const evaluationScore = vetting.third_party_evaluation ? 3 : 0;
  const honestyScore = 3;

  const components = [
    createComponent(
      "fruit",
      "fruit_self_score",
      fruitSelfScore,
      5,
      `Fruit self-score reported as ${vetting.fruit_self_score ?? "not provided"}.`,
    ),
    createComponent(
      "fruit",
      "theory_of_change",
      theoryScore,
      5,
      vetting.theory_of_change?.trim()
        ? "Theory of change was provided."
        : "Theory of change was not provided.",
    ),
    createComponent(
      "fruit",
      "spiritual_measurement_method",
      measurementScore,
      4,
      vetting.spiritual_measurement_method?.trim()
        ? "Spiritual measurement method was provided."
        : "Spiritual measurement method was not provided.",
    ),
    createComponent(
      "fruit",
      "third_party_evaluation",
      evaluationScore,
      3,
      vetting.third_party_evaluation
        ? "A third-party evaluation exists."
        : "No third-party evaluation was disclosed.",
    ),
    createComponent(
      "fruit",
      "self_score_honesty",
      honestyScore,
      3,
      "Default reviewer honesty credit applied pending manual review.",
    ),
  ];

  return {
    components,
    flags: [],
    max: 20,
    score: components.reduce(
      (sum, component) => sum + component.awarded_points,
      0,
    ),
  };
}
