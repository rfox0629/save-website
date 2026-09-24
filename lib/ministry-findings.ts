import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Applications, ReviewerNote, RoadmapItem } from "@/lib/supabase/types";

/**
 * What a ministry may read of its own assessment.
 *
 * Three things are deliberately absent and must stay absent: internal reviewer
 * notes, relational diligence, and anything from Voice Alignment. A ministry
 * seeing who said what about it would end honest reference-giving, and SAVE's
 * own diligence record is working material rather than a finding.
 *
 * The conditions below are applied again in RLS, so a mistake in this
 * projection cannot by itself widen what a ministry can reach.
 */

export type MinistryFinding = {
  id: string;
  note: string;
  recordedAt: string | null;
  section: string | null;
};

export type MinistryRoadmapItem = {
  category: string | null;
  detail: string | null;
  dueDate: string | null;
  id: string;
  owner: string | null;
  status: string;
  title: string;
};

export type MinistryFindingsView = {
  findings: MinistryFinding[];
  roadmap: MinistryRoadmapItem[];
  shared: boolean;
  sharedAt: string | null;
};

const NOT_SHARED: MinistryFindingsView = {
  findings: [],
  roadmap: [],
  shared: false,
  sharedAt: null,
};

export async function getMinistryFindings(
  application: Applications | null,
  organizationId: string,
): Promise<MinistryFindingsView> {
  // Nothing reaches a ministry until a reviewer shares it, and the application
  // must belong to the organization asking.
  if (
    !application ||
    !application.findings_shared_at ||
    application.organization_id !== organizationId
  ) {
    return NOT_SHARED;
  }

  const admin = createAdminClient();
  const [{ data: notes }, { data: items }] = await Promise.all([
    admin
      .from("reviewer_notes")
      .select("id, note, section, created_at")
      // A note is ministry-facing only when a reviewer deliberately wrote it
      // that way. Everything else is SAVE's working material.
      .eq("application_id", application.id)
      .eq("is_internal", false)
      .order("created_at", { ascending: false }),
    admin
      .from("roadmap_items")
      .select("id, title, detail, owner, due_date, status, category")
      .eq("application_id", application.id)
      .order("due_date", { ascending: true, nullsFirst: false }),
  ]);

  return {
    findings: ((notes ?? []) as Pick<
      ReviewerNote,
      "created_at" | "id" | "note" | "section"
    >[]).map((note) => ({
      id: note.id,
      note: note.note,
      recordedAt: note.created_at,
      section: note.section,
    })),
    roadmap: ((items ?? []) as Pick<
      RoadmapItem,
      "category" | "detail" | "due_date" | "id" | "owner" | "status" | "title"
    >[]).map((item) => ({
      category: item.category,
      detail: item.detail,
      dueDate: item.due_date,
      id: item.id,
      owner: item.owner,
      status: item.status,
      title: item.title,
    })),
    shared: true,
    sharedAt: application.findings_shared_at,
  };
}
