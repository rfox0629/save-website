/**
 * A donor brief needs a second reviewer who is not its author.
 *
 * The check used to be `generated_by === approver`. When `generated_by` was
 * null that comparison is false, so an authorless brief passed the gate and
 * anyone could approve it — the two-person requirement vanished exactly when
 * authorship was missing. It now fails closed.
 *
 * The author is whoever the brief records: the live foreign key while the
 * identity exists, otherwise the immutable snapshot. That is what keeps the gate
 * standing after the author leaves SAVE — a deactivated or deleted author still
 * cannot approve their own brief, and a different reviewer still can.
 */

export type BriefAuthorship = {
  generated_actor_id?: string | null;
  generated_by?: string | null;
};

export type ApprovalDecision =
  | { allowed: false; reason: string }
  | { allowed: true };

/** The author of record: live identity first, then the immutable snapshot. */
export function resolveBriefAuthorId(
  brief: BriefAuthorship | null | undefined,
): string | null {
  return brief?.generated_by ?? brief?.generated_actor_id ?? null;
}

export function canApproveBrief(
  brief: BriefAuthorship | null | undefined,
  approverId: string | null | undefined,
): ApprovalDecision {
  if (!approverId) {
    return { allowed: false, reason: "Unauthorized" };
  }

  const authorId = resolveBriefAuthorId(brief);

  if (!authorId) {
    return {
      allowed: false,
      reason:
        "This brief has no recorded author, so there is no independent second reviewer to be. Regenerate it through the brief editor before approving.",
    };
  }

  if (authorId === approverId) {
    return {
      allowed: false,
      reason:
        "You wrote this brief, so you cannot be its second reviewer. Another reviewer must approve it.",
    };
  }

  return { allowed: true };
}
