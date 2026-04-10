import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";
import {
  canUsePreviewMode,
  VIEW_MODE_COOKIE,
  type ViewMode,
} from "@/lib/view-mode-shared";

type ViewerContext = {
  canPreview: boolean;
  currentViewMode: ViewMode;
  organizationId: string | null;
  realRole: Profile["role"] | null;
  userEmail: string | null;
  userId: string | null;
};

function normalizeViewMode(value: string | null | undefined): ViewMode {
  if (value === "donor" || value === "ministry") {
    return value;
  }

  return "admin";
}

export async function getViewerContext(): Promise<ViewerContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      canPreview: false,
      currentViewMode: "admin",
      organizationId: null,
      realRole: null,
      userEmail: null,
      userId: null,
    };
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
  const realRole = resolvedProfile?.role ?? null;
  const canPreview = canUsePreviewMode(realRole);
  const storedMode = normalizeViewMode(cookies().get(VIEW_MODE_COOKIE)?.value);

  return {
    canPreview,
    currentViewMode: canPreview
      ? storedMode
      : realRole === "donor"
        ? "donor"
        : realRole === "ministry"
          ? "ministry"
          : "admin",
    organizationId: resolvedProfile?.organization_id ?? null,
    realRole,
    userEmail: user.email ?? null,
    userId: user.id,
  };
}
