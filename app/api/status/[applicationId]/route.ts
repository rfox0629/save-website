import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { applicationId: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
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
    return NextResponse.json({ error: "Profile not found." }, { status: 403 });
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id, organization_id, status, updated_at")
    .eq("id", params.applicationId)
    .maybeSingle();
  const resolvedApplication = application as {
    id: string;
    organization_id: string;
    status: string;
    updated_at: string;
  } | null;

  if (!resolvedApplication) {
    return NextResponse.json(
      { error: "Application not found." },
      { status: 404 },
    );
  }

  const hasAccess =
    ["admin", "reviewer"].includes(resolvedProfile.role) ||
    (resolvedProfile.role === "ministry" &&
      resolvedProfile.organization_id === resolvedApplication.organization_id);

  if (!hasAccess) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  return NextResponse.json({
    applicationId: resolvedApplication.id,
    status: resolvedApplication.status,
    updatedAt: resolvedApplication.updated_at,
  });
}
