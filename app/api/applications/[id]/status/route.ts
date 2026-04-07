import { NextResponse } from "next/server";

import { updateApplicationStatus } from "@/lib/review";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await updateApplicationStatus({
      applicationId: params.id,
      status: body?.status,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update status.",
      },
      { status: 400 },
    );
  }
}
