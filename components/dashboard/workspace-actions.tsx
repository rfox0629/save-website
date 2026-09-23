"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  Badge,
  Btn,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/save/primitives";

/**
 * Reviewer workspace actions, on the approved design system.
 *
 * These call the exact same API routes and payloads as the legacy dark
 * workspace — only the interface changed. Backend behaviour (scoring,
 * overrides, flags, documents, notes, status, assignment, the vetting
 * pipeline) is untouched.
 */

type ApiResult = { error?: string };

export async function postJson(
  url: string,
  body: Record<string, unknown> = {},
) {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const data = (await response.json().catch(() => ({}))) as ApiResult;

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

export function useAction() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>, fallback: string) {
    setPending(true);
    setError(null);
    try {
      await fn();
      startTransition(() => router.refresh());
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : fallback);
      return false;
    } finally {
      setPending(false);
    }
  }

  return { error, pending, run };
}

export function ErrorText({ children }: { children: string | null }) {
  if (!children) return null;
  return <p className="mt-2 text-caption text-risk-700">{children}</p>;
}

/* ------------------------------------------------------------- Assignment -- */

export function AssignReviewerForm({
  applicationId,
  current,
  reviewers,
}: {
  applicationId: string;
  current: string | null;
  reviewers: { email: string; id: string; role: string }[];
}) {
  const { error, pending, run } = useAction();
  const [reviewerId, setReviewerId] = useState("");

  return (
    <div>
      <Field label="Assign to">
        <Select
          onChange={(event) => setReviewerId(event.target.value)}
          value={reviewerId}
        >
          <option value="">
            {current ? `Currently ${current}` : "Unassigned"}
          </option>
          {reviewers.map((reviewer) => (
            <option key={reviewer.id} value={reviewer.id}>
              {reviewer.email} ({reviewer.role})
            </option>
          ))}
        </Select>
      </Field>
      <Btn
        className="mt-3 w-full"
        disabled={pending || !reviewerId}
        onClick={() =>
          run(
            () =>
              postJson(`/api/applications/${applicationId}/assign-reviewer`, {
                reviewer_id: reviewerId,
              }),
            "Unable to assign reviewer.",
          )
        }
        size="sm"
        variant="secondary"
      >
        {pending ? "Assigning…" : "Assign reviewer"}
      </Btn>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/* ----------------------------------------------------------------- Status -- */

export function StatusForm({
  applicationId,
  current,
  options,
}: {
  applicationId: string;
  current: string;
  options: { label: string; value: string }[];
}) {
  const { error, pending, run } = useAction();
  const [status, setStatus] = useState(current);

  return (
    <div>
      <Field
        help="Moves the assessment to the selected stage. Recorded against the canonical application record."
        label="Assessment status"
        required
      >
        <Select
          onChange={(event) => setStatus(event.target.value)}
          value={status}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Btn
        className="mt-3"
        disabled={pending || status === current}
        onClick={() =>
          run(
            () =>
              postJson(`/api/applications/${applicationId}/status`, { status }),
            "Unable to update status.",
          )
        }
        size="sm"
      >
        {pending ? "Saving…" : "Update status"}
      </Btn>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/* ---------------------------------------------------------------- Scoring -- */

export function RunAssessmentButton({
  applicationId,
  blockedReason = null,
}: {
  applicationId: string;
  /** When set, the pipeline cannot run and this explains why. */
  blockedReason?: string | null;
}) {
  const { error, pending, run } = useAction();
  const [started, setStarted] = useState(false);

  return (
    <div className="flex flex-col items-end">
      <Btn
        disabled={pending || Boolean(blockedReason)}
        onClick={async () => {
          const ok = await run(
            () => postJson(`/api/vetting/${applicationId}/run`),
            "Unable to start the assessment pipeline.",
          );
          if (ok) setStarted(true);
        }}
        size="sm"
        variant="secondary"
      >
        {pending ? "Starting…" : "Run assessment pipeline"}
      </Btn>
      {blockedReason ? (
        <p className="mt-2 max-w-xs text-right text-caption text-clay-700">
          {blockedReason}
        </p>
      ) : started ? (
        <p className="mt-2 text-caption text-ink-500">
          Running in the background — scoring, external checks and document
          analysis. Refresh in a moment.
        </p>
      ) : null}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

export function AiSummaryButton({ applicationId }: { applicationId: string }) {
  const { error, pending, run } = useAction();

  return (
    <div className="flex flex-col items-end">
      <Btn
        disabled={pending}
        onClick={() =>
          run(
            () => postJson(`/api/applications/${applicationId}/ai-summary`),
            "Unable to generate the AI summary.",
          )
        }
        size="sm"
        variant="secondary"
      >
        {pending ? "Generating…" : "Generate AI summary"}
      </Btn>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

export function OverrideScoreForm({
  applicationId,
  categories,
}: {
  applicationId: string;
  categories: { label: string; value: string }[];
}) {
  const { error, pending, run } = useAction();
  const [category, setCategory] = useState(categories[0]?.value ?? "");
  const [score, setScore] = useState("");
  const [note, setNote] = useState("");

  const ready = Boolean(category && score && note.trim());

  return (
    <div className="grid gap-4 md:grid-cols-[180px_110px_1fr_auto] md:items-end">
      <Field label="Category">
        <Select
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          {categories.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Score">
        <Input
          inputMode="numeric"
          onChange={(event) => setScore(event.target.value)}
          value={score}
        />
      </Field>
      <Field label="Override reason" required>
        <Input
          onChange={(event) => setNote(event.target.value)}
          placeholder="Why the evidence supports a different score"
          value={note}
        />
      </Field>
      <div>
        <Btn
          disabled={pending || !ready}
          onClick={async () => {
            const ok = await run(
              () =>
                postJson(`/api/applications/${applicationId}/scores/override`, {
                  category,
                  note,
                  score: Number(score),
                }),
              "Unable to save the override.",
            );
            if (ok) {
              setScore("");
              setNote("");
            }
          }}
          variant="secondary"
        >
          {pending ? "Saving…" : "Apply override"}
        </Btn>
      </div>
      <div className="md:col-span-4">
        <ErrorText>{error}</ErrorText>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Flags -- */

export function ResolveFlagForm({
  applicationId,
  flagId,
}: {
  applicationId: string;
  flagId: string;
}) {
  const { error, pending, run } = useAction();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  if (!open) {
    return (
      <Btn onClick={() => setOpen(true)} size="sm" variant="secondary">
        Resolve
      </Btn>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Field label="Resolution note" required>
        <Textarea
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          value={note}
        />
      </Field>
      <div className="mt-2.5 flex gap-2">
        <Btn
          disabled={pending || !note.trim()}
          onClick={async () => {
            const ok = await run(
              () =>
                postJson(
                  `/api/applications/${applicationId}/flags/${flagId}/resolve`,
                  { resolution_notes: note },
                ),
              "Unable to resolve the flag.",
            );
            if (ok) setOpen(false);
          }}
          size="sm"
        >
          {pending ? "Resolving…" : "Resolve flag"}
        </Btn>
        <Btn onClick={() => setOpen(false)} size="sm" variant="ghost">
          Cancel
        </Btn>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/* -------------------------------------------------------------- Documents -- */

export function DocumentReviewToggle({
  applicationId,
  documentId,
  reviewed,
}: {
  applicationId: string;
  documentId: string;
  reviewed: boolean;
}) {
  const { error, pending, run } = useAction();

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2.5">
        {reviewed ? <Badge tone="sage">Reviewed</Badge> : null}
        <Btn
          disabled={pending}
          onClick={() =>
            run(
              () =>
                postJson(
                  `/api/applications/${applicationId}/documents/${documentId}/review`,
                  { reviewed: !reviewed },
                ),
              "Unable to update the document.",
            )
          }
          size="sm"
          variant={reviewed ? "ghost" : "secondary"}
        >
          {pending ? "Saving…" : reviewed ? "Mark unreviewed" : "Mark reviewed"}
        </Btn>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/* -------------------------------------------------------- External checks -- */

export function ExternalCheckForm({
  applicationId,
  check,
}: {
  applicationId: string;
  check: {
    id: string;
    note?: string | null;
    score_impact: number | null;
    source: string;
    status: string;
    summary: string | null;
  };
}) {
  const { error, pending, run } = useAction();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(check.status);
  const [summary, setSummary] = useState(check.summary ?? "");

  if (!open) {
    return (
      <Btn onClick={() => setOpen(true)} size="sm" variant="ghost">
        Record result
      </Btn>
    );
  }

  return (
    <div className="mt-3 w-full">
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <Field label="Status">
          <Select
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="pending">Pending</option>
            <option value="pass">Pass</option>
            <option value="flag">Flag</option>
            <option value="not_applicable">Not applicable</option>
          </Select>
        </Field>
        <Field label="Summary">
          <Input
            onChange={(event) => setSummary(event.target.value)}
            value={summary}
          />
        </Field>
      </div>
      <div className="mt-2.5 flex gap-2">
        <Btn
          disabled={pending}
          onClick={async () => {
            const ok = await run(
              () =>
                postJson(`/api/applications/${applicationId}/external-checks`, {
                  check_id: check.id || undefined,
                  note: check.note ?? undefined,
                  score_impact: check.score_impact,
                  source: check.source,
                  status,
                  summary,
                }),
              "Unable to save the check.",
            );
            if (ok) setOpen(false);
          }}
          size="sm"
        >
          {pending ? "Saving…" : "Save"}
        </Btn>
        <Btn onClick={() => setOpen(false)} size="sm" variant="ghost">
          Cancel
        </Btn>
      </div>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

/* ------------------------------------------------------------------ Notes -- */

export function NoteForm({ applicationId }: { applicationId: string }) {
  const { error, pending, run } = useAction();
  const [note, setNote] = useState("");
  const [section, setSection] = useState("");

  return (
    <div>
      <Field label="Section">
        <Input
          onChange={(event) => setSection(event.target.value)}
          placeholder="Optional — e.g. Governance"
          value={section}
        />
      </Field>
      <div className="mt-3">
        <Field label="Note" required>
          <Textarea
            onChange={(event) => setNote(event.target.value)}
            placeholder="Private to the SAVE team. Never shown to the ministry or donors."
            rows={4}
            value={note}
          />
        </Field>
      </div>
      <Btn
        className="mt-3 w-full"
        disabled={pending || !note.trim()}
        onClick={async () => {
          const ok = await run(
            () =>
              postJson(`/api/applications/${applicationId}/notes`, {
                note,
                section: section || undefined,
              }),
            "Unable to save the note.",
          );
          if (ok) {
            setNote("");
            setSection("");
          }
        }}
        size="sm"
        variant="secondary"
      >
        {pending ? "Saving…" : "Add note"}
      </Btn>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
