"use client";

import {
  ErrorText,
  postJson,
  useAction,
} from "@/components/dashboard/workspace-actions";
import { Badge, Btn } from "@/components/save/primitives";

/**
 * Publishing controls for a donor brief.
 *
 * Founder decision B3: SAVE does not put its name behind a ministry on one
 * person's judgement. A reviewer other than the brief's author records
 * approval, and only then can the brief be published to donors. The API
 * enforces both halves of that; these controls make the state visible so a
 * reviewer is never guessing why publishing is unavailable.
 */

export function BriefApprovalControls({
  applicationId,
  approvedAt,
  approvedByEmail,
  isAuthor,
}: {
  applicationId: string;
  approvedAt: string | null;
  approvedByEmail: string | null;
  /** True when the signed-in reviewer wrote this brief. */
  isAuthor: boolean;
}) {
  const { error, pending, run } = useAction();
  const approved = Boolean(approvedAt);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {approved ? (
          <Badge tone="sage">Second reviewer approved</Badge>
        ) : (
          <Badge tone="clay">Awaiting second reviewer</Badge>
        )}
      </div>

      {approved ? (
        <p className="mt-1.5 text-caption text-ink-500">
          Approved by {approvedByEmail ?? "another reviewer"}.
        </p>
      ) : (
        <p className="mt-1.5 text-caption leading-relaxed text-ink-500">
          A reviewer other than the author must approve this brief before it can
          reach donors.
        </p>
      )}

      {isAuthor && !approved ? (
        <p className="mt-2 text-caption leading-relaxed text-clay-700">
          You wrote this brief, so you cannot be its second reviewer.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {approved ? (
          <Btn
            disabled={pending}
            onClick={() =>
              run(
                () =>
                  postJson("/api/brief/approve", {
                    application_id: applicationId,
                    approve: false,
                  }),
                "Unable to withdraw approval.",
              )
            }
            size="sm"
            variant="ghost"
          >
            {pending ? "Withdrawing…" : "Withdraw approval"}
          </Btn>
        ) : (
          <Btn
            disabled={pending || isAuthor}
            onClick={() =>
              run(
                () =>
                  postJson("/api/brief/approve", {
                    application_id: applicationId,
                  }),
                "Unable to record approval.",
              )
            }
            size="sm"
            variant="secondary"
          >
            {pending ? "Recording…" : "Approve as second reviewer"}
          </Btn>
        )}
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/**
 * Whether this ministry appears in the SAVE library. Separate from publishing
 * a brief: a completed assessment is not the same decision as listing the
 * ministry for discovery. Admin only.
 */
export function LibraryVisibilityToggle({
  organizationId,
  visible,
}: {
  organizationId: string;
  visible: boolean;
}) {
  const { error, pending, run } = useAction();

  return (
    <div className="mt-4 border-t border-hairline pt-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-caption font-semibold text-ink-900">
            Library listing
          </p>
          <p className="mt-0.5 text-caption text-ink-500">
            {visible ? "Listed in the SAVE library." : "Not listed."}
          </p>
        </div>
        <Btn
          disabled={pending}
          onClick={() =>
            run(
              () =>
                postJson(
                  `/api/organizations/${organizationId}/library-visibility`,
                  { visible: !visible },
                ),
              "Unable to change the library listing.",
            )
          }
          size="sm"
          variant={visible ? "ghost" : "secondary"}
        >
          {pending
            ? "Saving…"
            : visible
              ? "Remove from library"
              : "List in library"}
        </Btn>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
