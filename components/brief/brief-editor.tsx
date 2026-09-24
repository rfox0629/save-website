"use client";

import { useMemo, useState } from "react";

import { BriefPreview } from "@/components/brief/brief-preview";
import { PrintButton } from "@/components/brief/print-button";
import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
  formatDate,
} from "@/components/save/primitives";
import { RECOMMENDATION_LEVELS, type BriefFormData } from "@/lib/brief-shared";
import type { Organizations } from "@/lib/supabase/types";

/**
 * The donor brief editor, on the approved design system.
 *
 * Behaviour is unchanged from the original dark editor — the same POST
 * /api/brief payload, the same publish/unpublish semantics, the same live
 * preview. What is new is that the second-reviewer gate (decision B3) is
 * visible here, so a reviewer understands why publishing is unavailable
 * instead of meeting a raw API error when they press the button.
 */

type SaveResult = {
  error?: string;
  published?: boolean;
  public_slug?: string | null;
  public_url?: string | null;
};

export function BriefEditor({
  applicationId,
  approvedAt,
  approvedByEmail,
  initialData,
  initialGeneratedAt,
  initialIsStale,
  initialPublicUrl,
  isAuthor,
  org,
}: {
  applicationId: string;
  approvedAt: string | null;
  approvedByEmail: string | null;
  initialData: BriefFormData;
  initialGeneratedAt: string | null;
  initialIsStale: boolean;
  initialPublicUrl: string | null;
  isAuthor: boolean;
  org: Organizations;
}) {
  const [form, setForm] = useState(initialData);
  const [publicUrl, setPublicUrl] = useState(initialPublicUrl);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const generatedAt = initialGeneratedAt ?? new Date().toISOString();
  const isPublished = Boolean(publicUrl) || form.published;
  const approved = Boolean(approvedAt);

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
    setError(null);
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
        published
          ? "Donor brief published."
          : publishedOverride === false
            ? "Donor brief unpublished."
            : "Draft saved.",
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save brief.",
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
      setCopyMessage("Unable to copy — select the link above instead.");
    }
  }

  function updateList(
    key: "cautions" | "commendations",
    index: number,
    value: string,
  ) {
    setForm((current) => {
      const next = [...current[key]];
      next[index] = value;
      return { ...current, [key]: next };
    });
  }

  function addListEntry(key: "cautions" | "commendations") {
    setForm((current) => ({ ...current, [key]: [...current[key], ""] }));
  }

  // Removing an entry is how a reviewer curates. It is a deliberate act with a
  // confirmation, never something the form does quietly on their behalf.
  function removeListEntry(key: "cautions" | "commendations", index: number) {
    const existing = form[key][index]?.trim();

    if (
      existing &&
      !window.confirm(
        key === "cautions"
          ? "Remove this caution from the brief? A donor will not see it."
          : "Remove this commendation from the brief?",
      )
    ) {
      return;
    }

    setForm((current) => ({
      ...current,
      [key]: current[key].filter((_, position) => position !== index),
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
      <div className="min-w-0 space-y-6">
        {initialIsStale ? (
          <Callout title="This brief is behind the review" tone="clay">
            The assessment has changed since this brief was generated. Update
            and republish so donors are reading the current picture.
          </Callout>
        ) : null}

        <Card>
          <CardHeader
            description="Two sentences a donor sees first, then the fuller description."
            title="What donors read"
          />
          <CardBody className="space-y-5">
            <Field label="Headline" required>
              <Input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    headline: event.target.value,
                  }))
                }
                value={form.headline}
              />
            </Field>

            <Field
              help="What a donor needs to know before a first conversation."
              label="Ministry description"
              required
            >
              <Textarea
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    ministry_description: event.target.value,
                  }))
                }
                rows={7}
                value={form.ministry_description}
              />
            </Field>

            <Field label="Recommendation level" required>
              <Select
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
              </Select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            description="Say plainly what is strong and what a donor should weigh. Cautions are not a failure — they are the honesty that makes the commendations credible."
            title="Commendations and cautions"
          />
          <CardBody className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <p className="save-eyebrow text-ink-400">
                Commendations ({form.commendations.length})
              </p>
              {form.commendations.map((value, index) => (
                <div className="flex gap-2" key={`commendation-${index + 1}`}>
                  <Input
                    onChange={(event) =>
                      updateList("commendations", index, event.target.value)
                    }
                    placeholder={`Commendation ${index + 1}`}
                    value={value}
                  />
                  <Btn
                    aria-label={`Remove commendation ${index + 1}`}
                    onClick={() => removeListEntry("commendations", index)}
                    size="sm"
                    variant="ghost"
                  >
                    Remove
                  </Btn>
                </div>
              ))}
              <Btn
                onClick={() => addListEntry("commendations")}
                size="sm"
                variant="secondary"
              >
                Add a commendation
              </Btn>
            </div>
            <div className="space-y-3">
              <p className="save-eyebrow text-ink-400">
                Cautions ({form.cautions.length})
              </p>
              {form.cautions.map((value, index) => (
                <div className="flex gap-2" key={`caution-${index + 1}`}>
                  <Input
                    onChange={(event) =>
                      updateList("cautions", index, event.target.value)
                    }
                    placeholder={`Caution ${index + 1}`}
                    value={value}
                  />
                  <Btn
                    aria-label={`Remove caution ${index + 1}`}
                    onClick={() => removeListEntry("cautions", index)}
                    size="sm"
                    variant="ghost"
                  >
                    Remove
                  </Btn>
                </div>
              ))}
              <Btn
                onClick={() => addListEntry("cautions")}
                size="sm"
                variant="secondary"
              >
                Add a caution
              </Btn>
              <p className="text-caption leading-relaxed text-ink-400">
                Every material caution belongs here. If one should not reach
                donors, remove it deliberately — the brief will not drop it for
                you.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            action={
              approved ? (
                <Badge tone="sage">Second reviewer approved</Badge>
              ) : (
                <Badge tone="clay">Awaiting second reviewer</Badge>
              )
            }
            description="SAVE does not put its name behind a ministry on one reviewer's judgement."
            title="Publishing"
          />
          <CardBody className="space-y-5">
            {approved ? (
              <Callout title="Approved for donors" tone="sage">
                Approved by {approvedByEmail ?? "another reviewer"} on{" "}
                {formatDate(approvedAt)}. Publishing is available.
              </Callout>
            ) : (
              <Callout
                title="A second reviewer must approve this first"
                tone="clay"
              >
                {isAuthor
                  ? "You wrote this brief, so you cannot be its second reviewer. Another reviewer approves it from the reviewer workspace."
                  : "Approval is recorded from the reviewer workspace. Until then this brief cannot be published to donors."}
              </Callout>
            )}

            <label className="flex items-start gap-3 rounded-md border border-hairline px-4 py-3.5">
              <input
                checked={form.include_voice_alignment}
                className="save-focus-ring mt-0.5 h-4 w-4"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    include_voice_alignment: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>
                <span className="block text-sm font-medium text-ink-900">
                  Include voice alignment in the donor brief
                </span>
                <span className="mt-1 block text-caption leading-relaxed text-ink-500">
                  Off by default. When enabled, the published brief may show a
                  reviewer-approved summary of how internal and external
                  perspective line up. Individual references are never named.
                </span>
              </span>
            </label>

            {publicUrl ? (
              <div className="rounded-md border border-hairline bg-surface-sunken px-4 py-3.5">
                <p className="save-eyebrow text-ink-400">Share link</p>
                <a
                  className="save-focus-ring mt-1.5 block break-all text-caption text-ink-700 underline decoration-hairline underline-offset-4"
                  href={publicUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {publicUrl}
                </a>
              </div>
            ) : null}

            {message ? (
              <p className="text-caption text-sage-700">{message}</p>
            ) : null}
            {error ? (
              <p className="text-caption text-risk-700">{error}</p>
            ) : null}
            {copyMessage ? (
              <p className="text-caption text-ink-500">{copyMessage}</p>
            ) : null}
          </CardBody>

          <CardFooter>
            <div className="flex flex-wrap gap-2.5">
              <Btn
                disabled={pending}
                onClick={() => void saveBrief()}
                size="sm"
                variant="secondary"
              >
                {pending ? "Saving…" : "Save draft"}
              </Btn>
              <Btn
                href={`/applications/${applicationId}/brief/export`}
                size="sm"
                variant="ghost"
              >
                Export PDF
              </Btn>
              <PrintButton label="Print" />
            </div>

            <div className="flex flex-wrap gap-2.5">
              {isPublished ? (
                <>
                  <Btn
                    disabled={pending || !publicUrl}
                    onClick={() => void copyShareLink()}
                    size="sm"
                    variant="ghost"
                  >
                    Copy share link
                  </Btn>
                  <Btn
                    disabled={pending}
                    onClick={() => void saveBrief(false)}
                    size="sm"
                    variant="danger"
                  >
                    Unpublish
                  </Btn>
                </>
              ) : (
                <Btn
                  disabled={pending || !approved}
                  onClick={() => void saveBrief(true)}
                  size="sm"
                >
                  {pending ? "Publishing…" : "Publish to donors"}
                </Btn>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
        <Card>
          <CardHeader
            description="Exactly what a donor will see."
            title="Preview"
          />
          <CardBody className="overflow-x-auto">
            <BriefPreview brief={previewData} org={org} />
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
