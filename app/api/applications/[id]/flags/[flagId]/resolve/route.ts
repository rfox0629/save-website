import { NextResponse } from "next/server";

import { resolveRiskFlag } from "@/lib/review";

export async function POST(
  request: Request,
  { params }: { params: { flagId: string; id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await resolveRiskFlag({
      applicationId: params.id,
      flagId: params.flagId,
      resolutionNotes: body?.resolution_notes,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to resolve flag.",
      },
      { status: 400 },
    );
  }
}
