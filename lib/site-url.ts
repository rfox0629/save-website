import "server-only";

import { headers } from "next/headers";

/**
 * The origin to use when building a link that will be sent or shown to someone
 * outside this request — a donor share link, a reference invitation.
 *
 * Derived from the live request first, because `NEXT_PUBLIC_SITE_URL` is not
 * set on Vercel: relying on it meant links silently fell back to
 * `http://localhost:3000` in production. Falls back to the configured site URL,
 * then the production origin. Never localhost.
 */
export function getRequestBaseUrl() {
  try {
    const headerList = headers();
    const origin = headerList.get("origin");
    if (origin) {
      return origin;
    }
    const protocol = headerList.get("x-forwarded-proto") ?? "https";
    const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {
    // Not inside a request scope; fall through to the configured origin.
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.savestandard.org";
}
