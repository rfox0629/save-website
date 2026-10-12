"use client";

import { useState } from "react";

import {
  ErrorText,
  postJson,
  useAction,
} from "@/components/dashboard/workspace-actions";
import {
  Badge,
  Btn,
  Callout,
  Field,
  Select,
  Textarea,
} from "@/components/save/primitives";

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
  reviewNote,
  reviewOutcome,
  reviewedByEmail,
}: {
  applicationId: string;
  approvedAt: string | null;
  approvedByEmail: string | null;
  /** True when the signed-in reviewer wrote this brief. */
  isAuthor: boolean;
  reviewNote: string | null;
  reviewOutcome: string | null;
  reviewedByEmail: string | null;
}) {
  const { error, pending, run } = useAction();
  const approved = Boolean(approvedAt);
  const [reason, setReason] = useState("");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {!approved && reviewOutcome === "changes_requested" ? (
        <Callout title="A reviewer asked for changes" tone="clay">
          {reviewedByEmail ?? "An independent reviewer"} reviewed this brief and
          asked for changes rather than approving it.
          {reviewNote ? ` “${reviewNote}”` : ""} Revise the brief and it returns
          for another independent review.
        </Callout>
      ) : null}

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
          <>
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
            <Btn
              disabled={pending || isAuthor || !reason.trim()}
              onClick={() =>
                run(
                  () =>
                    postJson("/api/brief/approve", {
                      application_id: applicationId,
                      outcome: "changes_requested",
                      review_note: reason,
                    }),
                  "Unable to record the request for changes.",
                )
              }
              size="sm"
              variant="ghost"
            >
              {pending ? "Recording…" : "Request changes"}
            </Btn>
          </>
        )}
      </div>

      {!approved && !isAuthor ? (
        <div className="mt-3">
          <Field
            help="Required to request changes. The author sees this, so say what needs to change and why."
            label="Reason for requesting changes"
          >
            <Textarea
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              value={reason}
            />
          </Field>
        </div>
      ) : null}
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

/**
 * SAVE's formal assessment decision.
 *
 * Deliberately its own action rather than a status change or an inference from
 * the score. The notes reach the ministry, so the field says so — internal
 * reasoning belongs in a reviewer note.
 */
export function DecisionControls({
  applicationId,
  briefApproved,
  decision,
  decisionActorEmail,
  decisionDate,
  decisionNotes,
}: {
  applicationId: string;
  briefApproved: boolean;
  decision: string | null;
  decisionActorEmail: string | null;
  decisionDate: string | null;
  decisionNotes: string | null;
}) {
  const { error, pending, run } = useAction();
  const [choice, setChoice] = useState("approved");
  const [notes, setNotes] = useState("");

  if (decision) {
    return (
      <Callout
        title={`SAVE decision recorded: ${decision === "approved" ? "Approved" : "Declined"}`}
        tone={decision === "approved" ? "sage" : "clay"}
      >
        Recorded by {decisionActorEmail ?? "a SAVE administrator"}
        {decisionDate ? ` on ${new Date(decisionDate).toLocaleDateString()}` : ""}.
        {decisionNotes ? ` “${decisionNotes}”` : ""}
      </Callout>
    );
  }

  if (!briefApproved) {
    return (
      <Callout title="Not ready for a decision" tone="ink">
        SAVE records its formal decision once a second reviewer has approved the
        donor brief. The score does not decide this, and neither does the first
        reviewer&rsquo;s proposed recommendation.
      </Callout>
    );
  }

  return (
    <div>
      <Field label="SAVE decision" required>
        <Select onChange={(event) => setChoice(event.target.value)} value={choice}>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
        </Select>
      </Field>
      <div className="mt-3">
        <Field
          help="The ministry reads this. Say what SAVE decided and why, in terms the ministry can act on. Internal reasoning belongs in a reviewer note."
          label="Decision notes for the ministry"
          required
        >
          <Textarea
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            value={notes}
          />
        </Field>
      </div>
      <Btn
        className="mt-3"
        disabled={pending || !notes.trim()}
        onClick={() =>
          run(
            () =>
              postJson(`/api/applications/${applicationId}/decision`, {
                decision: choice,
                notes,
              }),
            "Unable to record the decision.",
          )
        }
        size="sm"
      >
        {pending ? "Recording…" : "Record SAVE decision"}
      </Btn>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
