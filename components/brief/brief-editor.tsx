"use client";

import { useMemo, useState } from "react";

import { BriefPreview } from "@/components/brief/brief-preview";
import { PrintButton } from "@/components/brief/print-button";
import { Button } from "@/components/ui/button";
import { RECOMMENDATION_LEVELS, type BriefFormData } from "@/lib/brief-shared";
import type { Organizations } from "@/lib/supabase/types";

type SaveResult = {
  error?: string;
  public_slug?: string | null;
  public_url?: string | null;
};

export function BriefEditor({
  applicationId,
  initialData,
  initialGeneratedAt,
  initialPublicUrl,
  org,
}: {
  applicationId: string;
  initialData: BriefFormData;
  initialGeneratedAt: string | null;
  initialPublicUrl: string | null;
  org: Organizations;
}) {
  const [form, setForm] = useState(initialData);
  const [publicUrl, setPublicUrl] = useState(initialPublicUrl);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const generatedAt = initialGeneratedAt ?? new Date().toISOString();

  const previewData = useMemo(
    () => ({
      ...form,
      generated_at: generatedAt,
      headline: form.headline,
      recommendation_level: form.recommendation_level,
    }),
    [form, generatedAt],
  );

  async function saveBrief() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/brief", {
        body: JSON.stringify({
          application_id: applicationId,
          ...form,
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

      setPublicUrl(result.public_url ?? null);
      setMessage(
        form.published ? "Brief saved and published." : "Brief saved as draft.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save brief.",
      );
    } finally {
      setPending(false);
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

          <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Publish brief</p>
              <p className="text-xs text-slate-400">
                Makes the donor brief available at a public URL.
              </p>
            </div>
            <input
              checked={form.published}
              className="h-5 w-5 accent-[#C09A45]"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  published: event.target.checked,
                }))
              }
              type="checkbox"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
              disabled={pending}
              onClick={() => void saveBrief()}
              type="button"
            >
              {pending ? "Saving..." : "Save brief"}
            </Button>
            <PrintButton label="Generate PDF" />
          </div>

          {publicUrl ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Public URL:{" "}
              <a
                className="underline"
                href={publicUrl}
                rel="noreferrer"
                target="_blank"
              >
                {publicUrl}
              </a>
            </div>
          ) : null}

          {message ? <p className="text-sm text-slate-300">{message}</p> : null}
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
