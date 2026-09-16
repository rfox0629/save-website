"use client";

import { useState } from "react";

import { Btn, Field, Textarea } from "@/components/save/primitives";

import { ErrorText, postJson, useAction } from "./workspace-actions";

/**
 * The inquiry stage's three staff actions.
 *
 * Deliberately not the generic status dropdown: at this stage SAVE either
 * advances an inquiry into assessment, asks the ministry for more information,
 * or declines to advance it. The server enforces the same rules, so this
 * interface narrows the choice rather than being what protects the lifecycle.
 */

type InquiryAction = "approve" | "decline" | "request_more_info";

const COPY: Record<
  InquiryAction,
  {
    button: string;
    confirm: string;
    description: string;
    ministryLabel?: string;
    ministryHelp?: string;
    staffLabel?: string;
    staffHelp?: string;
    title: string;
  }
> = {
  approve: {
    button: "Approve inquiry",
    confirm: "Approve and open the assessment",
    description:
      "Advances this ministry into the SAVE assessment and opens the complete application to them. This assigns the assessment cycle year.",
    title: "Approve inquiry",
  },
  decline: {
    button: "Decline inquiry",
    confirm: "Record decline",
    description:
      "SAVE reviewed this inquiry and is not taking it into assessment at this time. No score, tier or assessment result is created.",
    ministryHelp:
      "Shown to the ministry. Leave empty to send no explanation. Your internal reason is never shown to them.",
    ministryLabel: "Explanation for the ministry (optional)",
    staffHelp: "Internal only. Never shown to the ministry.",
    staffLabel: "Internal reason",
    title: "Decline inquiry",
  },
  request_more_info: {
    button: "Request more information",
    confirm: "Send request",
    description:
      "Asks the ministry for more information and reopens its inquiry for editing. The ministry stays at the inquiry stage.",
    ministryHelp:
      "Shown to the ministry alongside its inquiry. If left empty, they see that SAVE has asked for more information without further detail.",
    ministryLabel: "What to show the ministry (optional)",
    staffHelp: "Internal only. Records what SAVE is waiting for.",
    staffLabel: "What information SAVE needs",
    title: "Request more information",
  },
};

export function InquiryDecisionActions({
  applicationId,
}: {
  applicationId: string;
}) {
  const { error, pending, run } = useAction();
  const [action, setAction] = useState<InquiryAction | null>(null);
  const [staffNote, setStaffNote] = useState("");
  const [ministryMessage, setMinistryMessage] = useState("");

  const selected = action ? COPY[action] : null;

  function reset() {
    setAction(null);
    setStaffNote("");
    setMinistryMessage("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(["approve", "request_more_info", "decline"] as const).map((value) => (
          <Btn
            key={value}
            onClick={() => {
              setAction(value === action ? null : value);
              setStaffNote("");
              setMinistryMessage("");
            }}
            size="sm"
            variant={
              value === action
                ? "primary"
                : value === "decline"
                  ? "ghost"
                  : "secondary"
            }
          >
            {COPY[value].button}
          </Btn>
        ))}
      </div>

      {selected ? (
        <div className="mt-4 rounded-lg border border-hairline bg-surface-sunken p-4">
          <p className="text-sm font-medium text-ink-900">{selected.title}</p>
          <p className="mt-1 text-caption leading-relaxed text-ink-500">
            {selected.description}
          </p>

          {selected.staffLabel ? (
            <div className="mt-4">
              <Field
                help={selected.staffHelp}
                label={selected.staffLabel}
                required
              >
                <Textarea
                  onChange={(event) => setStaffNote(event.target.value)}
                  rows={3}
                  value={staffNote}
                />
              </Field>
            </div>
          ) : null}

          {selected.ministryLabel ? (
            <div className="mt-3">
              <Field
                help={selected.ministryHelp}
                label={selected.ministryLabel}
              >
                <Textarea
                  onChange={(event) => setMinistryMessage(event.target.value)}
                  rows={3}
                  value={ministryMessage}
                />
              </Field>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Btn
              disabled={pending}
              onClick={async () => {
                const ok = await run(
                  () =>
                    postJson(
                      `/api/applications/${applicationId}/inquiry-decision`,
                      {
                        action,
                        ministryMessage: ministryMessage || null,
                        staffNote: staffNote || null,
                      },
                    ),
                  "Unable to record this inquiry decision.",
                );

                if (ok) {
                  reset();
                }
              }}
              size="sm"
            >
              {pending ? "Working…" : selected.confirm}
            </Btn>
            <Btn disabled={pending} onClick={reset} size="sm" variant="ghost">
              Cancel
            </Btn>
          </div>

          <ErrorText>{error}</ErrorText>
        </div>
      ) : null}
    </div>
  );
}
