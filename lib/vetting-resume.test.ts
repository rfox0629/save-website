import { describe, expect, it } from "vitest";

import { resolveResumeStep } from "@/lib/vetting-resume";
import { vettingStepTitles, type VettingFormValues } from "@/lib/vetting";

/**
 * Resume regression: a part-finished application used to reopen at step 1
 * however much had been saved, so the ministry clicked Next seven times to
 * reach its place. The step is derived from the saved answers themselves.
 */

const leadership: Partial<VettingFormValues> = {
  board_confrontation_willingness: 4,
  compensation_set_by_board: true,
  decision_making_model: "Board approval required",
  leader_accountability: "Yes, formal structure",
  leader_conversion_narrative: "A".repeat(60),
  leader_marital_status: "Married and stable",
  leadership_conflict_notes: "None.",
};

describe("where an unfinished application reopens", () => {
  it("starts at the beginning when nothing has been saved", () => {
    expect(resolveResumeStep({})).toBe(0);
    expect(resolveResumeStep(null)).toBe(0);
    expect(resolveResumeStep(undefined)).toBe(0);
  });

  it("stays on the first step while it is still incomplete", () => {
    expect(
      resolveResumeStep({ leader_marital_status: "Married and stable" }),
    ).toBe(0);
  });

  it("moves past a step once its answers satisfy it", () => {
    expect(resolveResumeStep(leadership)).toBeGreaterThan(0);
  });

  it("never points past the last step", () => {
    expect(resolveResumeStep(leadership)).toBeLessThanOrEqual(
      vettingStepTitles.length - 1,
    );
  });

  it("returns an index that addresses a real step", () => {
    const step = resolveResumeStep(leadership);

    expect(Number.isInteger(step)).toBe(true);
    expect(vettingStepTitles[step]).toBeTruthy();
  });
});
