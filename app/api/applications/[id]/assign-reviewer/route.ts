import { NextResponse } from "next/server";

import { assignReviewer } from "@/lib/review";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await assignReviewer({
      applicationId: params.id,
      reviewerId: body?.reviewer_id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to assign reviewer.",
      },
      { status: 400 },
    );
  }
}
