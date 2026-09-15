import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { getPathForRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export default async function AccessPendingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session — this page is only meaningful for a signed-in account.
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile as Pick<Profile, "role"> | null)?.role ?? null;

  // Access has been granted since they landed here — move them along.
  if (role) {
    redirect(getPathForRole(role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-[28px] border border-[#D8D1C3] bg-[#FFFDF8] p-8 text-center shadow-[0_25px_80px_rgba(26,68,128,0.08)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7088A5]">
          SAVE Standard
        </p>

        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#C09A45]/40 bg-[#FFF8E8]">
          <span className="relative flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C09A45]/30" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#C09A45]" />
          </span>
        </div>

        <h1
          className="mt-6 text-3xl leading-tight text-[#1A4480]"
          style={{ fontFamily: "var(--font-auth-serif)" }}
        >
          Your access is being set up
        </h1>

        <p className="mt-4 text-[15px] leading-7 text-[#4F6357]">
          You&rsquo;re signed in as{" "}
          <span className="font-semibold text-[#1A4480]">{user.email}</span>.
          Your SAVE account is verified, and the team is finishing your access.
          You&rsquo;ll be able to continue as soon as your role is assigned.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/access-pending"
            className="inline-flex items-center justify-center rounded-full bg-[#1A4480] px-5 py-3 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#15386B]"
          >
            Check again
          </Link>
          <SignOutButton className="inline-flex items-center justify-center rounded-full border border-[#D8D1C3] px-5 py-3 text-sm font-semibold text-[#4F6357] transition hover:bg-[#EBE4D5] hover:text-[#1A4480]" />
        </div>

        <p className="mt-6 text-xs leading-5 text-[#7A867D]">
          If this is unexpected, contact your SAVE administrator.
        </p>
      </div>
    </main>
  );
}
