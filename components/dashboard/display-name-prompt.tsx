"use client";

import { useState } from "react";

import {
  ErrorText,
  postJson,
  useAction,
} from "@/components/dashboard/workspace-actions";
import { Btn, Callout, Field, Input } from "@/components/save/primitives";

/**
 * Shown to a staff member whose profile has no display name.
 *
 * Their actions are being recorded against an email alone, and the snapshot is
 * written at the moment of the action — so a name supplied later will not
 * improve what is already recorded. That is why this asks now rather than
 * leaving it to a settings page nobody opens.
 */
export function DisplayNamePrompt() {
  const { error, pending, run } = useAction();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  if (saved) {
    return null;
  }

  return (
    <Callout title="Your work is being recorded without your name" tone="clay">
      <p className="text-caption leading-relaxed">
        Everything you approve, decide or record is attributed to you
        permanently, and right now that attribution carries only your email. Add
        your name so colleagues reading this assessment later know who did the
        work. Actions already recorded keep what they have.
      </p>
      <div className="mt-3 max-w-sm">
        <Field label="Your name">
          <Input
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Ada Okonkwo"
            value={name}
          />
        </Field>
        <Btn
          className="mt-2.5"
          disabled={pending || !name.trim()}
          onClick={async () => {
            const ok = await run(
              () => postJson("/api/profile/display-name", { displayName: name }),
              "Unable to save your display name.",
            );
            if (ok) setSaved(true);
          }}
          size="sm"
        >
          {pending ? "Saving…" : "Save my name"}
        </Btn>
        <ErrorText>{error}</ErrorText>
      </div>
    </Callout>
  );
}
