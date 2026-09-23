import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export function getPathForRole(role: Profile["role"] | null | undefined) {
  if (role === "donor") {
    return "/donors";
  }

  if (role === "admin" || role === "reviewer") {
    return "/dashboard";
  }

  if (role === "ministry") {
    return "/portal";
  }

  // Authenticated but no profile/role yet (e.g. provisioned out of band).
  // Send them to a holding page instead of a role area that would bounce
  // them back to /login.
  return "/access-pending";
}

export async function getCurrentUserRole() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      role: null,
      user: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, deactivated_at")
    .eq("id", user.id)
    .maybeSingle();

  const resolved = profile as
    | (Pick<Profile, "role"> & { deactivated_at?: string | null })
    | null;

  // A deactivated staff profile keeps its history and loses its capability.
  // Resolving no role here also withdraws preview access, which is derived
  // from the role rather than checked separately.
  if (resolved?.deactivated_at) {
    return { role: null, user };
  }

  return {
    role: (resolved?.role ?? null) as Profile["role"] | null,
    user,
  };
}
