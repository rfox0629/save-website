import { NextResponse } from "next/server";

import { generateReviewerSummary } from "@/lib/ai/reviewerSummary";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const summary = await generateReviewerSummary(params.id);

    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate AI summary.",
      },
      { status: 400 },
    );
  }
}
