import { NextResponse } from "next/server";

import { requireReviewerMutationAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Applications,
  DonorBrief,
  Organizations,
} from "@/lib/supabase/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(request: Request) {
  try {
    const { user } = await requireReviewerMutationAccess();
    const body = (await request.json().catch(() => null)) as {
      application_id?: string;
      cautions?: string[];
      commendations?: string[];
      headline?: string;
      include_voice_alignment?: boolean;
      ministry_description?: string;
      published?: boolean;
      recommendation_level?: string;
    } | null;

    if (!body?.application_id) {
      return NextResponse.json(
        { error: "application_id is required." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any;
    const { data: application } = await admin
      .from("applications")
      .select("id, organization_id")
      .eq("id", body.application_id)
      .maybeSingle();
    const resolvedApplication = application as Pick<
      Applications,
      "id" | "organization_id"
    > | null;

    if (!resolvedApplication) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    const { data: organization } = await admin
      .from("organizations")
      .select("legal_name")
      .eq("id", resolvedApplication.organization_id)
      .maybeSingle();
    const resolvedOrganization = organization as Pick<
      Organizations,
      "legal_name"
    > | null;

    const filteredCommendations = (body.commendations ?? []).filter((item) =>
      item.trim(),
    );
    const filteredCautions = (body.cautions ?? []).filter((item) =>
      item.trim(),
    );
    const slugBase = slugify(
      `${resolvedOrganization?.legal_name ?? "save"}-${body.headline ?? "brief"}`,
    );
    const generatedSlug = `${slugBase || "save-brief"}-${body.application_id.slice(0, 6)}`;
    const now = new Date().toISOString();

    const { data: existingBrief } = await admin
      .from("donor_briefs")
      .select("id, slug")
      .eq("application_id", body.application_id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const resolvedExistingBrief = existingBrief as Pick<
      DonorBrief,
      "id" | "slug"
    > | null;

    const payload = {
      application_id: body.application_id,
      cautions: filteredCautions,
      commendations: filteredCommendations,
      generated_at: now,
      generated_by: user.id,
      headline: body.headline ?? null,
      include_voice_alignment: Boolean(body.include_voice_alignment),
      ministry_description: body.ministry_description ?? null,
      pdf_path: null,
      published: Boolean(body.published),
      published_at: body.published ? now : null,
      recommendation_level: body.recommendation_level ?? null,
      slug: resolvedExistingBrief?.slug ?? generatedSlug,
    };

    const query = resolvedExistingBrief?.id
      ? db
          .from("donor_briefs")
          .update(payload)
          .eq("id", resolvedExistingBrief.id)
      : db.from("donor_briefs").insert(payload);

    const { error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const publicSlug = payload.slug ?? resolvedExistingBrief?.slug ?? null;

    return NextResponse.json({
      ok: true,
      published: payload.published,
      public_slug: publicSlug,
      public_url:
        payload.published && publicSlug ? `${baseUrl}/donors/${publicSlug}` : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save brief.",
      },
      { status: 400 },
    );
  }
}
