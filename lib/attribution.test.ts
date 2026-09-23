import { describe, expect, it } from "vitest";

import {
  buildActorSnapshot,
  readActorName,
  toActorIdentity,
} from "@/lib/attribution";

/**
 * Finding G: a staff member leaving SAVE must not make a historical action
 * anonymous. The snapshot is written at the action and never afterwards.
 */

describe("capturing who acted", () => {
  it("records id, name and email under the action's own prefix", () => {
    expect(
      buildActorSnapshot("generated", {
        email: "reviewer@savestandard.org",
        id: "user-1",
        name: "Alex Reviewer",
      }),
    ).toEqual({
      generated_actor_email: "reviewer@savestandard.org",
      generated_actor_id: "user-1",
      generated_actor_name: "Alex Reviewer",
    });
  });

  it("writes nothing at all when there is no actor", () => {
    // An absent snapshot is honest; an invented one is not.
    expect(buildActorSnapshot("approved", null)).toEqual({});
    expect(buildActorSnapshot("approved", undefined)).toEqual({});
  });

  it("keeps the email when no display name exists", () => {
    const snapshot = buildActorSnapshot("resolved", {
      email: "staff@savestandard.org",
      id: "user-2",
      name: null,
    });

    expect(snapshot.resolved_actor_name).toBeNull();
    expect(snapshot.resolved_actor_email).toBe("staff@savestandard.org");
    expect(snapshot.resolved_actor_id).toBe("user-2");
  });

  it("reads a display name from whichever key the provider used", () => {
    expect(readActorName({ full_name: "Full Name" })).toBe("Full Name");
    expect(readActorName({ name: "Name" })).toBe("Name");
    expect(readActorName({ display_name: "Display" })).toBe("Display");
    expect(readActorName({ full_name: "   " })).toBeNull();
    expect(readActorName(null)).toBeNull();
    expect(readActorName({})).toBeNull();
  });

  it("builds an identity from the authenticated user", () => {
    expect(
      toActorIdentity({
        email: "staff@savestandard.org",
        id: "user-3",
        user_metadata: { full_name: "Staff Member" },
      }),
    ).toEqual({
      email: "staff@savestandard.org",
      id: "user-3",
      name: "Staff Member",
    });
  });

  it("does not invent a name for a user who has none", () => {
    expect(toActorIdentity({ email: null, id: "user-4" })).toEqual({
      email: null,
      id: "user-4",
      name: null,
    });
  });
});
