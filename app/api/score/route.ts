import { NextResponse } from "next/server";

import { scoreApplication } from "@/lib/scoring/persist";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const application_id =
    typeof body?.application_id === "string"
      ? body.application_id
      : typeof body?.applicationId === "string"
        ? body.applicationId
        : null;

  if (!application_id) {
    return NextResponse.json(
      { error: "application_id is required." },
      { status: 400 },
    );
  }

  try {
    const score = await scoreApplication(application_id);
    return NextResponse.json(score);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Scoring engine failed.",
      },
      { status: 500 },
    );
  }
}
