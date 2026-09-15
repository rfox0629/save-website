import { NextResponse } from "next/server";

import { updateDiligenceEngagement } from "@/lib/diligence";

export async function POST(
  request: Request,
  { params }: { params: { engagementId: string; id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await updateDiligenceEngagement(
      params.id,
      params.engagementId,
      body ?? { kind: undefined },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the engagement.",
      },
      { status: 400 },
    );
  }
}
