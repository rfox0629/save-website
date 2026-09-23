"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Badge,
  type BadgeTone,
  Btn,
  Callout,
  Card,
  CardBody,
  CardHeader,
  DataList,
  DataRow,
  EmptyState,
  Field,
  Input,
  formatDate,
} from "@/components/save/primitives";
import type {
  VoiceAlignmentInsight,
  VoiceAlignmentSummary,
} from "@/lib/voice-alignment";

/**
 * Voice alignment — collecting what the people around a ministry actually say.
 *
 * Restyled onto the approved SAVE design system in Phase B Stage 4. Every
 * behaviour is preserved from the original manager: the same invite endpoints,
 * the same synthesis endpoint and its insufficient-data handling, the same
 * invite copy, and the same clipboard helpers. Only the interface changed.
 */

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

function getAlignmentTone(
  status: VoiceAlignmentInsight["alignment_status"],
): BadgeTone {
  switch (status) {
    case "aligned":
      return "sage";
    case "partially_aligned":
      return "brass";
    case "misaligned":
      return "risk";
    default:
      return "neutral";
  }
}

function formatAlignmentStatus(
  status: VoiceAlignmentInsight["alignment_status"],
) {
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

SAVE is walking closely with ${organizationName} to better understand leadership, culture, and impact.

As part of this process, a small number of people who know the organization well are being invited to share their perspective.

Your input helps confirm that what is seen publicly aligns with what is experienced internally.

This is a relational and reflective process intended to bring clarity and strengthen trust.

Your responses will be handled with care and will not be shared in a way that identifies you personally.

If you are willing, please take a few minutes to complete this short form:

${inviteUrl}

Thank you for your time and for the role you play in supporting this work.

SAVE Team`;
  }

  return `Hi ${firstName},

SAVE is working with ${organizationName} to better understand leadership and overall impact.

As part of this process, perspective is being gathered from individuals outside the organization who have interacted with or observed their work.

Your input helps us assess whether the organization’s public reputation reflects its lived reality.

This is a private and thoughtful process designed to support clarity and trust.

Your responses will be handled with care and will not be shared in a way that identifies you personally.

If you are open to it, your perspective would be greatly valued:

${inviteUrl}

Thank you for your time.

SAVE Team`;
}

function getRequestStatusMeta(status: string): {
  label: string;
  tone: BadgeTone;
} {
  if (status === "responded") {
    return { label: "Completed", tone: "sage" };
  }

  if (status === "expired") {
    return { label: "Expired", tone: "brass" };
  }

  if (status === "invalid") {
    return { label: "Unavailable", tone: "neutral" };
  }

  return { label: "Pending", tone: "ink" };
}

function getSampleQualityMeta(
  internalCount: number,
  externalCount: number,
): { label: string; tone: BadgeTone } {
  if (internalCount >= 7 && externalCount >= 4) {
    return { label: "Robust sample", tone: "sage" };
  }

  if (internalCount >= 5 && externalCount >= 3) {
    return { label: "Moderate sample", tone: "ink" };
  }

  if (internalCount >= 3 && externalCount >= 2) {
    return { label: "Minimum threshold met", tone: "brass" };
  }

  return { label: "Insufficient feedback collected", tone: "neutral" };
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
    <Card>
      <CardHeader
        description={
          requestType === "internal"
            ? "People with direct internal context and lived experience."
            : "People outside the organization who can speak to reputation and observed experience."
        }
        title={
          requestType === "internal"
            ? "Request internal feedback"
            : "Request external feedback"
        }
      />
      <CardBody className="space-y-3.5">
        <Field label="Respondent name" required>
          <Input
            onChange={(event) => setRespondentName(event.target.value)}
            value={respondentName}
          />
        </Field>
        <Field label="Respondent email" required>
          <Input
            onChange={(event) => setRespondentEmail(event.target.value)}
            type="email"
            value={respondentEmail}
          />
        </Field>
        <Field label="Role or relationship">
          <Input
            onChange={(event) => setRelationship(event.target.value)}
            value={relationship}
          />
        </Field>
        <Btn
          disabled={
            pending || !respondentName.trim() || !respondentEmail.trim()
          }
          onClick={() => void submit()}
          size="sm"
          variant="secondary"
        >
          {pending ? "Creating…" : "Create invite"}
        </Btn>
        {message ? (
          <p className="break-all text-caption text-sage-700">{message}</p>
        ) : null}
        {error ? <p className="text-caption text-risk-700">{error}</p> : null}
      </CardBody>
    </Card>
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
  const [showCopy, setShowCopy] = useState(false);
  const inviteUrl = `${baseUrl}/voice-alignment/${inviteToken}`;
  const statusMeta = getRequestStatusMeta(status);
  const inviteCopy = buildInviteCopy({
    inviteUrl,
    organizationName,
    requestType,
    respondentName,
  });

  async function copy(text: string, confirmation: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(confirmation);
    } catch {
      setMessage("Unable to copy — select the text below instead.");
      setShowCopy(true);
    }
  }

  return (
    <div className="px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900">{respondentName}</p>
          <p className="text-caption text-ink-500">{respondentEmail}</p>
          <p className="mt-0.5 text-caption text-ink-400">
            {requestType === "internal" ? "Internal" : "External"}
            {relationship ? ` · ${relationship}` : ""}
          </p>
          <p className="save-numeric mt-1 text-micro text-ink-400">
            Requested {formatDate(createdAt)}
            {respondedAt ? ` · Completed ${formatDate(respondedAt)}` : ""}
          </p>
        </div>
        <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Btn
          onClick={() => void copy(inviteCopy, "Invite message copied.")}
          size="sm"
          variant="secondary"
        >
          Copy invite message
        </Btn>
        <Btn
          onClick={() => void copy(inviteUrl, "Invite link copied.")}
          size="sm"
          variant="ghost"
        >
          Copy link
        </Btn>
        <Btn
          onClick={() => setShowCopy((value) => !value)}
          size="sm"
          variant="ghost"
        >
          {showCopy ? "Hide message" : "Show message"}
        </Btn>
      </div>

      {showCopy ? (
        <div className="mt-3 rounded-md border border-hairline bg-surface-sunken px-4 py-3">
          <p className="save-numeric break-all text-micro text-ink-500">
            {inviteUrl}
          </p>
          <pre className="mt-2.5 whitespace-pre-wrap font-[inherit] text-caption leading-relaxed text-ink-600">
            {inviteCopy}
          </pre>
        </div>
      ) : null}

      {message ? (
        <p className="mt-2 text-caption text-ink-500">{message}</p>
      ) : null}
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
  const filtered = invites.filter(
    (invite) => invite.request_type === requestType,
  );

  return (
    <Card>
      <CardHeader
        action={<Badge tone="neutral">{filtered.length}</Badge>}
        description={
          requestType === "internal"
            ? "People with direct internal context and lived experience."
            : "People outside the organization who can speak to reputation."
        }
        title={
          requestType === "internal" ? "Internal requests" : "External requests"
        }
      />
      {filtered.length > 0 ? (
        <div className="divide-y divide-hairline">
          {filtered.map((invite) => (
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
          ))}
        </div>
      ) : (
        <EmptyState
          description={`No ${requestType} requests have been created yet.`}
          title="Nothing requested"
        />
      )}
    </Card>
  );
}

function SummaryList({
  emptyLabel,
  items,
}: {
  emptyLabel: string;
  items: string[];
}) {
  if (items.length === 0) {
    return <p className="text-caption text-ink-400">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li
          className="rounded-md bg-surface-sunken px-3.5 py-2.5 text-caption leading-relaxed text-ink-600"
          key={item}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function PerspectiveColumn({
  concerns,
  strengths,
  themes,
  title,
}: {
  concerns: string[];
  strengths: string[];
  themes: string[];
  title: string;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
      <div className="mt-3 space-y-4">
        <div>
          <p className="save-eyebrow mb-2 text-ink-400">Themes</p>
          <SummaryList emptyLabel="No data available" items={themes} />
        </div>
        <div>
          <p className="save-eyebrow mb-2 text-ink-400">Strengths</p>
          <SummaryList emptyLabel="No data available" items={strengths} />
        </div>
        <div>
          <p className="save-eyebrow mb-2 text-ink-400">Concerns</p>
          <SummaryList emptyLabel="No data available" items={concerns} />
        </div>
      </div>
    </div>
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
  const [insufficientMessage, setInsufficientMessage] = useState<string | null>(
    null,
  );
  const stored = summary.alignmentSummary;

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
          `Collect at least ${minimumInternal} internal and ${minimumExternal} external responses before generating a summary.`,
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
    <Card>
      <CardHeader
        action={
          <Btn
            disabled={pending}
            onClick={() => void generate()}
            size="sm"
            variant="secondary"
          >
            {pending
              ? "Generating…"
              : stored
                ? "Regenerate"
                : "Generate synthesis"}
          </Btn>
        }
        description="One grounded synthesis comparing what insiders say with what outsiders say. Minimum threshold: 3 internal and 2 external responses."
        title="Alignment synthesis"
      />
      <CardBody className="space-y-5">
        {insufficientMessage ? (
          <Callout title="Not enough responses yet" tone="brass">
            {insufficientMessage}
          </Callout>
        ) : null}

        {error ? (
          <Callout title="Could not generate" tone="risk">
            {error}
          </Callout>
        ) : null}

        {stored ? (
          <>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone={getAlignmentTone(stored.status)}>
                {formatAlignmentStatus(stored.status)}
              </Badge>
              <span className="save-numeric text-caption text-ink-400">
                Generated {formatDate(stored.generatedAt)}
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <PerspectiveColumn
                concerns={stored.summary.internal_summary.concerns}
                strengths={stored.summary.internal_summary.strengths}
                themes={stored.summary.internal_summary.themes}
                title="Internal perspective"
              />
              <PerspectiveColumn
                concerns={stored.summary.external_summary.concerns}
                strengths={stored.summary.external_summary.strengths}
                themes={stored.summary.external_summary.themes}
                title="External perspective"
              />
            </div>

            <div>
              <p className="save-eyebrow mb-2 text-ink-400">
                Alignment insight
              </p>
              <p className="text-sm leading-relaxed text-ink-700">
                {stored.summary.alignment_insight || "No data available"}
              </p>
            </div>

            <div>
              <p className="save-eyebrow mb-2 text-ink-400">
                Follow-up questions
              </p>
              <SummaryList
                emptyLabel="No data available"
                items={stored.summary.follow_up_questions}
              />
            </div>
          </>
        ) : (
          <EmptyState
            description="Once enough feedback is collected, generate one synthesis to compare internal and external perspectives and surface follow-up questions."
            title="No synthesis yet"
          />
        )}
      </CardBody>
    </Card>
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
  const responded = summary.invites.filter((invite) => invite.response).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          action={
            <Badge tone={sampleQuality.tone}>{sampleQuality.label}</Badge>
          }
          description="Collect internal and external perspective through private invite links, then synthesize it into one reviewer-only summary. Reference feedback is never attributed back to the person who gave it."
          title="Voice alignment"
        />
        <CardBody>
          <DataList>
            <DataRow
              label="Collection status"
              value={<Badge tone="neutral">{summary.status}</Badge>}
            />
            <DataRow label="Internal responses" value={summary.internalCount} />
            <DataRow label="External responses" value={summary.externalCount} />
            <DataRow
              label="Invitations"
              value={`${responded} of ${summary.invites.length} returned`}
            />
          </DataList>
        </CardBody>
      </Card>

      <AlignmentSummaryCard applicationId={applicationId} summary={summary} />

      <div className="grid gap-6 lg:grid-cols-2">
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

      <div className="grid gap-6 lg:grid-cols-2">
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
      </div>
    </div>
  );
}
