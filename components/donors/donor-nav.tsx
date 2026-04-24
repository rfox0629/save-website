import Link from "next/link";

import { ViewModeSwitcher } from "@/components/app/view-mode-switcher";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { ViewMode } from "@/lib/view-mode-shared";

export function DonorNav({
  canPreview,
  currentViewMode,
  email,
}: {
  canPreview: boolean;
  currentViewMode: ViewMode;
  email: string | null;
}) {
  return (
    <nav className="rounded-[28px] border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 shadow-[0_18px_40px_rgba(26,68,128,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="rounded-full bg-[#1A4480] px-4 py-2 text-sm font-semibold text-white"
          href="/donors"
        >
          Verified Ministries
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <ViewModeSwitcher
            canPreview={canPreview}
            currentViewMode={currentViewMode}
          />
          <span className="rounded-full bg-[#F4EFE4] px-4 py-2 text-sm text-[#4F6357]">
            {email ?? "Signed in donor"}
          </span>
          <SignOutButton className="rounded-full border border-[#D8D1C3] px-4 py-2 text-sm font-semibold text-[#4F6357] transition hover:bg-[#EBE4D5] hover:text-[#1A4480]" />
        </div>
      </div>
    </nav>
  );
}
