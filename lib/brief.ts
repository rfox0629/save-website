import { redirect } from "next/navigation";

import { requireReviewerPageAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Applications,
  DonorBrief,
  ExternalCheck,
  Organizations,
  Score,
} from "@/lib/supabase/types";

export type BriefEditorData = {
  application: Applications;
  brief: DonorBrief | null;
  isStale: boolean;
  org: Organizations;
  publicUrl: string | null;
};

export type PublicBriefData = {
  application: Applications;
  brief: DonorBrief;
  externalChecks: ExternalCheck[];
  isStale: boolean;
  latestScore: Score | null;
  org: Organizations;
  scoreRecommendation: string;
  scoreSummary: {
    doctrine: number;
    external: number;
    financial: number;
    fruit: number;
    governance: number;
    leadership: number;
    max: number;
    total: number;
  };
};

function isBriefStale(
  applicationUpdatedAt: string | null | undefined,
  briefGeneratedAt: string | null | undefined,
) {
  if (!applicationUpdatedAt || !briefGeneratedAt) {
    return false;
  }

  const applicationUpdatedAtMs = Date.parse(applicationUpdatedAt);
  const briefGeneratedAtMs = Date.parse(briefGeneratedAt);

  if (
    Number.isNaN(applicationUpdatedAtMs) ||
    Number.isNaN(briefGeneratedAtMs)
  ) {
    return false;
  }

  return applicationUpdatedAtMs > briefGeneratedAtMs;
}

export type BriefExportData = PublicBriefData;

function getScoreRecommendation(score: Score | null) {
  if (!score) {
    return "Not scored";
  }

  if (score.is_hard_stop) {
    return "Hard stop";
  }

  if ((score.total_score ?? 0) >= 80) {
    return "Recommend";
  }

  if ((score.total_score ?? 0) >= 65) {
    return "Proceed with caution";
  }

  return "Decline";
}

function buildScoreSummary(score: Score | null) {
  return {
    doctrine: score?.doctrine_score ?? 0,
    external: score?.external_trust_score ?? 0,
    financial: score?.financial_score ?? 0,
    fruit: score?.fruit_score ?? 0,
    governance: score?.governance_score ?? 0,
    leadership: score?.leadership_score ?? 0,
    max: 100,
    total: score?.total_score ?? 0,
  };
}

export async function getBriefEditorData(
  applicationId: string,
): Promise<BriefEditorData> {
  await requireReviewerPageAccess();
  const admin = createAdminClient();
  const { data: application } = await admin
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  const resolvedApplication = application as Applications | null;

  if (!resolvedApplication) {
    redirect("/dashboard");
  }

  const [{ data: organization }, { data: brief }] = await Promise.all([
    admin
      .from("organizations")
      .select("*")
      .eq("id", resolvedApplication.organization_id)
      .maybeSingle(),
    admin
      .from("donor_briefs")
      .select("*")
      .eq("application_id", applicationId)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const resolvedOrganization = organization as Organizations | null;

  if (!resolvedOrganization) {
    redirect("/dashboard");
  }

  const resolvedBrief = brief as DonorBrief | null;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    application: resolvedApplication,
    brief: resolvedBrief,
    isStale: isBriefStale(
      resolvedApplication.updated_at,
      resolvedBrief?.generated_at,
    ),
    org: resolvedOrganization,
    publicUrl:
      resolvedBrief?.published && resolvedBrief.slug
        ? `${baseUrl}/donors/${resolvedBrief.slug}`
        : null,
  };
}

export async function getPublishedBriefBySlug(
  slug: string,
): Promise<PublicBriefData | null> {
  const admin = createAdminClient();
  const { data: brief } = await admin
    .from("donor_briefs")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  const resolvedBrief = brief as DonorBrief | null;

  if (!resolvedBrief) {
    return null;
  }

  const { data: application } = await admin
    .from("applications")
    .select("*")
    .eq("id", resolvedBrief.application_id)
    .maybeSingle();
  const resolvedApplication = application as Applications | null;

  if (!resolvedApplication) {
    return null;
  }

  const [
    { data: organization },
    { data: externalChecks },
    { data: scores },
  ] = await Promise.all([
    admin
      .from("organizations")
      .select("*")
      .eq("id", resolvedApplication.organization_id)
      .maybeSingle(),
    admin
      .from("external_checks")
      .select("*")
      .eq("application_id", resolvedApplication.id)
      .order("checked_at", { ascending: false }),
    admin
      .from("scores")
      .select("*")
      .eq("application_id", resolvedApplication.id)
      .order("calculated_at", { ascending: false }),
  ]);
  const resolvedOrganization = organization as Organizations | null;
  const resolvedExternalChecks = (externalChecks ?? []) as ExternalCheck[];
  const latestScore = ((scores ?? []) as Score[])[0] ?? null;

  if (!resolvedOrganization) {
    return null;
  }

  return {
    application: resolvedApplication,
    brief: resolvedBrief,
    externalChecks: resolvedExternalChecks,
    isStale: isBriefStale(
      resolvedApplication.updated_at,
      resolvedBrief.generated_at,
    ),
    latestScore,
    org: resolvedOrganization,
    scoreRecommendation: getScoreRecommendation(latestScore),
    scoreSummary: buildScoreSummary(latestScore),
  };
}

export async function getBriefExportData(
  applicationId: string,
): Promise<BriefExportData> {
  await requireReviewerPageAccess();

  const admin = createAdminClient();
  const { data: application } = await admin
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();
  const resolvedApplication = application as Applications | null;

  if (!resolvedApplication) {
    redirect("/dashboard");
  }

  const [
    { data: organization },
    { data: brief },
    { data: externalChecks },
    { data: scores },
  ] =
    await Promise.all([
      admin
        .from("organizations")
        .select("*")
        .eq("id", resolvedApplication.organization_id)
        .maybeSingle(),
      admin
        .from("donor_briefs")
        .select("*")
        .eq("application_id", applicationId)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("external_checks")
        .select("*")
        .eq("application_id", applicationId)
        .order("checked_at", { ascending: false }),
      admin
        .from("scores")
        .select("*")
        .eq("application_id", applicationId)
        .order("calculated_at", { ascending: false }),
    ]);

  const resolvedOrganization = organization as Organizations | null;
  const resolvedBrief = brief as DonorBrief | null;
  const resolvedExternalChecks = (externalChecks ?? []) as ExternalCheck[];
  const latestScore = ((scores ?? []) as Score[])[0] ?? null;

  if (!resolvedOrganization || !resolvedBrief) {
    redirect(`/applications/${applicationId}/brief`);
  }

  return {
    application: resolvedApplication,
    brief: resolvedBrief,
    externalChecks: resolvedExternalChecks,
    isStale: isBriefStale(
      resolvedApplication.updated_at,
      resolvedBrief.generated_at,
    ),
    latestScore,
    org: resolvedOrganization,
    scoreRecommendation: getScoreRecommendation(latestScore),
    scoreSummary: buildScoreSummary(latestScore),
  };
}
