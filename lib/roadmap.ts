import { buildActorSnapshot, toActorIdentity } from "@/lib/attribution";
import "server-only";

import { revalidatePath } from "next/cache";

import { requireReviewerMutationAccess } from "@/lib/review";
import { ROADMAP_STATUSES, type RoadmapStatus } from "@/lib/roadmap-shared";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Applications, RoadmapItem } from "@/lib/supabase/types";

export * from "@/lib/roadmap-shared";

/**
 * The roadmap — what SAVE asks a ministry to close, with an owner and a date.
 *
 * `roadmap_items` is admin/reviewer only at the database level, so a ministry
 * never reads this table directly. Anything a ministry sees comes through a
 * deliberate server-side projection, and only once findings have been shared.
 */

function optionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function assertStatus(value: unknown): RoadmapStatus {
  if (
    typeof value !== "string" ||
    !ROADMAP_STATUSES.includes(value as RoadmapStatus)
  ) {
    throw new Error(`Status must be one of: ${ROADMAP_STATUSES.join(", ")}.`);
  }

  return value as RoadmapStatus;
}

export async function getRoadmapItems(applicationId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("roadmap_items")
    .select("*")
    .eq("application_id", applicationId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  return (data ?? []) as RoadmapItem[];
}

export type RoadmapProgress = {
  open: number;
  total: number;
  /** Percentage verified, for a progress meter. 0 when there is nothing yet. */
  verifiedPct: number;
  verified: number;
};

export function getRoadmapProgress(items: RoadmapItem[]): RoadmapProgress {
  const verified = items.filter((item) => item.status === "verified").length;
  // A waived item is closed by SAVE's decision, so it is not still "open".
  const open = items.filter(
    (item) => item.status === "open" || item.status === "in_progress",
  ).length;

  return {
    open,
    total: items.length,
    verified,
    verifiedPct:
      items.length === 0 ? 0 : Math.round((verified / items.length) * 100),
  };
}

export async function createRoadmapItem(
  applicationId: string,
  input: {
    category?: unknown;
    detail?: unknown;
    dueDate?: unknown;
    owner?: unknown;
    status?: unknown;
    title?: unknown;
  },
) {
  const { user } = await requireReviewerMutationAccess();
  const title = optionalText(input.title);

  if (!title) {
    throw new Error("A roadmap item needs a title.");
  }

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

  const { error } = await db.from("roadmap_items").insert({
    application_id: applicationId,
    category: optionalText(input.category),
    created_by: user.id,
    ...buildActorSnapshot("created", toActorIdentity(user)),
    detail: optionalText(input.detail),
    due_date: optionalText(input.dueDate),
    organization_id: organizationId,
    owner: optionalText(input.owner),
    status: input.status ? assertStatus(input.status) : "open",
    title,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/applications/${applicationId}`);
}

export async function updateRoadmapItem(
  applicationId: string,
  itemId: string,
  input: {
    category?: unknown;
    detail?: unknown;
    dueDate?: unknown;
    owner?: unknown;
    status?: unknown;
    title?: unknown;
  },
) {
  await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  // Only the fields actually supplied are changed, so a status control does
  // not blank out the rest of the item.
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.status !== undefined) {
    patch.status = assertStatus(input.status);
  }
  if (input.title !== undefined) {
    const title = optionalText(input.title);
    if (!title) {
      throw new Error("A roadmap item needs a title.");
    }
    patch.title = title;
  }
  if (input.detail !== undefined) {
    patch.detail = optionalText(input.detail);
  }
  if (input.owner !== undefined) {
    patch.owner = optionalText(input.owner);
  }
  if (input.dueDate !== undefined) {
    patch.due_date = optionalText(input.dueDate);
  }
  if (input.category !== undefined) {
    patch.category = optionalText(input.category);
  }

  const { error } = await db
    .from("roadmap_items")
    .update(patch)
    .eq("id", itemId)
    .eq("application_id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/applications/${applicationId}`);
}

/**
 * Share findings with the ministry, or withdraw them.
 *
 * The database default is NULL — not shared — so nothing reaches a ministry
 * until a reviewer deliberately does this.
 */
export async function setFindingsShared(
  applicationId: string,
  shared: boolean,
) {
  await requireReviewerMutationAccess();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  const { error } = await db
    .from("applications")
    .update({ findings_shared_at: shared ? new Date().toISOString() : null })
    .eq("id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/portal");
}
