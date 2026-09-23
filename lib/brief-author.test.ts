import { describe, expect, it } from "vitest";

import { canApproveBrief, resolveBriefAuthorId } from "@/lib/brief-author";

/**
 * Finding L: the gate was `generated_by === approver`. A null author made that
 * comparison false, so an authorless brief could be approved by anyone and the
 * two-person requirement vanished exactly when authorship was missing.
 */

const AUTHOR = "author-1";
const OTHER = "reviewer-2";

describe("who counts as the author", () => {
  it("prefers the live identity", () => {
    expect(
      resolveBriefAuthorId({
        generated_actor_id: "snap",
        generated_by: AUTHOR,
      }),
    ).toBe(AUTHOR);
  });

  it("falls back to the snapshot once the live identity has gone", () => {
    expect(
      resolveBriefAuthorId({ generated_actor_id: AUTHOR, generated_by: null }),
    ).toBe(AUTHOR);
  });

  it("reports no author when neither is recorded", () => {
    expect(
      resolveBriefAuthorId({ generated_actor_id: null, generated_by: null }),
    ).toBeNull();
  });
});

describe("approving a donor brief", () => {
  it("refuses the author approving their own brief", () => {
    const decision = canApproveBrief({ generated_by: AUTHOR }, AUTHOR);

    expect(decision.allowed).toBe(false);
    expect(decision).toMatchObject({
      reason: expect.stringContaining("wrote"),
    });
  });

  it("allows a different reviewer", () => {
    expect(canApproveBrief({ generated_by: AUTHOR }, OTHER)).toEqual({
      allowed: true,
    });
  });

  it("enforces independence against the snapshot when the live author is gone", () => {
    // The author's identity was removed, so `generated_by` is null. The
    // snapshot still names them, and they still cannot approve their own work.
    expect(
      canApproveBrief(
        { generated_actor_id: AUTHOR, generated_by: null },
        AUTHOR,
      ).allowed,
    ).toBe(false);

    expect(
      canApproveBrief(
        { generated_actor_id: AUTHOR, generated_by: null },
        OTHER,
      ),
    ).toEqual({ allowed: true });
  });

  it("refuses an authorless brief rather than letting anyone approve it", () => {
    const decision = canApproveBrief(
      { generated_actor_id: null, generated_by: null },
      OTHER,
    );

    expect(decision.allowed).toBe(false);
    expect(decision).toMatchObject({
      reason: expect.stringContaining("no recorded author"),
    });
  });

  it("lets an active reviewer approve a deactivated author's brief", () => {
    // Deactivation removes capability, not authorship: the brief still has an
    // identified author, so an independent reviewer can still approve it.
    expect(
      canApproveBrief(
        { generated_actor_id: AUTHOR, generated_by: AUTHOR },
        OTHER,
      ),
    ).toEqual({ allowed: true });
  });

  it("refuses when there is no approver at all", () => {
    expect(canApproveBrief({ generated_by: AUTHOR }, null).allowed).toBe(false);
  });
});
