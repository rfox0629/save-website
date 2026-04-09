import { NextResponse } from "next/server";

import { submitVoiceAlignmentResponse } from "@/lib/voice-alignment";

export async function POST(
  request: Request,
  { params }: { params: { token: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await submitVoiceAlignmentResponse(params.token, body ?? {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit feedback response.",
      },
      { status: 400 },
    );
  }
}
