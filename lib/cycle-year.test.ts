import { describe, expect, it } from "vitest";

import {
  CYCLE_ASSIGNMENT_STATUS,
  buildStatusUpdate,
  resolveCycleYear,
  shouldAssignCycleYear,
} from "@/lib/cycle-year";

describe("cycle year assignment point", () => {
  it("assigns only on the staff advance transition", () => {
    expect(CYCLE_ASSIGNMENT_STATUS).toBe("inquiry_approved");
    expect(shouldAssignCycleYear("inquiry_approved", null)).toBe(true);
  });

  it("leaves the cycle year null before staff advancement", () => {
    // A ministry registers and submits: no cycle is assigned by either step.
    expect(shouldAssignCycleYear("inquiry_submitted", null)).toBe(false);
    expect(buildStatusUpdate("inquiry_submitted", null)).toEqual({
      status: "inquiry_submitted",
    });

    // Nor by any later ministry-driven or automated transition.
    for (const status of [
      "vetting_submitted",
      "under_review",
      "more_info_requested",
      "approved",
      "declined",
      "hard_stop",
    ] as const) {
      expect(shouldAssignCycleYear(status, null)).toBe(false);
      expect(buildStatusUpdate(status, null)).toEqual({ status });
    }
  });
});

describe("cycle year value", () => {
  it("uses the calendar year of the advancement, not of submission", () => {
    const advancedAt = new Date("2026-07-04T12:00:00Z");

    expect(resolveCycleYear(advancedAt)).toBe(2026);
    expect(buildStatusUpdate("inquiry_approved", null, advancedAt)).toEqual({
      cycle_year: 2026,
      status: "inquiry_approved",
    });
  });

  it("assigns the advancement year across a December to January boundary", () => {
    // Submitted December 2026, advanced January 2027 => cycle 2027.
    const advancedAt = new Date("2027-01-04T09:30:00");

    expect(buildStatusUpdate("inquiry_approved", null, advancedAt)).toEqual({
      cycle_year: 2027,
      status: "inquiry_approved",
    });

    // And the last day of the old year still belongs to the old cycle.
    const advancedOnNewYearsEve = new Date("2026-12-31T23:00:00");

    expect(
      buildStatusUpdate("inquiry_approved", null, advancedOnNewYearsEve),
    ).toEqual({ cycle_year: 2026, status: "inquiry_approved" });
  });
});

describe("cycle year preservation", () => {
  it("never overwrites an existing assignment", () => {
    const laterAdvance = new Date("2028-03-01T00:00:00Z");

    expect(shouldAssignCycleYear("inquiry_approved", 2026)).toBe(false);
    expect(buildStatusUpdate("inquiry_approved", 2026, laterAdvance)).toEqual({
      status: "inquiry_approved",
    });
  });

  it("keeps the original cycle through every later status change", () => {
    for (const status of [
      "more_info_requested",
      "under_review",
      "approved",
      "declined",
      "hard_stop",
    ] as const) {
      expect(buildStatusUpdate(status, 2026)).toEqual({ status });
    }
  });

  it("treats an explicit zero as assigned rather than missing", () => {
    // Guards against a `!existing` style check silently reassigning.
    expect(shouldAssignCycleYear("inquiry_approved", 0)).toBe(false);
  });
});
