import { NextResponse } from "next/server";

import { saveExternalCheck } from "@/lib/review";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await saveExternalCheck({
      applicationId: params.id,
      scoreImpact:
        body?.score_impact === undefined || body?.score_impact === null
          ? null
          : Number(body.score_impact),
      source: body?.source,
      status: body?.status,
      summary: body?.summary,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save external check.",
      },
      { status: 400 },
    );
  }
}
