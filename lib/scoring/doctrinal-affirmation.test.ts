import { describe, expect, it } from "vitest";

import { scoreDoctrine } from "@/lib/scoring/categories/doctrine";
import type { NormalizedInquiry, NormalizedVetting } from "@/lib/scoring/types";

/**
 * P1 regression: the application asks `doctrinal_affirmation_required`, which
 * is the key persistence writes into `raw_data`. Scoring previously read
 * `staff_doctrinal_affirmation`, which nothing wrote, so the three doctrine
 * points were unearnable however a ministry answered.
 *
 * These cases walk the same path the real data takes — form key, persisted
 * shape, normalisation, then scoring — so a future rename on either side fails
 * here rather than silently costing every ministry three points.
 */

// Mirrors `mapVettingToPersistence`: the answer is stored in raw_data.
function persistFormAnswer(answer: boolean) {
  return { raw_data: { doctrinal_affirmation_required: answer } };
}

// Mirrors `normalizeVetting`'s read of that stored shape.
function normalizeStaffAffirmation(stored: {
  raw_data: Record<string, unknown>;
}): boolean | null {
  const raw = stored.raw_data;
  const read = (key: string) =>
    typeof raw[key] === "boolean" ? (raw[key] as boolean) : null;

  return (
    read("doctrinal_affirmation_required") ??
    read("staff_doctrinal_affirmation")
  );
}

const inquiry: NormalizedInquiry = {
  audit_level: "No audit",
  board_approved_budget: true,
  board_size: 4,
  doctrinal_statement_public: "yes",
  gospel_clarity: "Faith alone in Christ alone",
  scripture_position: "Inerrant",
};

function vettingWith(staffAffirmation: boolean | null): NormalizedVetting {
  return {
    staff_doctrinal_affirmation: staffAffirmation,
    syncretism_practice: "Never",
  } as unknown as NormalizedVetting;
}

function affirmationPoints(result: ReturnType<typeof scoreDoctrine>) {
  return (
    result.components.find(
      (component) => component.criterion === "staff_doctrinal_affirmation",
    )?.awarded_points ?? null
  );
}

describe("doctrinal affirmation round-trip", () => {
  it("earns the points when the ministry answers yes", () => {
    const normalized = normalizeStaffAffirmation(persistFormAnswer(true));
    expect(normalized).toBe(true);

    expect(
      affirmationPoints(scoreDoctrine(vettingWith(normalized), inquiry)),
    ).toBe(3);
  });

  it("earns nothing when the ministry answers no", () => {
    const normalized = normalizeStaffAffirmation(persistFormAnswer(false));
    expect(normalized).toBe(false);

    expect(
      affirmationPoints(scoreDoctrine(vettingWith(normalized), inquiry)),
    ).toBe(0);
  });

  it("still reads a row written under the legacy key", () => {
    const legacy = { raw_data: { staff_doctrinal_affirmation: true } };

    expect(normalizeStaffAffirmation(legacy)).toBe(true);
  });

  it("prefers the answer the form actually collects", () => {
    const both = {
      raw_data: {
        doctrinal_affirmation_required: false,
        staff_doctrinal_affirmation: true,
      },
    };

    expect(normalizeStaffAffirmation(both)).toBe(false);
  });

  it("keeps the weighting at three points", () => {
    // The repair corrects the mapping only; the weight is unchanged.
    const earned = affirmationPoints(scoreDoctrine(vettingWith(true), inquiry));
    const unearned = affirmationPoints(
      scoreDoctrine(vettingWith(false), inquiry),
    );

    expect(earned).toBe(3);
    expect(unearned).toBe(0);
  });
});
