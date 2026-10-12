/**
 * SAVE's formal assessment decision.
 *
 * Only two values, and neither can be produced by a calculation. The score
 * measures what a rubric can measure; the brief carries a reviewer's proposed
 * recommendation. A decision is SAVE putting its name to a judgement, so it has
 * to be made by a person and recorded explicitly.
 */

export const SAVE_DECISIONS = ["approved", "declined"] as const;

export type SaveDecision = (typeof SAVE_DECISIONS)[number];

export function assertSaveDecision(value: unknown): SaveDecision {
  if (
    typeof value !== "string" ||
    !SAVE_DECISIONS.includes(value as SaveDecision)
  ) {
    throw new Error("A SAVE decision must be either approved or declined.");
  }

  return value as SaveDecision;
}
