"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type {
  VoiceAlignmentInsight,
  VoiceAlignmentSummary,
} from "@/lib/voice-alignment";

type VoiceAlignmentManagerProps = {
  applicationId: string;
  baseUrl: string;
  organizationName: string;
  summary: VoiceAlignmentSummary;
};

type RequestType = "external" | "internal";
type SummaryState = "generated" | "insufficient_data";

async function postJson(url: string, body: Record<string, unknown> = {}) {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    inviteUrl?: string;
    minimums?: {
      external: number;
      internal: number;
    };
    state?: SummaryState;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

function getAlignmentStatusClass(status: VoiceAlignmentInsight["alignment_status"]) {
  switch (status) {
    case "aligned":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "partially_aligned":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "misaligned":
      return "border-rose-400/20 bg-rose-400/10 text-rose-200";
    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

function formatAlignmentStatus(status: VoiceAlignmentInsight["alignment_status"]) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getFirstName(name: string) {
  const trimmed = name.trim();

  if (!trimmed) {
    return "there";
  }

  return trimmed.split(/\s+/)[0] ?? "there";
}

function buildInviteCopy({
  inviteUrl,
  organizationName,
  requestType,
  respondentName,
}: {
  inviteUrl: string;
  organizationName: string;
  requestType: RequestType;
  respondentName: string;
}) {
  const firstName = getFirstName(respondentName);

  if (requestType === "internal") {
    return `Hi ${firstName},

We’re currently walking closely with ${organizationName} to better understand their leadership, culture, and impact.

As part of this process, we’re inviting a small number of individuals who know the organization well to share their perspective.

Your input helps us ensure that what is seen publicly aligns with what is experienced internally.

This is a relational and reflective process intended to bring clarity and strengthen trust.

Your responses will be handled with care and will not be shared in a way that identifies you personally.

If you’re willing, please take a few minutes to complete this short form:

${inviteUrl}

Thank you for your time and for the role you play in supporting this work.

— SAVE Team`;
  }

  return `Hi ${firstName},

We’re currently working with ${organizationName} to better understand their leadership and overall impact.

As part of this process, we’re gathering perspective from individuals outside the organization who have interacted with or observed their work.

Your input helps us assess whether the organization’s public reputation reflects its lived reality.

This is a private and thoughtful process designed to support clarity and trust.

Your responses will be handled with care and will not be shared in a way that identifies you personally.

If you’re open to it, we’d greatly value your perspective:

${inviteUrl}

Thank you for your time.

— SAVE Team`;
}

function getRequestStatusMeta(status: string) {
  if (status === "responded") {
    return {
      label: "Completed",
      tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (status === "expired") {
    return {
      label: "Expired",
      tone: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    };
  }

  if (status === "invalid") {
    return {
      label: "Unavailable",
      tone: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    };
  }

  return {
    label: "Pending",
    tone: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  };
}

function formatDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return new Date(parsed).toLocaleString();
}

function getSampleQualityMeta(internalCount: number, externalCount: number) {
  if (internalCount >= 7 && externalCount >= 4) {
    return {
      label: "Robust sample",
      tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (internalCount >= 5 && externalCount >= 3) {
    return {
      label: "Moderate sample",
      tone: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    };
  }

  if (internalCount >= 3 && externalCount >= 2) {
    return {
      label: "Minimum threshold met",
      tone: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    };
  }

  return {
    label: "Insufficient feedback collected",
    tone: "border-white/10 bg-white/5 text-slate-300",
  };
}

function RequestForm({
  applicationId,
  organizationName,
  requestType,
}: {
  applicationId: string;
  organizationName: string;
  requestType: RequestType;
}) {
  const router = useRouter();
  const [respondentName, setRespondentName] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const title =
    requestType === "internal"
      ? "Request internal feedback"
      : "Request external feedback";

  async function submit() {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const result = await postJson(
        `/api/applications/${applicationId}/voice-alignment/requests`,
        {
          relationship,
          requestType,
          respondentEmail,
          respondentName,
        },
      );
      setRespondentName("");
      setRespondentEmail("");
      setRelationship("");
      setMessage(
        result.inviteUrl
          ? `Invite ready for ${organizationName}: ${result.inviteUrl}`
          : "Invite created.",
      );
      startTransition(() => router.refresh());
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create invite.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-[#0B1622]/70 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        <input
          className="w-full rounded-2xl border border-white/10 bg-[#102133] px-4 py-3 text-white"
          onChange={(event) => setRespondentName(event.target.value)}
          placeholder="Respondent name"
          value={respondentName}
        />
        <input
          className="w-full rounded-2xl border border-white/10 bg-[#102133] px-4 py-3 text-white"
          onChange={(event) => setRespondentEmail(event.target.value)}
          placeholder="Respondent email"
          type="email"
          value={respondentEmail}
        />
        <input
          className="w-full rounded-2xl border border-white/10 bg-[#102133] px-4 py-3 text-white"
          onChange={(event) => setRelationship(event.target.value)}
          placeholder="Role / relationship"
          value={relationship}
        />
        <Button
          className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
          disabled={pending || !respondentName.trim() || !respondentEmail.trim()}
          onClick={() => void submit()}
          type="button"
        >
          {pending
            ? "Creating..."
            : requestType === "internal"
              ? "Request Internal Feedback"
              : "Request External Feedback"}
        </Button>
        {message ? (
          <p className="break-all text-sm text-emerald-200">{message}</p>
        ) : null}
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      </div>
    </div>
  );
}

function InviteRow({
  baseUrl,
  createdAt,
  inviteToken,
  organizationName,
  relationship,
  requestType,
  respondedAt,
  respondentEmail,
  respondentName,
  status,
}: {
  baseUrl: string;
  createdAt: string;
  inviteToken: string;
  organizationName: string;
  relationship: string | null;
  requestType: RequestType;
  respondedAt: string | null;
  respondentEmail: string;
  respondentName: string;
  status: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const inviteUrl = `${baseUrl}/voice-alignment/${inviteToken}`;
  const statusMeta = getRequestStatusMeta(status);
  const createdLabel = formatDateTime(createdAt);
  const completedLabel = formatDateTime(respondedAt);
  const inviteCopy = buildInviteCopy({
    inviteUrl,
    organizationName,
    requestType,
    respondentName,
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMessage("Invite link copied.");
    } catch {
      setMessage("Unable to copy invite link.");
    }
  }

  async function copyInviteMessage() {
    try {
      await navigator.clipboard.writeText(inviteCopy);
      setMessage("Invite message copied.");
    } catch {
      setMessage("Unable to copy invite message.");
    }
  }

  async function resendInvite() {
    try {
      await navigator.clipboard.writeText(inviteCopy);
      setMessage("Invite message refreshed and copied for resending.");
    } catch {
      setMessage("Unable to prepare resend message.");
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-[#0B1622]/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{respondentName}</p>
          <p className="text-sm text-slate-300">{respondentEmail}</p>
          <p className="mt-1 text-sm text-slate-400">
            {requestType === "internal" ? "Internal" : "External"}
            {relationship ? ` · ${relationship}` : ""}
          </p>
          <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400">
            {createdLabel ? <p>Requested {createdLabel}</p> : null}
            {completedLabel ? <p>Completed {completedLabel}</p> : null}
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${statusMeta.tone}`}
        >
          {statusMeta.label}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => void copyInviteMessage()}
          size="sm"
          type="button"
          variant="outline"
        >
          Copy Invite Message
        </Button>
        <Button onClick={() => void copyLink()} size="sm" type="button" variant="outline">
          Copy Invite Link
        </Button>
        {statusMeta.label === "Pending" ? (
          <Button
            onClick={() => void resendInvite()}
            size="sm"
            type="button"
            variant="outline"
          >
            Resend Invite
          </Button>
        ) : null}
        <a
          className="break-all text-sm text-[#F4E3B2] underline underline-offset-4"
          href={inviteUrl}
          rel="noreferrer"
          target="_blank"
        >
          {inviteUrl}
        </a>
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Suggested Invite Copy
        </p>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">
          {inviteCopy}
        </pre>
      </div>
      {message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}
    </div>
  );
}

function InviteGroup({
  baseUrl,
  invites,
  organizationName,
  requestType,
}: {
  baseUrl: string;
  invites: VoiceAlignmentSummary["invites"];
  organizationName: string;
  requestType: RequestType;
}) {
  const filteredInvites = invites.filter(
    (invite) => invite.request_type === requestType,
  );
  const title =
    requestType === "internal" ? "Internal Requests" : "External Requests";
  const description =
    requestType === "internal"
      ? "People with direct internal context and lived experience."
      : "People outside the organization who can speak to reputation and observed experience.";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
          {filteredInvites.length} total
        </span>
      </div>

      {filteredInvites.length > 0 ? (
        filteredInvites.map((invite) => (
          <InviteRow
            baseUrl={baseUrl}
            createdAt={invite.created_at}
            inviteToken={invite.invite_token}
            key={invite.id}
            organizationName={organizationName}
            relationship={invite.relationship}
            requestType={invite.request_type}
            respondedAt={invite.responded_at}
            respondentEmail={invite.respondent_email}
            respondentName={invite.respondent_name}
            status={invite.status}
          />
        ))
      ) : (
        <p className="rounded-[1.5rem] border border-dashed border-white/10 bg-[#0B1622]/40 px-4 py-5 text-sm text-slate-400">
          No {requestType} requests have been created yet.
        </p>
      )}
    </div>
  );
}

function SummaryList({
  items,
  emptyLabel,
}: {
  items: string[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2 text-sm leading-7 text-slate-200">
      {items.map((item) => (
        <li key={item} className="rounded-2xl border border-white/10 bg-[#0B1622]/50 px-4 py-3">
          {item}
        </li>
      ))}
    </ul>
  );
}

function AlignmentSummaryCard({
  applicationId,
  summary,
}: {
  applicationId: string;
  summary: VoiceAlignmentSummary;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insufficientMessage, setInsufficientMessage] = useState<string | null>(null);
  const storedSummary = summary.alignmentSummary;
  const sampleQuality = getSampleQualityMeta(
    summary.internalCount,
    summary.externalCount,
  );

  async function generate() {
    setPending(true);
    setError(null);
    setInsufficientMessage(null);

    try {
      const result = await postJson(
        `/api/applications/${applicationId}/voice-alignment/summary`,
      );

      if (result.state === "insufficient_data") {
        const minimumInternal = result.minimums?.internal ?? 3;
        const minimumExternal = result.minimums?.external ?? 2;
        setInsufficientMessage(
          `Insufficient data. Collect at least ${minimumInternal} internal and ${minimumExternal} external responses before generating a summary.`,
        );
        return;
      }

      startTransition(() => router.refresh());
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Unable to generate alignment summary.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C09A45]">
            Alignment Summary
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            Internal and external perspective synthesis
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Generate one grounded synthesis after enough internal and external
            feedback has been collected.
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Minimum threshold: 3 internal and 2 external responses.
          </p>
        </div>
        <Button
          className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
          disabled={pending}
          onClick={() => void generate()}
          type="button"
        >
          {pending
            ? "Generating..."
            : storedSummary
              ? "Regenerate"
              : "Generate Alignment Summary"}
        </Button>
      </div>

      {insufficientMessage ? (
        <div className="mt-5 rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {insufficientMessage}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-[1.5rem] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {storedSummary ? (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getAlignmentStatusClass(
                storedSummary.status,
              )}`}
            >
              {formatAlignmentStatus(storedSummary.status)}
            </span>
            <p className="text-sm text-slate-400">
              Generated {new Date(storedSummary.generatedAt).toLocaleString()}
            </p>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${sampleQuality.tone}`}
            >
              {sampleQuality.label}
            </span>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-[1.75rem] border border-white/10 bg-[#0B1622]/60 p-5">
              <h4 className="text-lg font-semibold text-white">Internal Summary</h4>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Themes
                  </p>
                  <div className="mt-3">
                    <SummaryList
                      emptyLabel="No data available"
                      items={storedSummary.summary.internal_summary.themes}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Strengths
                  </p>
                  <div className="mt-3">
                    <SummaryList
                      emptyLabel="No data available"
                      items={storedSummary.summary.internal_summary.strengths}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Concerns
                  </p>
                  <div className="mt-3">
                    <SummaryList
                      emptyLabel="No data available"
                      items={storedSummary.summary.internal_summary.concerns}
                    />
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-[#0B1622]/60 p-5">
              <h4 className="text-lg font-semibold text-white">External Summary</h4>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Themes
                  </p>
                  <div className="mt-3">
                    <SummaryList
                      emptyLabel="No data available"
                      items={storedSummary.summary.external_summary.themes}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Strengths
                  </p>
                  <div className="mt-3">
                    <SummaryList
                      emptyLabel="No data available"
                      items={storedSummary.summary.external_summary.strengths}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Concerns
                  </p>
                  <div className="mt-3">
                    <SummaryList
                      emptyLabel="No data available"
                      items={storedSummary.summary.external_summary.concerns}
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-[1.75rem] border border-white/10 bg-[#0B1622]/60 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Alignment Insight
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {storedSummary.summary.alignment_insight || "No data available"}
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-[#0B1622]/60 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              Follow-up Questions
            </p>
            <div className="mt-3">
              <SummaryList
                emptyLabel="No data available"
                items={storedSummary.summary.follow_up_questions}
              />
            </div>
          </article>
        </div>
      ) : (
        <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/10 bg-[#0B1622]/50 p-6">
          <p className="text-base font-medium text-white">
            No alignment summary has been generated yet.
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
            Once enough feedback is collected, generate one synthesis to compare
            internal and external perspectives and surface follow-up questions
            for reviewers.
          </p>
        </div>
      )}
    </div>
  );
}

export function VoiceAlignmentManager({
  applicationId,
  baseUrl,
  organizationName,
  summary,
}: VoiceAlignmentManagerProps) {
  const sampleQuality = getSampleQualityMeta(
    summary.internalCount,
    summary.externalCount,
  );

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#C09A45]">
              Voice Alignment
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Invite-Based Perspective Collection
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
              Collect internal and external feedback with private invite links,
              then synthesize the feedback into one reviewer-only alignment
              summary.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-[#0B1622]/70 px-5 py-4 text-right">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Collection Status
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {summary.status}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {summary.internalCount} internal · {summary.externalCount} external
            </p>
            <div className="mt-3 flex justify-end">
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${sampleQuality.tone}`}
              >
                {sampleQuality.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AlignmentSummaryCard applicationId={applicationId} summary={summary} />

      <div className="grid gap-6 xl:grid-cols-2">
        <RequestForm
          applicationId={applicationId}
          organizationName={organizationName}
          requestType="internal"
        />
        <RequestForm
          applicationId={applicationId}
          organizationName={organizationName}
          requestType="external"
        />
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-lg font-semibold text-white">Invites</h3>
        <p className="mt-2 text-sm text-slate-300">
          Pending requests stay easy to spot, and resend remains a manual copy
          helper so you can follow up without extra tooling.
        </p>
        <div className="mt-5 space-y-8">
          {summary.invites.length > 0 ? (
            <>
              <InviteGroup
                baseUrl={baseUrl}
                invites={summary.invites}
                organizationName={organizationName}
                requestType="internal"
              />
              <InviteGroup
                baseUrl={baseUrl}
                invites={summary.invites}
                organizationName={organizationName}
                requestType="external"
              />
            </>
          ) : (
            <p className="text-sm text-slate-400">No invites have been created yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
