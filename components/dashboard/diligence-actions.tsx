"use client";

import { useState } from "react";

import {
  ErrorText,
  postJson,
  useAction,
} from "@/components/dashboard/workspace-actions";
import {
  Btn,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/save/primitives";
import {
  CONFIDENCE_LEVELS,
  DILIGENCE_KINDS,
  DILIGENCE_KIND_LABELS,
  DILIGENCE_STATUSES,
  DILIGENCE_STATUS_LABELS,
  DILIGENCE_VISIBILITIES,
} from "@/lib/diligence-shared";

/**
 * Time With Leadership — recording relational diligence.
 *
 * The vocabularies here are the database's own check constraints, imported
 * rather than restated, so the form can never offer a value the record will
 * reject.
 */

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** "Name — Role" per line, so a reviewer can type who was in the room. */
function toParticipants(value: string) {
  return toLines(value).map((line) => {
    const [name, ...rest] = line.split(/[—–-]/);
    return {
      name: (name ?? "").trim(),
      role: rest.join("-").trim() || null,
    };
  });
}

function ConfidenceField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Field label={label}>
      <Select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="">Not assessed</option>
        {CONFIDENCE_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level.charAt(0).toUpperCase() + level.slice(1)} confidence
          </option>
        ))}
      </Select>
    </Field>
  );
}

export function RecordEngagementForm({
  applicationId,
}: {
  applicationId: string;
}) {
  const { error, pending, run } = useAction();
  const [open, setOpen] = useState(false);

  const [kind, setKind] = useState<string>("onsite_visit");
  const [occurredOn, setOccurredOn] = useState("");
  const [location, setLocation] = useState("");
  const [saveParticipants, setSaveParticipants] = useState("");
  const [ministryParticipants, setMinistryParticipants] = useState("");
  const [narrative, setNarrative] = useState("");
  const [leadershipCharacter, setLeadershipCharacter] = useState("");
  const [characterConfidence, setCharacterConfidence] = useState("");
  const [culture, setCulture] = useState("");
  const [cultureConfidence, setCultureConfidence] = useState("");
  const [orgHealth, setOrgHealth] = useState("");
  const [orgHealthConfidence, setOrgHealthConfidence] = useState("");
  const [strengths, setStrengths] = useState("");
  const [concerns, setConcerns] = useState("");
  const [status, setStatus] = useState<string>("completed");
  const [visibility, setVisibility] = useState<string>("internal_only");
  const [donorExcerpt, setDonorExcerpt] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");

  if (!open) {
    return (
      <Btn onClick={() => setOpen(true)} size="sm" variant="secondary">
        Record an engagement
      </Btn>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Kind" required>
          <Select
            onChange={(event) => setKind(event.target.value)}
            value={kind}
          >
            {DILIGENCE_KINDS.map((option) => (
              <option key={option} value={option}>
                {DILIGENCE_KIND_LABELS[option]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Date">
          <Input
            onChange={(event) => setOccurredOn(event.target.value)}
            type="date"
            value={occurredOn}
          />
        </Field>
        <Field label="Status" required>
          <Select
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            {DILIGENCE_STATUSES.map((option) => (
              <option key={option} value={option}>
                {DILIGENCE_STATUS_LABELS[option]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Where">
          <Input
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City, or the venue"
            value={location}
          />
        </Field>
        <Field help="Comma separated." label="SAVE participants">
          <Input
            onChange={(event) => setSaveParticipants(event.target.value)}
            value={saveParticipants}
          />
        </Field>
      </div>

      <Field help="One per line, as “Name — Role”." label="Who we met">
        <Textarea
          onChange={(event) => setMinistryParticipants(event.target.value)}
          rows={3}
          value={ministryParticipants}
        />
      </Field>

      <Field
        help="What actually happened, in plain language. This is the heart of the record."
        label="Narrative"
      >
        <Textarea
          onChange={(event) => setNarrative(event.target.value)}
          rows={6}
          value={narrative}
        />
      </Field>

      <div className="space-y-4">
        <Field label="Leadership character">
          <Textarea
            onChange={(event) => setLeadershipCharacter(event.target.value)}
            rows={3}
            value={leadershipCharacter}
          />
        </Field>
        <ConfidenceField
          label="Confidence in that reading"
          onChange={setCharacterConfidence}
          value={characterConfidence}
        />

        <Field label="Culture">
          <Textarea
            onChange={(event) => setCulture(event.target.value)}
            rows={3}
            value={culture}
          />
        </Field>
        <ConfidenceField
          label="Confidence in that reading"
          onChange={setCultureConfidence}
          value={cultureConfidence}
        />

        <Field label="Organizational health">
          <Textarea
            onChange={(event) => setOrgHealth(event.target.value)}
            rows={3}
            value={orgHealth}
          />
        </Field>
        <ConfidenceField
          label="Confidence in that reading"
          onChange={setOrgHealthConfidence}
          value={orgHealthConfidence}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field help="One per line." label="Strengths observed">
          <Textarea
            onChange={(event) => setStrengths(event.target.value)}
            rows={3}
            value={strengths}
          />
        </Field>
        <Field help="One per line." label="Concerns observed">
          <Textarea
            onChange={(event) => setConcerns(event.target.value)}
            rows={3}
            value={concerns}
          />
        </Field>
      </div>

      <Field
        help="Internal by default. Marking it shareable does not publish it — it only allows a crafted excerpt to be used."
        label="Visibility"
      >
        <Select
          onChange={(event) => setVisibility(event.target.value)}
          value={visibility}
        >
          {DILIGENCE_VISIBILITIES.map((option) => (
            <option key={option} value={option}>
              {option === "internal_only"
                ? "Internal only"
                : "Summary shareable"}
            </option>
          ))}
        </Select>
      </Field>

      {visibility === "summary_shareable" ? (
        <Field
          help="The only part of this record a donor could ever read. Write it for them."
          label="Donor excerpt"
        >
          <Textarea
            onChange={(event) => setDonorExcerpt(event.target.value)}
            rows={3}
            value={donorExcerpt}
          />
        </Field>
      ) : null}

      <Field
        help="Never leaves the SAVE team, in any projection."
        label="Private notes"
      >
        <Textarea
          onChange={(event) => setPrivateNotes(event.target.value)}
          rows={3}
          value={privateNotes}
        />
      </Field>

      <div className="flex flex-wrap gap-2.5">
        <Btn
          disabled={pending}
          onClick={async () => {
            const ok = await run(
              () =>
                postJson(`/api/applications/${applicationId}/diligence`, {
                  characterConfidence: characterConfidence || undefined,
                  concerns: toLines(concerns),
                  cultureConfidence: cultureConfidence || undefined,
                  cultureObservations: culture,
                  donorExcerpt,
                  kind,
                  leadershipCharacterObservations: leadershipCharacter,
                  location,
                  ministryParticipants: toParticipants(ministryParticipants),
                  narrative,
                  occurredOn: occurredOn || undefined,
                  orgHealthConfidence: orgHealthConfidence || undefined,
                  orgHealthObservations: orgHealth,
                  privateNotes,
                  saveParticipants: toCommaList(saveParticipants),
                  status,
                  strengths: toLines(strengths),
                  visibility,
                }),
              "Unable to record the engagement.",
            );
            if (ok) setOpen(false);
          }}
          size="sm"
        >
          {pending ? "Saving…" : "Save engagement"}
        </Btn>
        <Btn onClick={() => setOpen(false)} size="sm" variant="ghost">
          Cancel
        </Btn>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/**
 * The documented exception to the in-person requirement (decision B4).
 * Admin-only, and always displayed next to the tier it affects — an exception
 * that nobody can see would defeat the point of requiring one.
 */
export function RelationalDiligenceExceptionForm({
  applicationId,
  current,
}: {
  applicationId: string;
  current: string | null;
}) {
  const { error, pending, run } = useAction();
  const [reason, setReason] = useState(current ?? "");

  return (
    <div>
      <Field
        help="Recorded against the assessment and shown wherever the tier is shown."
        label="Documented exception"
      >
        <Textarea
          onChange={(event) => setReason(event.target.value)}
          placeholder="Why SAVE is willing to reach the top tier without in-person time."
          rows={3}
          value={reason}
        />
      </Field>
      <div className="mt-2.5 flex flex-wrap gap-2.5">
        <Btn
          disabled={pending || !reason.trim()}
          onClick={() =>
            run(
              () =>
                postJson(`/api/applications/${applicationId}/diligence`, {
                  action: "set_exception",
                  reason,
                }),
              "Unable to record the exception.",
            )
          }
          size="sm"
          variant="secondary"
        >
          {pending ? "Saving…" : "Record exception"}
        </Btn>
        {current ? (
          <Btn
            disabled={pending}
            onClick={async () => {
              const ok = await run(
                () =>
                  postJson(`/api/applications/${applicationId}/diligence`, {
                    action: "set_exception",
                    reason: null,
                  }),
                "Unable to clear the exception.",
              );
              if (ok) setReason("");
            }}
            size="sm"
            variant="ghost"
          >
            Clear
          </Btn>
        ) : null}
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
