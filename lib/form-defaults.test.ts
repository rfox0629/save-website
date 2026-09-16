import { describe, expect, it } from "vitest";

import {
  UNDEFINED_MARKER,
  isMissingValue,
  mergeFormDefaults,
  toActionableMessage,
} from "@/lib/form-defaults";
import { inquiryDefaultValues } from "@/lib/inquiry";
import { vettingDefaultValues } from "@/lib/vetting";

describe("isMissingValue", () => {
  it("treats undefined, null and the RSC marker as missing", () => {
    expect(isMissingValue(undefined)).toBe(true);
    expect(isMissingValue(null)).toBe(true);
    expect(isMissingValue(UNDEFINED_MARKER)).toBe(true);
  });

  it("treats real values, including falsy ones, as present", () => {
    expect(isMissingValue("")).toBe(false);
    expect(isMissingValue(0)).toBe(false);
    expect(isMissingValue(false)).toBe(false);
    expect(isMissingValue([])).toBe(false);
  });
});

describe("mergeFormDefaults", () => {
  it("keeps server-provided values", () => {
    const merged = mergeFormDefaults(inquiryDefaultValues, {
      ein: "99-9999999",
      legal_name: "SAVE Pilot Test Ministry",
    });

    expect(merged.legal_name).toBe("SAVE Pilot Test Ministry");
    expect(merged.ein).toBe("99-9999999");
  });

  it("does not let undefined values overwrite schema defaults", () => {
    const merged = mergeFormDefaults(inquiryDefaultValues, {
      legal_name: undefined,
      state_of_incorporation: undefined,
      geographic_scope: undefined,
    });

    // The exact regression: "" became undefined and the enums were wiped.
    expect(merged.legal_name).toBe("");
    expect(merged.state_of_incorporation).toBe("Alabama");
    expect(merged.geographic_scope).toBe("Local");
  });

  it('does not let the serialised "$undefined" marker become a value', () => {
    const merged = mergeFormDefaults(inquiryDefaultValues, {
      legal_name: UNDEFINED_MARKER as unknown as string,
      entity_type:
        UNDEFINED_MARKER as unknown as (typeof inquiryDefaultValues)["entity_type"],
    });

    expect(merged.legal_name).toBe("");
    expect(merged.entity_type).toBe("501(c)(3)");
    expect(merged.legal_name).not.toBe(UNDEFINED_MARKER);
    expect(merged.entity_type).not.toBe(UNDEFINED_MARKER);
  });

  it("keeps array defaults when the server omits them", () => {
    const merged = mergeFormDefaults(inquiryDefaultValues, {
      countries: undefined,
      funding_sources: undefined,
      primary_focus: undefined,
    });

    expect(merged.countries).toEqual([]);
    expect(merged.funding_sources).toEqual([]);
    expect(merged.primary_focus).toEqual([]);
  });

  it("preserves an explicitly empty selection from the server", () => {
    const merged = mergeFormDefaults(inquiryDefaultValues, {
      primary_focus: [],
    });

    expect(merged.primary_focus).toEqual([]);
  });

  it("mutates neither argument", () => {
    const initial = { legal_name: "Kept" };
    const defaultsSnapshot = { ...inquiryDefaultValues };

    mergeFormDefaults(inquiryDefaultValues, initial);

    expect(inquiryDefaultValues).toEqual(defaultsSnapshot);
    expect(initial).toEqual({ legal_name: "Kept" });
  });

  it("returns defaults when initialValues is absent", () => {
    expect(mergeFormDefaults(inquiryDefaultValues, null)).toEqual(
      inquiryDefaultValues,
    );
    expect(mergeFormDefaults(inquiryDefaultValues, undefined)).toEqual(
      inquiryDefaultValues,
    );
  });

  // The vetting form shares this helper, so the same defect cannot recur there.
  it("protects vetting defaults from undefined values", () => {
    const merged = mergeFormDefaults(vettingDefaultValues, {
      leader_accountability: undefined,
      board_meeting_frequency: undefined,
    });

    expect(merged.leader_accountability).toBe(
      vettingDefaultValues.leader_accountability,
    );
    expect(merged.board_meeting_frequency).toBe(
      vettingDefaultValues.board_meeting_frequency,
    );
  });
});

describe("toActionableMessage", () => {
  it("replaces raw Zod type output with actionable guidance", () => {
    const raw = "Invalid input: expected string, received undefined";

    expect(toActionableMessage(raw, "Legal name")).toBe(
      "Legal name is required. Contact SAVE if this field is empty and you cannot edit it.",
    );
    expect(toActionableMessage(raw)).toBe(
      "This field is required. Contact SAVE if you cannot edit it.",
    );
    expect(toActionableMessage(raw, "Legal name")).not.toContain("undefined");
  });

  it("leaves authored validation messages untouched", () => {
    expect(toActionableMessage("Legal name is required.", "Legal name")).toBe(
      "Legal name is required.",
    );
    expect(toActionableMessage("Use EIN format XX-XXXXXXX.", "EIN")).toBe(
      "Use EIN format XX-XXXXXXX.",
    );
  });
});
