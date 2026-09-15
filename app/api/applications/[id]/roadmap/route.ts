import { NextResponse } from "next/server";

import { createRoadmapItem, setFindingsShared } from "@/lib/roadmap";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    // Sharing findings with the ministry is a separate decision that happens to
    // live on the same resource; it is never part of adding an item.
    if (body?.action === "set_findings_shared") {
      await setFindingsShared(params.id, Boolean(body?.shared));

      return NextResponse.json({ ok: true, shared: Boolean(body?.shared) });
    }

    await createRoadmapItem(params.id, body ?? {});

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save the roadmap item.",
      },
      { status: 400 },
    );
  }
}
