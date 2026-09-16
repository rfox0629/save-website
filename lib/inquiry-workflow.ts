/**
 * The inquiry stage's own workflow (founder decisions, Phase B).
 *
 * SAVE reviews an inquiry and does one of three things: advances it into
 * assessment, asks the ministry for more information, or declines to advance
 * it. Those are the only moves available at this stage, and they are enforced
 * here — server-side — rather than by hiding options in the UI.
 *
 * `inquiry_approved` is the required gateway into assessment: an inquiry can
 * never jump straight to `under_review`.
 *
 * `inquiry_rejected` means SAVE reviewed the inquiry and chose not to advance
 * the organisation into assessment. It is not a completed SAVE assessment, it
 * creates no score or trust tier, and it must never be described as SAVE having
 * found the ministry unable to be recommended. `declined` stays reserved for
 * the later assessment lifecycle.
 */

export const INQUIRY_STAGE_STATUSES = [
  "inquiry_submitted",
  "more_info_requested",
] as const;

export const INQUIRY_ACTIONS = [
  "approve",
  "request_more_info",
  "decline",
] as const;

export type InquiryAction = (typeof INQUIRY_ACTIONS)[number];

/** Where each staff action moves the application. */
export const INQUIRY_ACTION_TARGET: Record<InquiryAction, string> = {
  approve: "inquiry_approved",
  decline: "inquiry_rejected",
  request_more_info: "more_info_requested",
};

/** The event recorded for each action, for the append-only history. */
export const INQUIRY_ACTION_EVENT: Record<InquiryAction, string> = {
  approve: "approved",
  decline: "rejected",
  request_more_info: "more_info_requested",
};

/** A ministry answering a request returns to the queue as a fresh submission. */
export const INQUIRY_RESUBMISSION_STATUS = "inquiry_submitted";

export function isInquiryAction(value: unknown): value is InquiryAction {
  return (
    typeof value === "string" &&
    (INQUIRY_ACTIONS as readonly string[]).includes(value)
  );
}

export function isInquiryStageStatus(status: string | null | undefined) {
  return (
    typeof status === "string" &&
    (INQUIRY_STAGE_STATUSES as readonly string[]).includes(status)
  );
}

/**
 * Which statuses an inquiry-stage application may move to. Anything else — most
 * importantly `under_review` — must go through `inquiry_approved` first.
 */
export function getAllowedInquiryTargets(): string[] {
  return [...Object.values(INQUIRY_ACTION_TARGET), INQUIRY_RESUBMISSION_STATUS];
}

/**
 * Guard for the generic status control. Later-stage transitions are unchanged;
 * only the inquiry stage is constrained.
 */
export function isBlockedInquiryTransition(
  currentStatus: string | null | undefined,
  nextStatus: string,
): boolean {
  if (!isInquiryStageStatus(currentStatus)) {
    return false;
  }

  return !getAllowedInquiryTargets().includes(nextStatus);
}

export type InquiryActionInput = {
  ministryMessage?: string | null;
  staffNote?: string | null;
};

export type InquiryActionPlan = {
  eventKind: string;
  ministryMessage: string | null;
  staffNote: string | null;
  status: string;
};

function clean(value: string | null | undefined): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Validates a staff action against the application's current status and
 * returns what should be written. Throws with a reviewer-readable message
 * rather than silently doing nothing.
 */
export function planInquiryAction(
  currentStatus: string | null | undefined,
  action: InquiryAction,
  input: InquiryActionInput = {},
): InquiryActionPlan {
  if (!isInquiryStageStatus(currentStatus)) {
    throw new Error(
      "This application is no longer at the inquiry stage, so inquiry actions do not apply.",
    );
  }

  const staffNote = clean(input.staffNote);
  const ministryMessage = clean(input.ministryMessage);

  if (action === "request_more_info" && !staffNote) {
    throw new Error(
      "Say what information SAVE needs before sending a request.",
    );
  }

  if (action === "decline" && !staffNote) {
    throw new Error("Record the internal reason for declining this inquiry.");
  }

  return {
    eventKind: INQUIRY_ACTION_EVENT[action],
    ministryMessage,
    staffNote,
    status: INQUIRY_ACTION_TARGET[action],
  };
}

/**
 * How long staff have been holding this inquiry: measured from the latest
 * submission or resubmission, never from when the record was created.
 */
export function getInquiryAgeAnchor(
  submittedAt: string | null | undefined,
  fallbackCreatedAt: string | null | undefined,
): string | null {
  return submittedAt ?? fallbackCreatedAt ?? null;
}
