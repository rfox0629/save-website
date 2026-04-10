import type { Profile } from "@/lib/supabase/types";

export const VIEW_MODE_COOKIE = "save_view_mode";

export type ViewMode = "admin" | "donor" | "ministry";

export function canUsePreviewMode(role: Profile["role"] | null | undefined) {
  return role === "admin" || role === "reviewer";
}

export function getViewModeDestination(mode: ViewMode) {
  switch (mode) {
    case "donor":
      return "/donors";
    case "ministry":
      return "/portal";
    default:
      return "/dashboard";
  }
}
