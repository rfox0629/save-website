import { buildActorSnapshot, toActorIdentity } from "@/lib/attribution";
import "server-only";

import { revalidatePath } from "next/cache";

import { revokeBriefApprovalForMaterialChange } from "@/lib/brief-approval";
import { requireReviewerMutationAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildDiligencePayload,
  type DiligenceEngagementInput,
  type DiligenceKind,
  type DiligenceStatus,
  optionalText,
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

function revalidateDiligencePaths(applicationId: string) {
  revalidatePath(`/applications/${applicationId}`);
  revalidatePath(`/applications/${applicationId}/time-with-leadership`);
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

export async function createDiligenceEngagement(
  applicationId: string,
  input: DiligenceEngagementInput,
) {
  const { user } = await requireReviewerMutationAccess();
  const admin = createAdminClient();
  const db = admin;

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
    ...buildDiligencePayload(input),
    application_id: applicationId,
    created_by: user.id,
    ...buildActorSnapshot("created", toActorIdentity(user)),
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
  const db = admin;

  const { data: existing } = await admin
    .from("diligence_engagements")
    .select("donor_excerpt")
    .eq("id", engagementId)
    .eq("application_id", applicationId)
    .maybeSingle();
  const previousExcerpt =
    (existing as Pick<DiligenceEngagement, "donor_excerpt"> | null)
      ?.donor_excerpt ?? null;

  const payload = buildDiligencePayload(input);

  const { error } = await db
    .from("diligence_engagements")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", engagementId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  // The donor excerpt is the only part of an engagement a donor can ever read,
  // so changing it is a material donor-facing change. Everything else in the
  // record is internal and does not disturb an approval.
  if ((payload.donor_excerpt ?? null) !== previousExcerpt) {
    await revokeBriefApprovalForMaterialChange(
      applicationId,
      "the relational-diligence donor excerpt was changed",
    );
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
  const db = admin;

  const { error } = await db
    .from("applications")
    .update({ relational_diligence_exception: trimmed })
    .eq("id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateDiligencePaths(applicationId);
}
