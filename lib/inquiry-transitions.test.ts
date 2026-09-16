import { describe, expect, it } from "vitest";

import {
  getAllowedInquiryTargets,
  isBlockedInquiryTransition,
} from "@/lib/inquiry-workflow";

/**
 * The generic status control must not be a way around the inquiry gateway.
 * `updateApplicationStatus` calls `isBlockedInquiryTransition` before it
 * writes, so these cases describe what the server refuses — not what the
 * interface happens to show.
 */

const LATER_STAGE_STATUSES = [
  "under_review",
  "vetting_submitted",
  "approved",
  "declined",
  "hard_stop",
  "decided",
];

describe("server-side inquiry transition rules", () => {
  it("refuses every later-stage status while an inquiry is unapproved", () => {
    for (const from of ["inquiry_submitted", "more_info_requested"]) {
      for (const to of LATER_STAGE_STATUSES) {
        expect(isBlockedInquiryTransition(from, to)).toBe(true);
      }
    }
  });

  it("names inquiry_approved as the only route into assessment", () => {
    expect(getAllowedInquiryTargets()).toEqual(
      expect.arrayContaining([
        "inquiry_approved",
        "inquiry_rejected",
        "more_info_requested",
        "inquiry_submitted",
      ]),
    );
    expect(getAllowedInquiryTargets()).not.toContain("under_review");
    expect(getAllowedInquiryTargets()).not.toContain("declined");
  });

  it("permits the inquiry stage's own moves", () => {
    for (const to of getAllowedInquiryTargets()) {
      expect(isBlockedInquiryTransition("inquiry_submitted", to)).toBe(false);
      expect(isBlockedInquiryTransition("more_info_requested", to)).toBe(false);
    }
  });

  it("does not touch transitions once an inquiry has been approved", () => {
    for (const to of LATER_STAGE_STATUSES) {
      expect(isBlockedInquiryTransition("inquiry_approved", to)).toBe(false);
      expect(isBlockedInquiryTransition("under_review", to)).toBe(false);
      expect(isBlockedInquiryTransition("vetting_submitted", to)).toBe(false);
    }
  });

  it("uses inquiry_rejected for an inquiry decline, never declined", () => {
    // `declined` stays reserved for the assessment/recommendation lifecycle.
    expect(getAllowedInquiryTargets()).toContain("inquiry_rejected");
    expect(isBlockedInquiryTransition("inquiry_submitted", "declined")).toBe(
      true,
    );
  });

  it("ignores an unknown or missing status rather than blocking everything", () => {
    expect(isBlockedInquiryTransition(null, "under_review")).toBe(false);
    expect(isBlockedInquiryTransition(undefined, "approved")).toBe(false);
    expect(isBlockedInquiryTransition("something_else", "approved")).toBe(
      false,
    );
  });
});
