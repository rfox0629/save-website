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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    role: ((profile as Pick<Profile, "role"> | null)?.role ?? null) as
      | Profile["role"]
      | null,
    user,
  };
}
