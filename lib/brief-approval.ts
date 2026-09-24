import "server-only";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import type { DonorBrief } from "@/lib/supabase/types";

/**
 * Founder decision (Phase B): a material donor-facing edit after second-reviewer
 * approval revokes that approval and requires reapproval.
 *
 * "Material" is deliberately narrow — donor-facing assessment substance only:
 * scores/tier/recommendation, the brief's own content (headline, description,
 * commendations, cautions, recommendation level, whether voice alignment is
 * included), and the relational-diligence donor excerpt. Internal reviewer
 * notes, assignment, status and other internal metadata do NOT revoke approval.
 *
 * Revoking also unpublishes. Publishing requires an approval, so leaving a brief
 * `published = true` with `approved_by = NULL` would be an incoherent state: the
 * staff UI would say "Published to donors" while every donor-facing read
 * correctly refuses to show it.
 */

export type ApprovalRevocation = {
  reason: string;
  revoked: boolean;
  /** True when the brief had been live to donors before this edit. */
  wasPublished: boolean;
};

export async function revokeBriefApprovalForMaterialChange(
  applicationId: string,
  reason: string,
): Promise<ApprovalRevocation> {
  const admin = createAdminClient();
  const db = admin;

  const { data } = await admin
    .from("donor_briefs")
    .select("id, approved_by, published")
    .eq("application_id", applicationId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const brief = data as Pick<
    DonorBrief,
    "approved_by" | "id" | "published"
  > | null;

  // Nothing to revoke: no brief, or it was never approved.
  if (!brief?.id || !brief.approved_by) {
    return { reason, revoked: false, wasPublished: false };
  }

  // The approval described the brief as it was. Once the donor-facing content
  // changes, the review no longer applies to what is there, so the brief
  // returns to never-reviewed rather than to "changes requested" — no reviewer
  // asked for this edit.
  const { error } = await db
    .from("donor_briefs")
    .update({
      approved_at: null,
      approved_by: null,
      published: false,
      review_note: null,
      review_outcome: null,
    })
    .eq("id", brief.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath(`/applications/${applicationId}/brief`);

  return {
    reason,
    revoked: true,
    wasPublished: Boolean(brief.published),
  };
}

/**
 * The donor-brief fields whose change is material. `published` is excluded
 * because publishing is its own gated action, and `slug`/`pdf_path` are
 * plumbing rather than assessment substance.
 */
export function getMaterialBriefChanges(
  before: Pick<
    DonorBrief,
    | "cautions"
    | "commendations"
    | "headline"
    | "include_voice_alignment"
    | "ministry_description"
    | "recommendation_level"
  >,
  after: {
    cautions: string[];
    commendations: string[];
    headline: string | null;
    include_voice_alignment: boolean;
    ministry_description: string | null;
    recommendation_level: string | null;
  },
) {
  const changed: string[] = [];
  const sameList = (left: string[] | null, right: string[] | null) =>
    JSON.stringify(left ?? []) === JSON.stringify(right ?? []);

  if ((before.headline ?? "") !== (after.headline ?? "")) {
    changed.push("headline");
  }
  if (
    (before.ministry_description ?? "") !== (after.ministry_description ?? "")
  ) {
    changed.push("ministry description");
  }
  if (!sameList(before.commendations, after.commendations)) {
    changed.push("commendations");
  }
  if (!sameList(before.cautions, after.cautions)) {
    changed.push("cautions");
  }
  if (
    (before.recommendation_level ?? "") !== (after.recommendation_level ?? "")
  ) {
    changed.push("recommendation level");
  }
  if (
    Boolean(before.include_voice_alignment) !==
    Boolean(after.include_voice_alignment)
  ) {
    changed.push("voice alignment inclusion");
  }

  return changed;
}
