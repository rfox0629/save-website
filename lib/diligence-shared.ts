/**
 * Time With Leadership vocabularies, shared by server and client.
 *
 * These values mirror the `diligence_engagements` check constraints exactly, so
 * a form can never offer something the database will reject. They live apart
 * from `lib/diligence.ts` because that module is server-only (it holds the
 * service-role client) and the record/edit forms are client components.
 */

export const DILIGENCE_KINDS = [
  "onsite_visit",
  "shared_meal",
  "internal_leadership_review",
  "reference_conversation",
  "video_call",
  "other",
] as const;

export const DILIGENCE_STATUSES = [
  "scheduled",
  "completed",
  "written_up",
] as const;

export const DILIGENCE_VISIBILITIES = [
  "internal_only",
  "summary_shareable",
] as const;

export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;

export type DiligenceKind = (typeof DILIGENCE_KINDS)[number];
export type DiligenceStatus = (typeof DILIGENCE_STATUSES)[number];
export type DiligenceVisibility = (typeof DILIGENCE_VISIBILITIES)[number];
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const DILIGENCE_KIND_LABELS: Record<DiligenceKind, string> = {
  internal_leadership_review: "Internal leadership review",
  onsite_visit: "Onsite visit",
  other: "Other engagement",
  reference_conversation: "Reference conversation",
  shared_meal: "Shared meal",
  video_call: "Video call",
};

export const DILIGENCE_STATUS_LABELS: Record<DiligenceStatus, string> = {
  completed: "Completed",
  scheduled: "Scheduled",
  written_up: "Written up",
};

function assertOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`${field} must be one of: ${allowed.join(", ")}.`);
  }

  return value as T;
}

function optionalOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return assertOneOf(value, allowed, field);
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function optionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type DiligenceEngagementInput = {
  characterConfidence?: unknown;
  concerns?: unknown;
  cultureConfidence?: unknown;
  cultureObservations?: unknown;
  donorExcerpt?: unknown;
  followUps?: unknown;
  kind: unknown;
  leadershipCharacterObservations?: unknown;
  linkedVoiceAlignmentRequestId?: unknown;
  location?: unknown;
  ministryParticipants?: unknown;
  narrative?: unknown;
  occurredOn?: unknown;
  orgHealthConfidence?: unknown;
  orgHealthObservations?: unknown;
  privateNotes?: unknown;
  saveParticipants?: unknown;
  status?: unknown;
  strengths?: unknown;
  visibility?: unknown;
};

export function buildDiligencePayload(input: DiligenceEngagementInput) {
  const visibility = input.visibility
    ? assertOneOf(input.visibility, DILIGENCE_VISIBILITIES, "Visibility")
    : "internal_only";

  // A donor excerpt is the only part of an engagement a donor can ever read, so
  // an internal-only engagement must not carry one. Enforced here rather than in
  // the form: the field is hidden when visibility is internal-only, which means
  // a stale value can be submitted without any reviewer seeing it.
  const donorExcerpt =
    visibility === "summary_shareable" ? optionalText(input.donorExcerpt) : null;

  return {
    character_confidence: optionalOneOf(
      input.characterConfidence,
      CONFIDENCE_LEVELS,
      "Character confidence",
    ),
    concerns: toStringArray(input.concerns),
    culture_confidence: optionalOneOf(
      input.cultureConfidence,
      CONFIDENCE_LEVELS,
      "Culture confidence",
    ),
    culture_observations: optionalText(input.cultureObservations),
    donor_excerpt: donorExcerpt,
    follow_ups: toStringArray(input.followUps),
    kind: assertOneOf(input.kind, DILIGENCE_KINDS, "Engagement kind"),
    leadership_character_observations: optionalText(
      input.leadershipCharacterObservations,
    ),
    linked_voice_alignment_request_id: optionalText(
      input.linkedVoiceAlignmentRequestId,
    ),
    location: optionalText(input.location),
    ministry_participants: Array.isArray(input.ministryParticipants)
      ? input.ministryParticipants
      : [],
    narrative: optionalText(input.narrative),
    occurred_on: optionalText(input.occurredOn),
    org_health_confidence: optionalOneOf(
      input.orgHealthConfidence,
      CONFIDENCE_LEVELS,
      "Organizational health confidence",
    ),
    org_health_observations: optionalText(input.orgHealthObservations),
    private_notes: optionalText(input.privateNotes),
    save_participants: toStringArray(input.saveParticipants),
    status: input.status
      ? assertOneOf(input.status, DILIGENCE_STATUSES, "Status")
      : "scheduled",
    strengths: toStringArray(input.strengths),
    visibility,
  };
}
