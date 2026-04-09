import { NextResponse } from "next/server";

import { generateVoiceAlignmentSummary } from "@/lib/voice-alignment";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const result = await generateVoiceAlignmentSummary(params.id);

    if (result.state === "insufficient_data") {
      return NextResponse.json({
        counts: {
          external: result.externalCount,
          internal: result.internalCount,
        },
        minimums: {
          external: result.minimumExternal,
          internal: result.minimumInternal,
        },
        ok: false,
        state: "insufficient_data",
      });
    }

    return NextResponse.json({
      ok: true,
      state: "generated",
      summary: result.summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate alignment summary.",
      },
      { status: 400 },
    );
  }
}
