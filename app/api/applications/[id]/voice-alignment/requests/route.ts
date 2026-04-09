import { NextResponse } from "next/server";

import { createVoiceAlignmentRequest } from "@/lib/voice-alignment";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    const result = await createVoiceAlignmentRequest(params.id, {
      relationship: body?.relationship,
      requestType: body?.requestType,
      respondentEmail: body?.respondentEmail,
      respondentName: body?.respondentName,
    });

    return NextResponse.json({
      inviteUrl: result.inviteUrl,
      ok: true,
      request: result.request,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create feedback request.",
      },
      { status: 400 },
    );
  }
}
