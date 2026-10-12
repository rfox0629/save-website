import { describe, expect, it } from "vitest";

import { canApproveBrief } from "@/lib/brief-author";
import {
  assertReviewNote,
  canPublish,
  canRecordDecision,
  getReviewStatus,
} from "@/lib/brief-review";
import { assertSaveDecision } from "@/lib/decision-shared";
import { toActorIdentity } from "@/lib/attribution";

/**
 * The lifecycle this pilot showed was missing: a reviewer's proposal, an
 * independent review of it, SAVE's formal decision, and publication were all
 * collapsed into one approval flag and a status dropdown.
 */

describe("independent review outcomes", () => {
  it("distinguishes never reviewed from reviewed and changes requested", () => {
    expect(getReviewStatus(null)).toBe("not_reviewed");
    expect(getReviewStatus({ review_outcome: null })).toBe("not_reviewed");
    expect(getReviewStatus({ review_outcome: "changes_requested" })).toBe(
      "changes_requested",
    );
  });

  it("treats an approved brief as approved", () => {
    expect(
      getReviewStatus({ approved_at: "2026-09-24T00:00:00Z", review_outcome: "approved" }),
    ).toBe("approved");
  });

  it("does not treat a request for changes as approval", () => {
    expect(
      getReviewStatus({
        approved_at: null,
        review_outcome: "changes_requested",
      }),
    ).not.toBe("approved");
  });

  it("requires a reason when changes are requested", () => {
    expect(() => assertReviewNote("")).toThrow(/reason/i);
    expect(() => assertReviewNote("   ")).toThrow(/reason/i);
    expect(assertReviewNote("  The fruit claim is overstated.  ")).toBe(
      "The fruit claim is overstated.",
    );
  });

  it("keeps the author out of the reviewer's seat", () => {
    const brief = { generated_actor_id: "author", generated_by: "author" };

    expect(canApproveBrief(brief, "author").allowed).toBe(false);
    expect(canApproveBrief(brief, "someone-else").allowed).toBe(true);
  });

  it("fails closed on an authorless brief", () => {
    expect(
      canApproveBrief({ generated_actor_id: null, generated_by: null }, "anyone")
        .allowed,
    ).toBe(false);
  });

  /**
   * After a request for changes the author revises. The revision clears the
   * outcome, so the brief is waiting on a fresh review rather than carrying a
   * stale verdict.
   */
  it("returns a revised brief to awaiting review", () => {
    const afterRevision = { approved_at: null, review_outcome: null };

    expect(getReviewStatus(afterRevision)).toBe("not_reviewed");
    expect(canRecordDecision(afterRevision).allowed).toBe(false);
  });
});

describe("formal SAVE decision", () => {
  const approved = {
    approved_at: "2026-09-24T00:00:00Z",
    review_outcome: "approved",
  };

  it("is unavailable until a second reviewer has approved", () => {
    expect(canRecordDecision(null).allowed).toBe(false);
    expect(
      canRecordDecision({ review_outcome: "changes_requested" }).allowed,
    ).toBe(false);
    expect(canRecordDecision(approved).allowed).toBe(true);
  });

  it("accepts only an explicit decision", () => {
    expect(assertSaveDecision("approved")).toBe("approved");
    expect(assertSaveDecision("declined")).toBe("declined");
    expect(() => assertSaveDecision("78")).toThrow();
    expect(() => assertSaveDecision("Recommended with Conditions")).toThrow();
    expect(() => assertSaveDecision(null)).toThrow();
  });

  /**
   * A score is not a decision. There is no path from a number to a recorded
   * judgement — someone has to make it.
   */
  it("cannot be derived from a score", () => {
    expect(() => assertSaveDecision(78)).toThrow();
    expect(() => assertSaveDecision("advance")).toThrow();
  });
});

describe("publication", () => {
  const approved = {
    approved_at: "2026-09-24T00:00:00Z",
    review_outcome: "approved",
  };

  it("needs both an approved brief and a recorded decision", () => {
    expect(canPublish({ brief: approved, decision: null }).allowed).toBe(false);
    expect(canPublish({ brief: null, decision: "approved" }).allowed).toBe(false);
    expect(canPublish({ brief: approved, decision: "approved" }).allowed).toBe(
      true,
    );
  });

  it("does not follow from approval alone", () => {
    expect(canPublish({ brief: approved, decision: undefined }).allowed).toBe(
      false,
    );
  });

  it("does not follow from a decision alone", () => {
    expect(
      canPublish({
        brief: { review_outcome: "changes_requested" },
        decision: "approved",
      }).allowed,
    ).toBe(false);
  });
});

describe("staff display names", () => {
  const user = { email: "reviewer@savestandard.org", id: "user-1" };

  it("prefers the profile field over auth metadata", () => {
    expect(
      toActorIdentity(
        { ...user, user_metadata: { full_name: "Stale Metadata Name" } },
        { display_name: "Current Profile Name" },
      ).name,
    ).toBe("Current Profile Name");
  });

  it("falls back to auth metadata when the profile has none", () => {
    expect(
      toActorIdentity(
        { ...user, user_metadata: { full_name: "Metadata Name" } },
        { display_name: null },
      ).name,
    ).toBe("Metadata Name");
  });

  it("stays null rather than inventing a name", () => {
    expect(toActorIdentity(user, null).name).toBeNull();
  });

  it("keeps the email and id regardless", () => {
    const identity = toActorIdentity(user, { display_name: "A Reviewer" });

    expect(identity.email).toBe("reviewer@savestandard.org");
    expect(identity.id).toBe("user-1");
  });
});
