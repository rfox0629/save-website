import { waitUntil } from "@vercel/functions";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { runFullVetting } from "@/lib/external/orchestrator";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

async function verifyAccess(applicationId: string) {
  const internalToken = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const requestToken = headers().get("x-save-background-token");

  if (internalToken && requestToken === internalToken) {
    return { status: 200 as const };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Authentication required.", status: 401 as const };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .maybeSingle();
  const resolvedProfile = profile as {
    organization_id: string | null;
    role: string;
  } | null;

  if (!resolvedProfile) {
    return { error: "Profile not found.", status: 403 as const };
  }

  if (["admin", "reviewer"].includes(resolvedProfile.role)) {
    return { status: 200 as const };
  }

  if (resolvedProfile.role !== "ministry" || !resolvedProfile.organization_id) {
    return { error: "Unauthorized.", status: 403 as const };
  }

  const { data: application } = await supabase
    .from("applications")
    .select("organization_id")
    .eq("id", applicationId)
    .maybeSingle();
  const organizationId = (application as { organization_id: string } | null)
    ?.organization_id;

  if (!organizationId || organizationId !== resolvedProfile.organization_id) {
    return { error: "Unauthorized.", status: 403 as const };
  }

  return { status: 200 as const };
}

export async function POST(
  _request: Request,
  { params }: { params: { applicationId: string } },
) {
  const access = await verifyAccess(params.applicationId);

  if ("error" in access) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  waitUntil(
    runFullVetting(params.applicationId).catch((error) => {
      console.error("runFullVetting failed", error);
    }),
  );

  return NextResponse.json({
    applicationId: params.applicationId,
    started: true,
  });
}
