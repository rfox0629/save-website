import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireReviewerMutationAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Whether a ministry is listed in the SAVE library.
 *
 * Deliberately separate from publishing a donor brief: completing an
 * assessment is not the same decision as listing the ministry for discovery.
 * Admin only — a reviewer does not decide what SAVE lists.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { profile } = await requireReviewerMutationAccess();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Only a SAVE administrator can change whether a ministry is listed.",
        },
        { status: 403 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      visible?: boolean;
    } | null;

    if (typeof body?.visible !== "boolean") {
      return NextResponse.json(
        { error: "visible must be true or false." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;

    const { error } = await db
      .from("organizations")
      .update({ library_visible: body.visible })
      .eq("id", params.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard");

    return NextResponse.json({ ok: true, visible: body.visible });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to change the library listing.",
      },
      { status: 400 },
    );
  }
}
