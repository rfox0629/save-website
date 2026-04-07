import type { NormalizedVetting } from "@/lib/scoring/types";
import { createComponent, type CategoryScoreResult } from "@/lib/scoring/types";

function countValidReferences(references: NormalizedVetting["references"]) {
  return references.filter((reference) =>
    Boolean(reference.name?.trim() && reference.email?.trim()),
  ).length;
}

export function scoreExternal(vetting: NormalizedVetting): CategoryScoreResult {
  const ecfaScore = vetting.ecfa_member ? (vetting.ecfa_lapsed ? 1 : 4) : 0;
  const validReferences = countValidReferences(vetting.references);
  const referenceScore =
    validReferences >= 3 ? 3 : validReferences >= 2 ? 2 : validReferences;
  const pressScore = vetting.negative_press ? 0 : 1;
  const irsCleanScore = 2;

  const components = [
    createComponent(
      "external",
      "ecfa_membership",
      ecfaScore,
      4,
      vetting.ecfa_member
        ? vetting.ecfa_lapsed
          ? "Accountability membership exists but appears lapsed."
          : "Active accountability membership was reported."
        : "No accountability membership was reported.",
    ),
    createComponent(
      "external",
      "references",
      referenceScore,
      3,
      `${validReferences} valid external references were provided.`,
    ),
    createComponent(
      "external",
      "negative_press",
      pressScore,
      1,
      vetting.negative_press
        ? "Negative press was disclosed."
        : "No negative press was disclosed.",
    ),
    createComponent(
      "external",
      "irs_clean",
      irsCleanScore,
      2,
      "Default IRS/external-check credit applied pending analyst review.",
    ),
  ];

  return {
    components,
    flags: [],
    max: 10,
    score: components.reduce(
      (sum, component) => sum + component.awarded_points,
      0,
    ),
  };
}
