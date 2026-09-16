import { NextResponse } from "next/server";

import { isInquiryAction } from "@/lib/inquiry-workflow";
import { recordInquiryDecision } from "@/lib/review";

/**
 * The inquiry stage's three staff actions: approve, request more information,
 * decline. Kept separate from the generic status route so the inquiry decision
 * is never made by picking a value out of a list of every status.
 *
 * Validation lives in `recordInquiryDecision` and the workflow rules it calls,
 * so this route cannot be used to reach a transition the workflow forbids.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json().catch(() => null)) as {
    action?: unknown;
    ministryMessage?: unknown;
    staffNote?: unknown;
  } | null;

  if (!isInquiryAction(body?.action)) {
    return NextResponse.json(
      { error: "Choose approve, request more information, or decline." },
      { status: 400 },
    );
  }

  try {
    await recordInquiryDecision({
      action: body.action,
      applicationId: params.id,
      ministryMessage:
        typeof body?.ministryMessage === "string" ? body.ministryMessage : null,
      staffNote: typeof body?.staffNote === "string" ? body.staffNote : null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to record this inquiry decision.",
      },
      { status: 400 },
    );
  }
}
