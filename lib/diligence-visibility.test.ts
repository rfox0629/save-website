import { describe, expect, it } from "vitest";

import { buildDiligencePayload } from "@/lib/diligence-shared";

/**
 * The donor excerpt is the only part of a relational-diligence engagement a
 * donor can ever read. The form hides the field whenever visibility is
 * internal-only, which means a stale value can reach the server without any
 * reviewer having seen it. The invariant therefore has to hold in the payload
 * builder, not in the UI.
 */

describe("donor excerpt visibility invariant", () => {
  it("keeps the excerpt on a shareable engagement", () => {
    const payload = buildDiligencePayload({
      donorExcerpt: "SAVE spent time with this leadership where they work.",
      kind: "onsite_visit",
      visibility: "summary_shareable",
    });

    expect(payload.visibility).toBe("summary_shareable");
    expect(payload.donor_excerpt).toBe(
      "SAVE spent time with this leadership where they work.",
    );
  });

  it("drops a donor excerpt submitted on an internal-only engagement", () => {
    const payload = buildDiligencePayload({
      donorExcerpt: "SAVE shared a meal in a volunteer's home.",
      kind: "reference_conversation",
      visibility: "internal_only",
    });

    expect(payload.visibility).toBe("internal_only");
    expect(payload.donor_excerpt).toBeNull();
  });

  it("drops the excerpt when no visibility is supplied at all", () => {
    const payload = buildDiligencePayload({
      donorExcerpt: "Copy written for donors.",
      kind: "video_call",
    });

    expect(payload.visibility).toBe("internal_only");
    expect(payload.donor_excerpt).toBeNull();
  });

  /**
   * The exact pilot defect: a reviewer wrote a donor excerpt for a shared meal,
   * saved it, then recorded an internal-only reference conversation. The form
   * retained the excerpt and hid the field, so the meal's donor-facing copy was
   * submitted into an engagement that must never carry any.
   */
  it("does not let one engagement's excerpt leak into the next", () => {
    const mealExcerpt =
      "SAVE shared a meal in a volunteer's home. The people this ministry serves know its leader personally.";

    const meal = buildDiligencePayload({
      donorExcerpt: mealExcerpt,
      kind: "shared_meal",
      visibility: "summary_shareable",
    });

    // The reviewer never retyped this; it is the stale state the form kept.
    const referenceConversation = buildDiligencePayload({
      donorExcerpt: mealExcerpt,
      kind: "reference_conversation",
      visibility: "internal_only",
    });

    expect(meal.donor_excerpt).toBe(mealExcerpt);
    expect(referenceConversation.donor_excerpt).toBeNull();
  });

  it("clears the excerpt when an engagement is switched back to internal-only", () => {
    const shareable = buildDiligencePayload({
      donorExcerpt: "Written for donors.",
      kind: "onsite_visit",
      visibility: "summary_shareable",
    });
    const retracted = buildDiligencePayload({
      donorExcerpt: "Written for donors.",
      kind: "onsite_visit",
      visibility: "internal_only",
    });

    expect(shareable.donor_excerpt).not.toBeNull();
    expect(retracted.donor_excerpt).toBeNull();
  });
});

describe("follow-up items", () => {
  it("records follow-up items supplied by the reviewer", () => {
    const payload = buildDiligencePayload({
      followUps: ["Ask for the succession plan", "Request 2025 bank statements"],
      kind: "onsite_visit",
    });

    expect(payload.follow_ups).toEqual([
      "Ask for the succession plan",
      "Request 2025 bank statements",
    ]);
  });

  it("defaults to no follow-up items", () => {
    expect(buildDiligencePayload({ kind: "onsite_visit" }).follow_ups).toEqual(
      [],
    );
  });
});
