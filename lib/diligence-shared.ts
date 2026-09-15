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
