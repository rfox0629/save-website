/**
 * Roadmap vocabularies, shared by server and client.
 *
 * These mirror the `roadmap_items` check constraint exactly, so a form cannot
 * offer a status the database will reject. They live apart from
 * `lib/roadmap.ts` because that module is server-only (service-role client) and
 * the staff forms are client components — the same split as
 * `lib/diligence-shared.ts`.
 */

export const ROADMAP_STATUSES = [
  "open",
  "in_progress",
  "verified",
  "waived",
] as const;

export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];

export const ROADMAP_STATUS_LABELS: Record<RoadmapStatus, string> = {
  in_progress: "In progress",
  open: "Open",
  verified: "Verified by SAVE",
  waived: "Waived",
};

/**
 * Suggested categories, using the same stored keys the scoring engine uses, so
 * a roadmap item can be read against the category it came from. The column is
 * free text and nullable — this is a convenience, not a constraint.
 */
export const ROADMAP_CATEGORIES = [
  { label: "Leadership integrity", value: "leadership" },
  { label: "Doctrine", value: "doctrine" },
  { label: "Governance", value: "governance" },
  { label: "Financial stewardship", value: "financial" },
  { label: "Fruit", value: "fruit" },
  { label: "External signals", value: "external" },
] as const;
