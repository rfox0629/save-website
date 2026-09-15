import { NextResponse } from "next/server";

import {
  createDiligenceEngagement,
  setRelationalDiligenceException,
} from "@/lib/diligence";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    // The exception is a separate, admin-only action that happens to live on
    // the same resource; it is never part of recording an engagement.
    if (body?.action === "set_exception") {
      await setRelationalDiligenceException(
        params.id,
        typeof body?.reason === "string" ? body.reason : null,
      );

      return NextResponse.json({ ok: true });
    }

    await createDiligenceEngagement(params.id, body ?? { kind: undefined });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record the engagement.",
      },
      { status: 400 },
    );
  }
}
