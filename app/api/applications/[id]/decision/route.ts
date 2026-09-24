import { NextResponse } from "next/server";

import { recordSaveDecision } from "@/lib/decision";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await recordSaveDecision({
      applicationId: params.id,
      decision: body?.decision,
      notes: body?.notes,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record the decision.",
      },
      { status: 400 },
    );
  }
}
