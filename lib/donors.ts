import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPathForRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { DonorBrief, Organizations, Profile } from "@/lib/supabase/types";

export type PublishedBriefCard = DonorBrief & {
  organization: Organizations;
};

export async function requireDonorBriefs() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const resolvedProfile = profile as Pick<Profile, "role"> | null;

  if (!resolvedProfile) {
    redirect("/login");
  }

  if (resolvedProfile.role !== "donor") {
    redirect(getPathForRole(resolvedProfile.role));
  }

  const admin = createAdminClient();
  const { data: briefs } = await admin
    .from("donor_briefs")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const resolvedBriefs = ((briefs ?? []) as DonorBrief[]).filter((brief) =>
    Boolean(brief.slug),
  );
  const organizationIds = Array.from(
    new Set(resolvedBriefs.map((brief) => brief.application_id)),
  );

  if (organizationIds.length === 0) {
    return {
      briefs: [] as PublishedBriefCard[],
      userEmail: user.email ?? null,
    };
  }

  const { data: applications } = await admin
    .from("applications")
    .select("id, organization_id")
    .in("id", organizationIds);
  const resolvedApplications = (applications ?? []) as Array<{
    id: string;
    organization_id: string;
  }>;

  const applicationMap = new Map(
    resolvedApplications.map((application) => [
      application.id,
      application.organization_id,
    ]),
  );
  const orgIds = Array.from(
    new Set(
      resolvedBriefs
        .map((brief) => applicationMap.get(brief.application_id))
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const { data: organizations } = await admin
    .from("organizations")
    .select("*")
    .in("id", orgIds);

  const organizationMap = new Map(
    ((organizations ?? []) as Organizations[]).map((organization) => [
      organization.id,
      organization,
    ]),
  );

  return {
    briefs: resolvedBriefs
      .map((brief) => {
        const organizationId = applicationMap.get(brief.application_id);
        const organization = organizationId
          ? organizationMap.get(organizationId)
          : undefined;

        if (!organization) {
          return null;
        }

        return {
          ...brief,
          organization,
        };
      })
      .filter((brief): brief is PublishedBriefCard => brief !== null),
    userEmail: user.email ?? null,
  };
}
