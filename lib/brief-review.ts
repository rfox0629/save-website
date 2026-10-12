/**
 * The outcome of an independent review, kept distinct from approval.
 *
 * `approved_by` alone cannot express what a reviewer did. A null approver means
 * either "nobody has looked at this yet" or "a reviewer looked and asked for
 * changes", and those are not the same thing — the second is a review that
 * happened. `review_outcome` carries that distinction.
 */

export const REVIEW_OUTCOMES = ["approved", "changes_requested"] as const;

export type ReviewOutcome = (typeof REVIEW_OUTCOMES)[number];

export type BriefReviewState = {
  approved_at?: string | null;
  review_note?: string | null;
  review_outcome?: string | null;
  reviewed_at?: string | null;
};

export type ReviewStatus =
  | "approved"
  | "changes_requested"
  | "not_reviewed";

export function getReviewStatus(brief: BriefReviewState | null): ReviewStatus {
  if (brief?.review_outcome === "changes_requested") {
    return "changes_requested";
  }

  if (brief?.approved_at) {
    return "approved";
  }

  return "not_reviewed";
}

/**
 * Requesting changes without saying why is not a review — the author has
 * nothing to act on, and nothing is recorded about what was wrong.
 */
export function assertReviewNote(note: unknown): string {
  const trimmed = typeof note === "string" ? note.trim() : "";

  if (trimmed.length === 0) {
    throw new Error(
      "Requesting changes needs a reason the author can act on.",
    );
  }

  return trimmed;
}

/**
 * Whether SAVE may record its formal assessment decision yet.
 *
 * A decision is SAVE's own judgement about the ministry, so it waits for the
 * second reviewer. It is never inferred from the score or from the first
 * reviewer's proposed recommendation.
 */
export function canRecordDecision(brief: BriefReviewState | null): {
  allowed: boolean;
  reason?: string;
} {
  if (getReviewStatus(brief) !== "approved") {
    return {
      allowed: false,
      reason:
        "A second reviewer must approve the donor brief before SAVE records a formal decision.",
    };
  }

  return { allowed: true };
}

/**
 * Publication needs both gates: an independently approved brief, and a formal
 * decision. Neither one implies the other, and neither publishes on its own.
 */
export function canPublish(input: {
  brief: BriefReviewState | null;
  decision: string | null | undefined;
}): { allowed: boolean; reason?: string } {
  if (getReviewStatus(input.brief) !== "approved") {
    return {
      allowed: false,
      reason: "A second reviewer must approve this brief before it is published.",
    };
  }

  if (!input.decision) {
    return {
      allowed: false,
      reason:
        "SAVE has not recorded a formal assessment decision for this application yet.",
    };
  }

  return { allowed: true };
}
