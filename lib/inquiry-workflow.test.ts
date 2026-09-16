import { describe, expect, it } from "vitest";

import {
  INQUIRY_ACTION_TARGET,
  INQUIRY_RESUBMISSION_STATUS,
  getInquiryAgeAnchor,
  isBlockedInquiryTransition,
  isInquiryAction,
  isInquiryStageStatus,
  planInquiryAction,
} from "@/lib/inquiry-workflow";

describe("inquiry stage", () => {
  it("covers the two statuses where inquiry actions apply", () => {
    expect(isInquiryStageStatus("inquiry_submitted")).toBe(true);
    expect(isInquiryStageStatus("more_info_requested")).toBe(true);
    expect(isInquiryStageStatus("inquiry_approved")).toBe(false);
    expect(isInquiryStageStatus("under_review")).toBe(false);
    expect(isInquiryStageStatus(null)).toBe(false);
  });

  it("recognises only the three staff actions", () => {
    expect(isInquiryAction("approve")).toBe(true);
    expect(isInquiryAction("request_more_info")).toBe(true);
    expect(isInquiryAction("decline")).toBe(true);
    expect(isInquiryAction("under_review")).toBe(false);
    expect(isInquiryAction("")).toBe(false);
  });
});

describe("inquiry_approved is the required gateway", () => {
  it("blocks a direct jump from inquiry to assessment", () => {
    expect(
      isBlockedInquiryTransition("inquiry_submitted", "under_review"),
    ).toBe(true);
    expect(
      isBlockedInquiryTransition("more_info_requested", "under_review"),
    ).toBe(true);
  });

  it("blocks every other later-stage status from the inquiry stage", () => {
    for (const status of [
      "vetting_submitted",
      "approved",
      "declined",
      "hard_stop",
    ]) {
      expect(isBlockedInquiryTransition("inquiry_submitted", status)).toBe(
        true,
      );
    }
  });

  it("allows the inquiry stage's own moves", () => {
    for (const status of [
      "inquiry_approved",
      "inquiry_rejected",
      "more_info_requested",
      "inquiry_submitted",
    ]) {
      expect(isBlockedInquiryTransition("inquiry_submitted", status)).toBe(
        false,
      );
    }
  });

  it("leaves later-stage transitions untouched", () => {
    // Once past the inquiry stage this guard does not apply at all.
    expect(isBlockedInquiryTransition("inquiry_approved", "under_review")).toBe(
      false,
    );
    expect(isBlockedInquiryTransition("under_review", "approved")).toBe(false);
    expect(
      isBlockedInquiryTransition("vetting_submitted", "under_review"),
    ).toBe(false);
  });
});

describe("approve", () => {
  it("advances into assessment and records the event", () => {
    const plan = planInquiryAction("inquiry_submitted", "approve");

    expect(plan.status).toBe("inquiry_approved");
    expect(plan.eventKind).toBe("approved");
  });

  it("can approve an inquiry that answered a request for information", () => {
    expect(planInquiryAction("more_info_requested", "approve").status).toBe(
      "inquiry_approved",
    );
  });

  it("refuses once the application has left the inquiry stage", () => {
    expect(() => planInquiryAction("under_review", "approve")).toThrow(
      /no longer at the inquiry stage/i,
    );
    expect(() => planInquiryAction("approved", "approve")).toThrow();
  });
});

describe("request more information", () => {
  it("requires staff to say what is needed", () => {
    expect(() =>
      planInquiryAction("inquiry_submitted", "request_more_info"),
    ).toThrow(/what information SAVE needs/i);

    expect(() =>
      planInquiryAction("inquiry_submitted", "request_more_info", {
        staffNote: "   ",
      }),
    ).toThrow(/what information SAVE needs/i);
  });

  it("records the request and moves the application", () => {
    const plan = planInquiryAction("inquiry_submitted", "request_more_info", {
      staffNote: "We need your most recent board-approved budget.",
    });

    expect(plan.status).toBe("more_info_requested");
    expect(plan.eventKind).toBe("more_info_requested");
    expect(plan.staffNote).toBe(
      "We need your most recent board-approved budget.",
    );
  });

  it("returns a ministry to the queue as a fresh submission", () => {
    expect(INQUIRY_RESUBMISSION_STATUS).toBe("inquiry_submitted");
  });
});

describe("decline", () => {
  it("uses inquiry_rejected, never the assessment-stage declined", () => {
    const plan = planInquiryAction("inquiry_submitted", "decline", {
      staffNote: "Outside SAVE's current scope.",
    });

    expect(plan.status).toBe("inquiry_rejected");
    expect(plan.eventKind).toBe("rejected");
    expect(INQUIRY_ACTION_TARGET.decline).not.toBe("declined");
  });

  it("requires an internal reason", () => {
    expect(() => planInquiryAction("inquiry_submitted", "decline")).toThrow(
      /internal reason/i,
    );
  });

  it("keeps the ministry-facing explanation separate from the internal reason", () => {
    const plan = planInquiryAction("inquiry_submitted", "decline", {
      ministryMessage: "SAVE is not taking this inquiry into assessment now.",
      staffNote: "Internal: governance too early to assess.",
    });

    expect(plan.staffNote).toBe("Internal: governance too early to assess.");
    expect(plan.ministryMessage).toBe(
      "SAVE is not taking this inquiry into assessment now.",
    );
    expect(plan.ministryMessage).not.toContain("Internal");
  });

  it("treats a blank ministry message as no message rather than an empty one", () => {
    const plan = planInquiryAction("inquiry_submitted", "decline", {
      ministryMessage: "   ",
      staffNote: "Reason recorded.",
    });

    expect(plan.ministryMessage).toBeNull();
  });
});

describe("staff ageing", () => {
  it("measures from the latest submission", () => {
    expect(getInquiryAgeAnchor("2026-09-16T14:46:26.476Z")).toBe(
      "2026-09-16T14:46:26.476Z",
    );
  });

  it("gives an application that was never submitted no age at all", () => {
    // Founder ruling: an inquiry age exists only after a real submission, and
    // never falls back to when the record happened to be created.
    expect(getInquiryAgeAnchor(null)).toBeNull();
    expect(getInquiryAgeAnchor(undefined)).toBeNull();
  });

  it("uses the resubmission once a ministry answers a request", () => {
    const resubmitted = "2026-10-02T09:15:00.000Z";

    expect(getInquiryAgeAnchor(resubmitted)).toBe(resubmitted);
  });
});
