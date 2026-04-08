import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";

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
}: {
  active: "documents" | "inquiry" | "overview" | "vetting";
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
            href="/portal/vetting"
            label="Vetting"
          />
          <PortalNavLink
            active={active === "documents"}
            href="/portal/documents"
            label="Documents"
          />
        </div>

        <SignOutButton className="rounded-full border border-[#D8D1C3] px-4 py-2 text-sm font-semibold text-[#4F6357] transition hover:bg-[#EBE4D5] hover:text-[#1B4D35]" />
      </div>
    </nav>
  );
}
