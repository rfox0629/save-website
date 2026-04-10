import Link from "next/link";

import { ViewModeSwitcher } from "@/components/app/view-mode-switcher";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { ViewMode } from "@/lib/view-mode-shared";

function PortalNavLink({
  href,
  label,
  active = false,
}: {
  active?: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#1B4D35] text-white"
          : "text-[#4F6357] hover:bg-[#EBE4D5] hover:text-[#1B4D35]"
      }`}
      href={href}
    >
      {label}
    </Link>
  );
}

export function MinistryNav({
  active,
  canPreview = false,
  currentViewMode = "admin",
}: {
  active: "documents" | "inquiry" | "overview" | "vetting";
  canPreview?: boolean;
  currentViewMode?: ViewMode;
}) {
  return (
    <nav className="rounded-[28px] border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 shadow-[0_18px_40px_rgba(27,77,53,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <PortalNavLink
            active={active === "overview"}
            href="/portal"
            label="Overview"
          />
          <PortalNavLink
            active={active === "inquiry"}
            href="/portal/inquiry"
            label="Inquiry"
          />
          <PortalNavLink
            active={active === "vetting"}
            href="/portal/application"
            label="Complete Application"
          />
          <PortalNavLink
            active={active === "documents"}
            href="/portal/documents"
            label="Documents"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ViewModeSwitcher
            canPreview={canPreview}
            currentViewMode={currentViewMode}
          />
          <SignOutButton className="rounded-full border border-[#D8D1C3] px-4 py-2 text-sm font-semibold text-[#4F6357] transition hover:bg-[#EBE4D5] hover:text-[#1B4D35]" />
        </div>
      </div>
    </nav>
  );
}
