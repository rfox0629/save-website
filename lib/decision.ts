import "server-only";

import { revalidatePath } from "next/cache";

import { buildActorSnapshot, toActorIdentity } from "@/lib/attribution";
import { canRecordDecision } from "@/lib/brief-review";
import { assertSaveDecision } from "@/lib/decision-shared";
import { requireReviewerMutationAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";

export * from "@/lib/decision-shared";
import type { DonorBrief } from "@/lib/supabase/types";

/**
 * SAVE's formal assessment decision.
 *
 * This is the judgement SAVE puts its name to, and it is deliberately its own
 * action. It is not the score, which measures only what a rubric can measure;
 * it is not the first reviewer's proposed recommendation on the brief; and it
 * is not `applications.status`, which tracks where the work has got to.
 *
 * `decision_notes` reaches the ministry — the portal shows it as the
 * explanation when an application is declined — so it is written for the
 * ministry to read. Internal reasoning belongs in a reviewer note, not here.
 */

export async function recordSaveDecision(params: {
  applicationId: string;
  decision: unknown;
  notes: unknown;
}) {
  const { profile, user } = await requireReviewerMutationAccess();

  // A decision is SAVE's own judgement, so only an administrator records it.
  if (profile?.role !== "admin") {
    throw new Error(
      "Only a SAVE administrator can record a formal assessment decision.",
    );
  }

  const decision = assertSaveDecision(params.decision);
  const notes = typeof params.notes === "string" ? params.notes.trim() : "";

  if (notes.length === 0) {
    throw new Error(
      "A decision needs notes the ministry can read explaining it.",
    );
  }

  const admin = createAdminClient();
  const db = admin;

  const { data } = await admin
    .from("donor_briefs")
    .select("approved_at, review_outcome")
    .eq("application_id", params.applicationId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const gate = canRecordDecision(
    data as Pick<DonorBrief, "approved_at" | "review_outcome"> | null,
  );

  if (!gate.allowed) {
    throw new Error(gate.reason ?? "This application is not ready for a decision.");
  }

  const { error } = await db
    .from("applications")
    .update({
      decision,
      decision_date: new Date().toISOString(),
      decision_made_by: user.id,
      decision_notes: notes,
      // The status follows the decision rather than standing in for it.
      status: decision,
      ...buildActorSnapshot("decision", toActorIdentity(user, profile)),
    })
    .eq("id", params.applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/applications/${params.applicationId}`);
  revalidatePath(`/applications/${params.applicationId}/brief`);
}
