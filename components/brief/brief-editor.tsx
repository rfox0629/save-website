"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BriefPreview } from "@/components/brief/brief-preview";
import { PrintButton } from "@/components/brief/print-button";
import { Button } from "@/components/ui/button";
import { RECOMMENDATION_LEVELS, type BriefFormData } from "@/lib/brief-shared";
import type { Organizations } from "@/lib/supabase/types";

type SaveResult = {
  error?: string;
  published?: boolean;
  public_slug?: string | null;
  public_url?: string | null;
};

export function BriefEditor({
  applicationId,
  initialData,
  initialGeneratedAt,
  initialIsStale,
  initialPublicUrl,
  org,
}: {
  applicationId: string;
  initialData: BriefFormData;
  initialGeneratedAt: string | null;
  initialIsStale: boolean;
  initialPublicUrl: string | null;
  org: Organizations;
}) {
  const [form, setForm] = useState(initialData);
  const [publicUrl, setPublicUrl] = useState(initialPublicUrl);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const generatedAt = initialGeneratedAt ?? new Date().toISOString();
  const isPublished = Boolean(publicUrl) || form.published;

  const previewData = useMemo(
    () => ({
      ...form,
      generated_at: generatedAt,
      headline: form.headline,
      recommendation_level: form.recommendation_level,
    }),
    [form, generatedAt],
  );

  async function saveBrief(publishedOverride?: boolean) {
    setPending(true);
    setMessage(null);
    setCopyMessage(null);

    const published =
      typeof publishedOverride === "boolean"
        ? publishedOverride
        : form.published;

    try {
      const response = await fetch("/api/brief", {
        body: JSON.stringify({
          application_id: applicationId,
          ...form,
          published,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json()) as SaveResult;

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save brief.");
      }

      setForm((current) => ({
        ...current,
        published,
      }));
      setPublicUrl(result.public_url ?? null);
      setMessage(
        published ? "Donor brief published." : "Donor brief unpublished.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save brief.",
      );
    } finally {
      setPending(false);
    }
  }

  async function copyShareLink() {
    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyMessage("Share link copied.");
    } catch {
      setCopyMessage("Unable to copy share link.");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[460px,1fr]">
      <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#C09A45]">
            Donor Brief Editor
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            Build donor-facing brief
          </h1>
        </div>

        {initialIsStale ? (
          <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-amber-100">
            <p className="text-sm font-semibold">
              This donor brief is out of date with the latest review data.
            </p>
            <p className="mt-1 text-sm text-amber-100/85">
              Update and republish to reflect the latest information.
            </p>
          </div>
        ) : null}

        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm text-slate-200">Headline</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  headline: event.target.value,
                }))
              }
              value={form.headline}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-200">Ministry description</span>
            <textarea
              className="min-h-36 w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  ministry_description: event.target.value,
                }))
              }
              value={form.ministry_description}
            />
          </label>

          <div className="space-y-3">
            <p className="text-sm text-slate-200">Commendations</p>
            {form.commendations.map((value, index) => (
              <input
                className="w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
                key={`commendation-${index + 1}`}
                onChange={(event) =>
                  setForm((current) => {
                    const next = [...current.commendations];
                    next[index] = event.target.value;

                    return {
                      ...current,
                      commendations: next,
                    };
                  })
                }
                placeholder={`Commendation ${index + 1}`}
                value={value}
              />
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-200">Cautions</p>
            {form.cautions.map((value, index) => (
              <input
                className="w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
                key={`caution-${index + 1}`}
                onChange={(event) =>
                  setForm((current) => {
                    const next = [...current.cautions];
                    next[index] = event.target.value;

                    return {
                      ...current,
                      cautions: next,
                    };
                  })
                }
                placeholder={`Caution ${index + 1} (optional)`}
                value={value}
              />
            ))}
          </div>

          <label className="block space-y-2">
            <span className="text-sm text-slate-200">Recommendation level</span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  recommendation_level: event.target
                    .value as BriefFormData["recommendation_level"],
                }))
              }
              value={form.recommendation_level}
            >
              {RECOMMENDATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-[1.75rem] border border-white/10 bg-[#0B1622] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">
                  Donor brief sharing
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-400">
                  Publish this brief to create a public donor-facing link.
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                  isPublished
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                    : "border border-white/10 bg-white/[0.03] text-slate-300"
                }`}
              >
                {isPublished ? "Published" : "Not Published"}
              </span>
            </div>

            {publicUrl ? (
              <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200/90">
                  Share Link
                </p>
                <a
                  className="mt-2 block break-all text-sm text-emerald-100 underline underline-offset-4"
                  href={publicUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {publicUrl}
                </a>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                disabled={pending}
                onClick={() => void saveBrief()}
                type="button"
              >
                {pending ? "Saving..." : "Save brief"}
              </Button>

              {isPublished ? (
                <>
                  <Button asChild type="button" variant="outline">
                    <Link
                      href={`/applications/${applicationId}/brief/export`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Export PDF
                    </Link>
                  </Button>
                  <Button
                    disabled={pending || !publicUrl}
                    onClick={() => void copyShareLink()}
                    type="button"
                    variant="outline"
                  >
                    Copy Share Link
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() => void saveBrief(false)}
                    type="button"
                    variant="outline"
                  >
                    Unpublish
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild type="button" variant="outline">
                    <Link
                      href={`/applications/${applicationId}/brief/export`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Export PDF
                    </Link>
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() => void saveBrief(true)}
                    type="button"
                    variant="outline"
                  >
                    Publish Donor Brief
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <PrintButton label="Generate PDF" />
          </div>

          {message ? <p className="text-sm text-slate-300">{message}</p> : null}
          {copyMessage ? (
            <p className="text-sm text-slate-300">{copyMessage}</p>
          ) : null}
        </div>
      </section>

      <section className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-[2rem] border border-white/10 bg-[#102133]/70 p-4">
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-[#C09A45]">
            Live Preview
          </p>
          <BriefPreview brief={previewData} org={org} />
        </div>
      </section>
    </div>
  );
}
