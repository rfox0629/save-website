import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  Applications,
  Document,
  DonorBrief,
  Organizations,
  Profile,
} from "@/lib/supabase/types";

export type MinistryPortalContext = {
  application: Applications | null;
  documents: Array<
    Document & {
      signedUrl: string | null;
      statusLabel: string;
    }
  >;
  organization: Organizations;
  publishedBrief: DonorBrief | null;
  userId: string;
};

export async function requireMinistryContext(): Promise<MinistryPortalContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .maybeSingle();
  const resolvedProfile = profile as Pick<
    Profile,
    "organization_id" | "role"
  > | null;

  if (
    !resolvedProfile ||
    resolvedProfile.role !== "ministry" ||
    !resolvedProfile.organization_id
  ) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  const [
    { data: organization },
    { data: application },
    { data: publishedBrief },
  ] = await Promise.all([
    admin
      .from("organizations")
      .select("*")
      .eq("id", resolvedProfile.organization_id)
      .maybeSingle(),
    admin
      .from("applications")
      .select("*")
      .eq("organization_id", resolvedProfile.organization_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("donor_briefs")
      .select("*")
      .eq("published", true)
      .order("generated_at", { ascending: false }),
  ]);

  const resolvedOrganization = organization as Organizations | null;

  if (!resolvedOrganization) {
    redirect("/dashboard");
  }

  const resolvedApplication = application as Applications | null;
  const resolvedPublishedBriefs = (publishedBrief ?? []) as DonorBrief[];
  const briefForApplication = resolvedApplication
    ? (resolvedPublishedBriefs.find(
        (brief) => brief.application_id === resolvedApplication.id,
      ) ?? null)
    : null;

  if (!resolvedApplication) {
    return {
      application: null,
      documents: [],
      organization: resolvedOrganization,
      publishedBrief: null,
      userId: user.id,
    };
  }

  const { data: documents } = await admin
    .from("documents")
    .select("*")
    .eq("application_id", resolvedApplication.id)
    .order("uploaded_at", { ascending: false });
  const resolvedDocuments = (documents ?? []) as Document[];

  const signedDocuments = await Promise.all(
    resolvedDocuments.map(async (document) => {
      const { data } = await admin.storage
        .from("ministry-documents")
        .createSignedUrl(document.storage_path, 60 * 30);

      return {
        ...document,
        signedUrl: data?.signedUrl ?? null,
        statusLabel: document.reviewed ? "Reviewed" : "Pending Review",
      };
    }),
  );

  return {
    application: resolvedApplication,
    documents: signedDocuments,
    organization: resolvedOrganization,
    publishedBrief: briefForApplication,
    userId: user.id,
  };
}

export function getPortalTimelineStatus(status: string | null) {
  const normalized = status ?? "inquiry_submitted";

  if (normalized === "inquiry_submitted") {
    return 1;
  }

  if (normalized === "inquiry_reviewed" || normalized === "inquiry_rejected") {
    return 2;
  }

  if (normalized === "inquiry_approved") {
    return 3;
  }

  if (normalized === "vetting_submitted") {
    return 4;
  }

  if (normalized === "under_review") {
    return 5;
  }

  if (
    normalized === "approved" ||
    normalized === "declined" ||
    normalized === "hard_stop" ||
    normalized === "decided"
  ) {
    return 6;
  }

  return 1;
}
