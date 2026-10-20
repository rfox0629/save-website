import { describe, expect, it } from "vitest";

import { assertDisplayName } from "@/lib/staff-profile-shared";
import { toActorIdentity } from "@/lib/attribution";

/**
 * Attribution prefers `profiles.display_name`, but nothing captured one: staff
 * are provisioned directly in the database, so every new staff account produced
 * snapshots naming only an email. A snapshot is written at the moment of the
 * action and never afterwards, so a name supplied later cannot improve what is
 * already recorded.
 */

describe("display name validation", () => {
  it("trims what a staff member types", () => {
    expect(assertDisplayName("  Ada Okonkwo  ")).toBe("Ada Okonkwo");
  });

  it("refuses an empty name rather than storing a blank", () => {
    expect(() => assertDisplayName("")).toThrow(/cannot be empty/i);
    expect(() => assertDisplayName("   ")).toThrow(/cannot be empty/i);
    expect(() => assertDisplayName(null)).toThrow(/cannot be empty/i);
    expect(() => assertDisplayName(42)).toThrow(/cannot be empty/i);
  });

  it("refuses an absurdly long name", () => {
    expect(() => assertDisplayName("a".repeat(121))).toThrow(/120/);
    expect(assertDisplayName("a".repeat(120))).toHaveLength(120);
  });
});

describe("what a provisioned staff member's actions record", () => {
  const user = { email: "reviewer@savestandard.org", id: "user-1" };

  it("names the person once a display name exists", () => {
    expect(toActorIdentity(user, { display_name: "Ada Okonkwo" }).name).toBe(
      "Ada Okonkwo",
    );
  });

  /**
   * The state the constraint now prevents at provisioning: an active staff
   * member whose every action is attributed to an email alone.
   */
  it("records only an email when no display name was ever set", () => {
    const identity = toActorIdentity(user, { display_name: null });

    expect(identity.name).toBeNull();
    expect(identity.email).toBe("reviewer@savestandard.org");
  });

  it("ignores a blank display name rather than recording whitespace", () => {
    expect(toActorIdentity(user, { display_name: "   " }).name).toBeNull();
  });
});
