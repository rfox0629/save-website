import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { getViewerContext } from "@/lib/view-mode";
import type {
  Applications,
  Document,
  DonorBrief,
  Organizations,
  Profile,
} from "@/lib/supabase/types";

export type MinistryPortalContext = {
  application: Applications | null;
  canPreview: boolean;
  currentViewMode: "admin" | "donor" | "ministry";
  documents: Array<
    Document & {
      signedUrl: string | null;
      statusLabel: string;
    }
  >;
  organization: Organizations;
  publishedBrief: DonorBrief | null;
  realRole: Profile["role"] | null;
  userId: string;
};

export const PREVIEW_ORGANIZATION_ID = "11111111-1111-4111-8111-111111111111";
export const PREVIEW_APPLICATION_ID = "22222222-2222-4222-8222-222222222222";

export async function requireMinistryContext(): Promise<MinistryPortalContext> {
  const viewer = await getViewerContext();

  if (!viewer.userId) {
    redirect("/login");
  }

  const isPreviewMinistry =
    viewer.canPreview && viewer.currentViewMode === "ministry";

  if (
    !isPreviewMinistry &&
    (!viewer.realRole ||
      viewer.realRole !== "ministry" ||
      !viewer.organizationId)
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
      .eq(
        "id",
        isPreviewMinistry ? PREVIEW_ORGANIZATION_ID : viewer.organizationId!,
      )
      .maybeSingle(),
    isPreviewMinistry
      ? admin
          .from("applications")
          .select("*")
          .eq("id", PREVIEW_APPLICATION_ID)
          .maybeSingle()
      : admin
          .from("applications")
          .select("*")
          .eq("organization_id", viewer.organizationId!)
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
      canPreview: viewer.canPreview,
      currentViewMode: viewer.currentViewMode,
      documents: [],
      organization: resolvedOrganization,
      publishedBrief: null,
      realRole: viewer.realRole,
      userId: viewer.userId,
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
    canPreview: viewer.canPreview,
    currentViewMode: viewer.currentViewMode,
    documents: signedDocuments,
    organization: resolvedOrganization,
    publishedBrief: briefForApplication,
    realRole: viewer.realRole,
    userId: viewer.userId,
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
