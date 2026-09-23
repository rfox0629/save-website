import { NextResponse } from "next/server";

import { buildActorSnapshot, toActorIdentity } from "@/lib/attribution";
import { canApproveBrief } from "@/lib/brief-author";

import { requireReviewerMutationAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DonorBrief } from "@/lib/supabase/types";

/**
 * Second-reviewer approval of a donor brief (founder decision B3).
 *
 * SAVE does not put its name behind a ministry on one person's judgement. A
 * reviewer other than the brief's author records approval here; only then can
 * the brief be published to donors.
 */
export async function POST(request: Request) {
  try {
    const { user } = await requireReviewerMutationAccess();
    const body = (await request.json().catch(() => null)) as {
      application_id?: string;
      approve?: boolean;
    } | null;

    if (!body?.application_id) {
      return NextResponse.json(
        { error: "application_id is required." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const db = admin;

    const { data: brief } = await admin
      .from("donor_briefs")
      .select("id, generated_by, generated_actor_id, published")
      .eq("application_id", body.application_id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const resolvedBrief = brief as Pick<
      DonorBrief,
      "generated_by" | "id" | "published"
    > | null;

    if (!resolvedBrief) {
      return NextResponse.json(
        { error: "No donor brief exists for this application yet." },
        { status: 404 },
      );
    }

    // Withdrawing approval is always allowed; granting it is not.
    if (body.approve === false) {
      const { error } = await db
        .from("donor_briefs")
        .update({ approved_at: null, approved_by: null, published: false })
        .eq("id", resolvedBrief.id);

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({ approved: false, ok: true });
    }

    // Fails closed: an authorless brief has no independent second reviewer to
    // be, and the snapshot keeps the gate standing once the live identity goes.
    const decision = canApproveBrief(
      resolvedBrief as {
        generated_actor_id?: string | null;
        generated_by?: string | null;
      },
      user.id,
    );

    if (!decision.allowed) {
      return NextResponse.json({ error: decision.reason }, { status: 400 });
    }

    const { error } = await db
      .from("donor_briefs")
      .update({
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        ...buildActorSnapshot("approved", toActorIdentity(user)),
      })
      .eq("id", resolvedBrief.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ approved: true, ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to record approval.",
      },
      { status: 400 },
    );
  }
}
