import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { runScoringEngine } from "@/lib/scoring/engine";
import type { Database } from "@/lib/supabase/types";

function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const application_id =
    typeof body?.application_id === "string"
      ? body.application_id
      : typeof body?.applicationId === "string"
        ? body.applicationId
        : null;

  if (!application_id) {
    return NextResponse.json(
      { error: "application_id is required." },
      { status: 400 },
    );
  }

  try {
    const score = await runScoringEngine(application_id);
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

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
          application_id: application_id,
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
      .eq("id", application_id);

    if (applicationError) {
      throw new Error(applicationError.message);
    }

    return NextResponse.json(score);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Scoring engine failed.",
      },
      { status: 500 },
    );
  }
}
