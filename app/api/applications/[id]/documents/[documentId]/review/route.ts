import { NextResponse } from "next/server";

import { markDocumentReviewed } from "@/lib/review";

export async function POST(
  request: Request,
  { params }: { params: { documentId: string; id: string } },
) {
  const body = await request.json().catch(() => null);

  try {
    await markDocumentReviewed({
      applicationId: params.id,
      documentId: params.documentId,
      reviewed: Boolean(body?.reviewed),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update document.",
      },
      { status: 400 },
    );
  }
}
