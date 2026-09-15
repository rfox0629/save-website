import "server-only";

import { revalidatePath } from "next/cache";

import { requireReviewerMutationAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CONFIDENCE_LEVELS,
  DILIGENCE_KINDS,
  DILIGENCE_STATUSES,
  DILIGENCE_VISIBILITIES,
  type DiligenceKind,
  type DiligenceStatus,
} from "@/lib/diligence-shared";
import type { Applications, DiligenceEngagement } from "@/lib/supabase/types";

/**
 * Time With Leadership — SAVE's relational diligence record.
 *
 * SAVE's judgement is not only documentary: sitting with a leadership team,
 * sharing a meal, visiting the work. This module records those engagements and
 * answers the one question the trust tier depends on — has SAVE actually spent
 * in-person time with this ministry's leadership?
 *
 * Internal by default. Nothing here reaches a ministry or a donor except
 * through a deliberately crafted excerpt on a published brief.
 */

export * from "@/lib/diligence-shared";

/**
 * Engagement kinds that constitute being physically present with the
 * leadership. Founder decision B4 makes this the gate for the top trust tier;
 * a video call is real diligence but it is not in-person.
 */
const IN_PERSON_KINDS = new Set<DiligenceKind>(["onsite_visit", "shared_meal"]);

/** An engagement only counts once it has actually happened. */
const COMPLETED_STATUSES = new Set<DiligenceStatus>([
  "completed",
  "written_up",
]);

export type RelationalDiligenceStatus = {
  /** A documented SAVE-admin exception, if one was recorded. Never silent. */
  exception: string | null;
  /** In-person engagements that have actually taken place. */
  inPersonCompleted: DiligenceEngagement[];
  /** True when in-person diligence has happened, or a documented exception stands. */
  met: boolean;
  /** True only when real in-person time has happened (ignores any exception). */
  satisfiedByEngagement: boolean;
  /** Everything recorded, in-person or not. */
  total: number;
};

function assertOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(
      `${field} must be one of: ${allowed.join(", ")}.`,
    );
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

function optionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function getDiligenceEngagements(applicationId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("diligence_engagements")
    .select("*")
    .eq("application_id", applicationId)
    .order("occurred_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (data ?? []) as DiligenceEngagement[];
}

/**
 * Whether the relational-diligence requirement for the top trust tier is
 * satisfied, and on what basis. An exception is recorded on the application by
 * a SAVE admin and is always surfaced alongside the tier — decision B4 is
 * explicit that an exception is never silent.
 */
export function getRelationalDiligenceStatus(
  engagements: DiligenceEngagement[],
  application: Pick<Applications, "relational_diligence_exception">,
): RelationalDiligenceStatus {
  const inPersonCompleted = engagements.filter(
    (engagement) =>
      IN_PERSON_KINDS.has(engagement.kind as DiligenceKind) &&
      COMPLETED_STATUSES.has(engagement.status as DiligenceStatus),
  );
  const exception = optionalText(application.relational_diligence_exception);
  const satisfiedByEngagement = inPersonCompleted.length > 0;

  return {
    exception,
    inPersonCompleted,
    met: satisfiedByEngagement || exception !== null,
    satisfiedByEngagement,
    total: engagements.length,
  };
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

function buildPayload(input: DiligenceEngagementInput) {
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
    donor_excerpt: optionalText(input.donorExcerpt),
    follow_ups: Array.isArray(input.followUps) ? input.followUps : [],
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
    visibility: input.visibility
      ? assertOneOf(input.visibility, DILIGENCE_VISIBILITIES, "Visibility")
      : "internal_only",
  };
}

function revalidateDiligencePaths(applicationId: string) {
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath(`/applications/${applicationId}/time-with-leadership`);
}

export async function createDiligenceEngagement(
  applicationId: string,
  input: DiligenceEngagementInput,
) {
  const { user } = await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { data: application } = await admin
    .from("applications")
    .select("organization_id")
    .eq("id", applicationId)
    .maybeSingle();
  const organizationId = (
    application as Pick<Applications, "organization_id"> | null
  )?.organization_id;

  if (!organizationId) {
    throw new Error("Application organization could not be found.");
  }

  const { error } = await db.from("diligence_engagements").insert({
    ...buildPayload(input),
    application_id: applicationId,
    created_by: user.id,
    organization_id: organizationId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidateDiligencePaths(applicationId);
}

export async function updateDiligenceEngagement(
  applicationId: string,
  engagementId: string,
  input: DiligenceEngagementInput,
) {
  await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { error } = await db
    .from("diligence_engagements")
    .update({
      ...buildPayload(input),
      updated_at: new Date().toISOString(),
    })
    .eq("id", engagementId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateDiligencePaths(applicationId);
}

/**
 * Record (or clear) a documented exception to the in-person requirement.
 * Admin-only: a reviewer cannot waive the relational standard for their own
 * assessment.
 */
export async function setRelationalDiligenceException(
  applicationId: string,
  reason: string | null,
) {
  const { profile } = await requireReviewerMutationAccess();

  if (profile?.role !== "admin") {
    throw new Error(
      "Only a SAVE administrator can record an exception to in-person diligence.",
    );
  }

  const trimmed = optionalText(reason);
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { error } = await db
    .from("applications")
    .update({ relational_diligence_exception: trimmed })
    .eq("id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateDiligencePaths(applicationId);
}
