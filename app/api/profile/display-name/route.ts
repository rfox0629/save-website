import { NextResponse } from "next/server";

import { setOwnDisplayName } from "@/lib/staff-profile";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  try {
    await setOwnDisplayName(body?.displayName);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save your display name.",
      },
      { status: 400 },
    );
  }
}
