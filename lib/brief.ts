import { redirect } from "next/navigation";

import { requireReviewerPageAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Applications,
  DonorBrief,
  Organizations,
} from "@/lib/supabase/types";

export type BriefEditorData = {
  application: Applications;
  brief: DonorBrief | null;
  org: Organizations;
  publicUrl: string | null;
};

export type PublicBriefData = {
  application: Applications;
  brief: DonorBrief;
  org: Organizations;
};

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

  const { data: organization } = await admin
    .from("organizations")
    .select("*")
    .eq("id", resolvedApplication.organization_id)
    .maybeSingle();
  const resolvedOrganization = organization as Organizations | null;

  if (!resolvedOrganization) {
    return null;
  }

  return {
    application: resolvedApplication,
    brief: resolvedBrief,
    org: resolvedOrganization,
  };
}
