"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ApiResult = {
  error?: string;
};

async function postJson(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = (await response.json().catch(() => ({}))) as ApiResult;

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }
}

export function OverrideScoreDialog({
  applicationId,
  category,
  currentScore,
  maxScore,
}: {
  applicationId: string;
  category: string;
  currentScore: number;
  maxScore: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(String(currentScore));
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);

    try {
      await postJson(`/api/applications/${applicationId}/scores/override`, {
        category,
        note,
        score: Number(score),
      });
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to save override.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        className="border-[#C09A45]/30 bg-[#C09A45]/10 text-[#F4E3B2] hover:bg-[#C09A45]/20"
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        Override
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02060bcc] p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#102133] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#C09A45]">
                  Score Override
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {category.charAt(0).toUpperCase() + category.slice(1)} score
                </h3>
              </div>
              <button
                className="text-slate-400 transition hover:text-white"
                onClick={() => setOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm text-slate-200">
                  Adjusted score (0-{maxScore})
                </span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white outline-none ring-0"
                  max={maxScore}
                  min={0}
                  onChange={(event) => setScore(event.target.value)}
                  type="number"
                  value={score}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-slate-200">Required note</span>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white outline-none"
                  onChange={(event) => setNote(event.target.value)}
                  value={note}
                />
              </label>

              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setOpen(false)}
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  className={cn(
                    "bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]",
                    pending && "opacity-70",
                  )}
                  disabled={pending || !note.trim()}
                  onClick={() => void submit()}
                  type="button"
                >
                  Save override
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AiSummaryButton({
  applicationId,
  hasSummary,
}: {
  applicationId: string;
  hasSummary: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = pending
    ? "Generating..."
    : error
      ? "Try Again"
      : hasSummary
        ? "Regenerate"
        : "Generate AI Summary";

  async function generateSummary() {
    setPending(true);
    setError(null);

    try {
      await postJson(`/api/applications/${applicationId}/ai-summary`, {});
      startTransition(() => router.refresh());
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to generate AI summary.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className={cn(
          "bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]",
          pending && "opacity-70",
        )}
        disabled={pending}
        onClick={() => void generateSummary()}
        type="button"
      >
        {label}
      </Button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}

export function ResolveFlagDialog({
  applicationId,
  flagId,
}: {
  applicationId: string;
  flagId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);

    try {
      await postJson(
        `/api/applications/${applicationId}/flags/${flagId}/resolve`,
        {
          resolution_notes: note,
        },
      );
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to resolve flag.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        Resolve
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02060bcc] p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#102133] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#C09A45]">
                  Resolve Flag
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  Add resolution notes
                </h3>
              </div>
              <button
                className="text-slate-400 transition hover:text-white"
                onClick={() => setOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <textarea
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white outline-none"
                onChange={(event) => setNote(event.target.value)}
                value={note}
              />

              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setOpen(false)}
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                  disabled={pending || !note.trim()}
                  onClick={() => void submit()}
                  type="button"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function DocumentReviewButton({
  applicationId,
  documentId,
  reviewed,
}: {
  applicationId: string;
  documentId: string;
  reviewed: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);

    try {
      await postJson(
        `/api/applications/${applicationId}/documents/${documentId}/review`,
        {
          reviewed: !reviewed,
        },
      );
      startTransition(() => router.refresh());
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      disabled={pending}
      onClick={() => void toggle()}
      size="sm"
      type="button"
    >
      {reviewed ? "Unmark" : "Mark reviewed"}
    </Button>
  );
}

export function ExternalChecksManager({
  applicationId,
  checks,
}: {
  applicationId: string;
  checks: {
    checked_at: string;
    id: string;
    raw_result: unknown;
    score_impact: number | null;
    source: string;
    status: string;
    summary: string | null;
  }[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(
    checks.map((check) => ({
      ...check,
      note: "",
      summary: check.summary ?? "",
    })),
  );
  const [pendingSource, setPendingSource] = useState<string | null>(null);

  function getSourceLabel(source: string) {
    if (source.startsWith("form_990_")) {
      return `Form 990 ${source.replace("form_990_", "")}`;
    }

    const labels: Record<string, string> = {
      "990_analysis": "990 Analysis",
      bylaws_analysis: "Bylaws Analysis",
      candid: "Candid",
      charity_navigator: "Charity Navigator",
      doctrinal_analysis: "Doctrinal Analysis",
      ecfa_search: "ECFA",
      form_990: "Form 990",
      irs_teos: "IRS TEOS",
      news_search: "News Search",
      references: "References",
      website: "Website",
    };

    return (
      labels[source] ??
      source
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    );
  }

  async function saveRow(index: number) {
    const row = rows[index];

    setPendingSource(row.id || row.source);

    try {
      await postJson(`/api/applications/${applicationId}/external-checks`, {
        check_id: row.id || undefined,
        note: row.note,
        score_impact: row.score_impact,
        source: row.source,
        status: row.status,
        summary: row.summary,
      });
      startTransition(() => router.refresh());
    } finally {
      setPendingSource(null);
    }
  }

  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <article
          className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5"
          key={`${row.id || row.source}-${index}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {getSourceLabel(row.source)}
              </h3>
              <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                {row.source}
              </p>
            </div>
            <div className="text-right text-sm text-slate-300">
              <p>
                {row.checked_at
                  ? new Date(row.checked_at).toLocaleString()
                  : "Not run yet"}
              </p>
              {typeof row.score_impact === "number" ? (
                <p className="mt-1 text-xs text-slate-400">
                  Score impact: {row.score_impact > 0 ? "+" : ""}
                  {row.score_impact}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[220px,1fr]">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Status
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-[#0B1622] px-3 py-2 text-white"
                onChange={(event) => {
                  const nextRows = [...rows];
                  nextRows[index] = {
                    ...nextRows[index],
                    status: event.target.value,
                  };
                  setRows(nextRows);
                }}
                value={row.status}
              >
                {["pending", "pass", "flag", "fail", "not_applicable"].map(
                  (option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Summary
              </label>
              <textarea
                className="min-h-24 w-full rounded-xl border border-white/10 bg-[#0B1622] px-3 py-2 text-white"
                onChange={(event) => {
                  const nextRows = [...rows];
                  nextRows[index] = {
                    ...nextRows[index],
                    summary: event.target.value,
                  };
                  setRows(nextRows);
                }}
                value={row.summary}
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Reviewer override note
            </label>
            <textarea
              className="min-h-20 w-full rounded-xl border border-white/10 bg-[#0B1622] px-3 py-2 text-white"
              onChange={(event) => {
                const nextRows = [...rows];
                nextRows[index] = {
                  ...nextRows[index],
                  note: event.target.value,
                };
                setRows(nextRows);
              }}
              placeholder="Explain why you are overriding this check."
              value={row.note}
            />
          </div>

          <details className="mt-4 rounded-2xl border border-white/10 bg-[#0B1622]/70 p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-200">
              View raw data
            </summary>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs text-slate-300">
              {JSON.stringify(row.raw_result ?? {}, null, 2)}
            </pre>
          </details>

          <div className="mt-4 flex justify-end">
            <Button
              disabled={pendingSource === (row.id || row.source)}
              onClick={() => void saveRow(index)}
              size="sm"
              type="button"
            >
              Save override
            </Button>
          </div>
        </article>
      ))}
      {rows.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center text-slate-400">
          No external checks have been recorded yet.
        </div>
      ) : null}
    </div>
  );
}

export function NotesManager({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [section, setSection] = useState("overview");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);

    try {
      await postJson(`/api/applications/${applicationId}/notes`, {
        note,
        section,
      });
      setNote("");
      startTransition(() => router.refresh());
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to save note.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="grid gap-4 md:grid-cols-[180px,1fr,auto]">
        <select
          className="rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
          onChange={(event) => setSection(event.target.value)}
          value={section}
        >
          {[
            "overview",
            "score",
            "flags",
            "documents",
            "external_checks",
            "notes",
            "brief",
          ].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <textarea
          className="min-h-28 rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add an internal reviewer note."
          value={note}
        />

        <div className="flex items-end">
          <Button
            className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
            disabled={pending || !note.trim()}
            onClick={() => void submit()}
            type="button"
          >
            Add note
          </Button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
