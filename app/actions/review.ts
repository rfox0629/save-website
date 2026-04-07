"use server";

import { redirect } from "next/navigation";

import {
  assignReviewer,
  createReviewerNote,
  markDocumentReviewed,
  overrideCategoryScore,
  resolveRiskFlag,
  saveExternalCheck,
  updateApplicationStatus,
} from "@/lib/review";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function updateApplicationStatusAction(formData: FormData) {
  await updateApplicationStatus({
    applicationId: getString(formData, "application_id"),
    status: getString(formData, "status"),
  });
}

export async function quickActionAndRedirect(formData: FormData) {
  const applicationId = getString(formData, "application_id");
  const status = getString(formData, "status");

  await updateApplicationStatus({
    applicationId,
    status,
  });

  redirect(`/applications/${applicationId}`);
}

export async function assignReviewerAction(formData: FormData) {
  const applicationId = getString(formData, "application_id");
  const reviewerId = getString(formData, "reviewer_id");

  await assignReviewer({
    applicationId,
    reviewerId,
  });
}

export async function overrideCategoryScoreAction(formData: FormData) {
  await overrideCategoryScore({
    applicationId: getString(formData, "application_id"),
    category: getString(formData, "category") as Parameters<
      typeof overrideCategoryScore
    >[0]["category"],
    note: getString(formData, "note"),
    score: Number(getString(formData, "score")),
  });
}

export async function resolveRiskFlagAction(formData: FormData) {
  await resolveRiskFlag({
    applicationId: getString(formData, "application_id"),
    flagId: getString(formData, "flag_id"),
    resolutionNotes: getString(formData, "resolution_notes"),
  });
}

export async function markDocumentReviewedAction(formData: FormData) {
  await markDocumentReviewed({
    applicationId: getString(formData, "application_id"),
    documentId: getString(formData, "document_id"),
    reviewed: getString(formData, "reviewed") === "true",
  });
}

export async function saveExternalCheckAction(formData: FormData) {
  await saveExternalCheck({
    applicationId: getString(formData, "application_id"),
    scoreImpact: getString(formData, "score_impact")
      ? Number(getString(formData, "score_impact"))
      : null,
    source: getString(formData, "source"),
    status: getString(formData, "status"),
    summary: getString(formData, "summary"),
  });
}

export async function createReviewerNoteAction(formData: FormData) {
  await createReviewerNote({
    applicationId: getString(formData, "application_id"),
    note: getString(formData, "note"),
    section: getString(formData, "section"),
  });
}
