import { NextResponse } from "next/server";

import { overrideCategoryScore } from "@/lib/review";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await overrideCategoryScore({
      applicationId: params.id,
      category: body?.category,
      note: body?.note,
      score: Number(body?.score),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to override score.",
      },
      { status: 400 },
    );
  }
}
