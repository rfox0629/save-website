import { NextResponse } from "next/server";

import { updateRoadmapItem } from "@/lib/roadmap";

export async function POST(
  request: Request,
  { params }: { params: { id: string; itemId: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await updateRoadmapItem(params.id, params.itemId, body ?? {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update the roadmap item.",
      },
      { status: 400 },
    );
  }
}
