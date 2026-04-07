import { NextResponse } from "next/server";

import { createReviewerNote } from "@/lib/review";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await createReviewerNote({
      applicationId: params.id,
      note: body?.note,
      section: body?.section,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save note.",
      },
      { status: 400 },
    );
  }
}
