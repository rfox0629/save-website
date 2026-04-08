import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/types";

const PROTECTED_PATHS = [
  "/dashboard",
  "/applications",
  "/admin",
  "/portal",
  "/donors",
];

function isProtectedPath(pathname: string) {
  if (pathname === "/donors") {
    return true;
  }

  if (pathname.startsWith("/donors/")) {
    return false;
  }

  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          response.cookies.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    if (request.nextUrl.pathname.startsWith("/portal")) {
      redirectUrl.searchParams.set("intent", "ministry");
    }

    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
