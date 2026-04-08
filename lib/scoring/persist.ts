import "server-only";

import { runScoringEngine } from "@/lib/scoring/engine";
import { createAdminClient } from "@/lib/supabase/admin";

export async function scoreApplication(applicationId: string) {
  const score = await runScoringEngine(applicationId);
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: irsCheck } = await db
    .from("external_checks")
    .select("status, summary")
    .eq("application_id", applicationId)
    .eq("source", "irs_teos")
    .maybeSingle();

  if (irsCheck?.status === "fail") {
    score.is_hard_stop = true;
    score.hard_stop_reason =
      irsCheck.summary ??
      "IRS verification indicates revoked 501(c)(3) status.";
  }

  const { data: insertedScore, error: scoreError } = await db
    .from("scores")
    .insert({
      application_id: score.application_id,
      calculated_at: score.calculated_at,
      calculated_by: score.calculated_by,
      doctrine_score: score.doctrine_score,
      external_trust_score: score.external_trust_score,
      financial_score: score.financial_score,
      fruit_score: score.fruit_score,
      governance_score: score.governance_score,
      hard_stop_reason: score.hard_stop_reason,
      is_hard_stop: score.is_hard_stop,
      leadership_score: score.leadership_score,
      total_score: score.total_score,
    })
    .select("id")
    .single();

  if (scoreError || !insertedScore?.id) {
    throw new Error(scoreError?.message ?? "Unable to insert score row.");
  }

  if (score.components.length > 0) {
    const { error: componentsError } = await db
      .from("score_components")
      .insert(
        score.components.map((component) => ({
          ...component,
          score_id: insertedScore.id,
        })),
      );

    if (componentsError) {
      throw new Error(componentsError.message);
    }
  }

  if (score.flags.length > 0) {
    const { error: flagsError } = await db.from("risk_flags").insert(
      score.flags.map((flag) => ({
        ...flag,
        application_id: applicationId,
      })),
    );

    if (flagsError) {
      throw new Error(flagsError.message);
    }
  }

  const { error: applicationError } = await db
    .from("applications")
    .update({
      status: score.is_hard_stop ? "hard_stop" : "under_review",
    })
    .eq("id", applicationId);

  if (applicationError) {
    throw new Error(applicationError.message);
  }

  return score;
}
