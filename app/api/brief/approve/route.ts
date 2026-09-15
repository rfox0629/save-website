import { NextResponse } from "next/server";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;

    const { data: brief } = await admin
      .from("donor_briefs")
      .select("id, generated_by, published")
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

    if (resolvedBrief.generated_by === user.id) {
      return NextResponse.json(
        {
          error:
            "You wrote this brief, so you cannot be its second reviewer. Another reviewer must approve it.",
        },
        { status: 400 },
      );
    }

    const { error } = await db
      .from("donor_briefs")
      .update({
        approved_at: new Date().toISOString(),
        approved_by: user.id,
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
          error instanceof Error
            ? error.message
            : "Unable to record approval.",
      },
      { status: 400 },
    );
  }
}
