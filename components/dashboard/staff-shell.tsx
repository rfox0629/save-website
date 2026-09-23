import { Fraunces, Inter } from "next/font/google";
import type { ReactNode } from "react";

import { AppShell, type NavGroup } from "@/components/save/shell";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/**
 * Authenticated SAVE staff shell — the approved design system (AppShell) wired
 * to the real session. One shell, staff persona; nav grows as each Phase B
 * stage lands so there are never dead links.
 */

const saveDisplay = Fraunces({
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-save-display",
});

const saveSans = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-save-sans",
});

export type StaffNavKey = "queue";

function QueueIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <rect x="2" y="3" width="12" height="2.4" rx="1" fill="currentColor" />
      <rect
        x="2"
        y="6.8"
        width="12"
        height="2.4"
        rx="1"
        fill="currentColor"
        opacity="0.7"
      />
      <rect
        x="2"
        y="10.6"
        width="8"
        height="2.4"
        rx="1"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  );
}

function staffNavGroups(active: StaffNavKey): NavGroup[] {
  return [
    {
      label: "Assessments",
      items: [
        {
          active: active === "queue",
          href: "/dashboard",
          icon: <QueueIcon />,
          label: "Queue",
        },
      ],
    },
  ];
}

export async function StaffShell({
  active,
  children,
  topBar,
}: {
  active: StaffNavKey;
  children: ReactNode;
  topBar?: ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: Profile["role"] | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = (profile as Pick<Profile, "role"> | null)?.role ?? null;
  }

  const account = {
    name: user?.email ?? "SAVE Staff",
    role:
      role === "admin"
        ? "SAVE Admin"
        : role === "reviewer"
          ? "Reviewer"
          : "SAVE Staff",
  };

  return (
    <div className={`${saveDisplay.variable} ${saveSans.variable} save-root`}>
      <AppShell
        account={account}
        groups={staffNavGroups(active)}
        homeHref="/dashboard"
        persona="staff"
        topBar={topBar}
      >
        {children}
      </AppShell>
    </div>
  );
}
