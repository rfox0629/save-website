import { type NextRequest, NextResponse } from "next/server";

import { getPathForRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  let next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("message", "invalid-link");
      if (next) {
        loginUrl.searchParams.set("redirectTo", next);
      }

      return NextResponse.redirect(loginUrl);
    }

    if (!next || next === "/auth/confirm") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        next = getPathForRole((profile as Pick<Profile, "role"> | null)?.role);
      }
    }
  }

  return NextResponse.redirect(new URL(next ?? "/portal", request.url));
}
