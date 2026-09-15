import { NextResponse } from "next/server";

import { generateReviewerSummary } from "@/lib/ai/reviewerSummary";
import { revokeBriefApprovalForMaterialChange } from "@/lib/brief-approval";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const summary = await generateReviewerSummary(params.id);

    // The reviewer summary feeds the donor-facing tier (its risks, strengths
    // and category confidences) and the category line donors read in the
    // library, so regenerating it is a material donor-facing change.
    const revocation = await revokeBriefApprovalForMaterialChange(
      params.id,
      "the AI reviewer summary was regenerated",
    );

    return NextResponse.json({
      ok: true,
      revoked: revocation.revoked,
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate AI summary.",
      },
      { status: 400 },
    );
  }
}
