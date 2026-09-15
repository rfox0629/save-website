import {
  BookOpen,
  Building2,
  ClipboardCheck,
  Compass,
  FileStack,
  Heart,
  History,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Receipt,
  Route,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";

import type { NavGroup } from "@/components/save/shell";

/* ==========================================================================
   Navigation configuration
   The three portals are one shell with three configs. Changing a portal's IA
   is a data change here, not a layout change in a page.
   ========================================================================== */

export function donorNav(active: string): NavGroup[] {
  return [
    {
      items: [
        {
          active: active === "home",
          href: "/preview/donor",
          icon: <LayoutDashboard />,
          label: "Home",
        },
        {
          active: active === "following",
          href: "/preview/donor/following",
          icon: <Heart />,
          label: "Following",
          badge: 4,
        },
        {
          active: active === "discover",
          href: "/preview/library",
          icon: <Compass />,
          label: "Discover ministries",
        },
      ],
    },
    {
      label: "Giving",
      items: [
        {
          active: active === "giving",
          href: "/preview/donor/giving",
          icon: <Wallet />,
          label: "Giving",
        },
        {
          active: active === "statements",
          href: "/preview/donor/giving#statements",
          icon: <Receipt />,
          label: "Annual statements",
        },
      ],
    },
    {
      label: "Relationship",
      items: [
        {
          active: active === "updates",
          href: "/preview/donor/updates",
          icon: <Megaphone />,
          label: "Updates",
          badge: 3,
        },
        {
          active: active === "prayer",
          href: "/preview/donor/prayer",
          icon: <Sparkles />,
          label: "Prayer",
        },
        {
          active: active === "advisor",
          href: "/preview/donor#advisor",
          icon: <UserCircle />,
          label: "My SAVE advisor",
        },
      ],
    },
  ];
}

export function ministryNav(active: string): NavGroup[] {
  return [
    {
      items: [
        {
          active: active === "home",
          href: "/preview/ministry",
          icon: <LayoutDashboard />,
          label: "Overview",
        },
      ],
    },
    {
      label: "Assessment",
      items: [
        {
          active: active === "assessment",
          href: "/preview/ministry/assessment",
          icon: <ClipboardCheck />,
          label: "The standard",
          badge: "52%",
        },
        {
          active: active === "evidence",
          href: "/preview/ministry/evidence",
          icon: <Upload />,
          label: "Evidence",
          badge: 3,
        },
        {
          active: active === "findings",
          href: "/preview/ministry/findings",
          icon: <ListChecks />,
          label: "Findings",
        },
        {
          active: active === "roadmap",
          href: "/preview/ministry/roadmap",
          icon: <Route />,
          label: "Roadmap",
        },
      ],
    },
    {
      label: "Your public profile",
      items: [
        {
          active: active === "profile",
          href: "/preview/ministry/profile",
          icon: <Building2 />,
          label: "Profile",
        },
        {
          active: active === "testimonies",
          href: "/preview/ministry/testimonies",
          icon: <BookOpen />,
          label: "Testimonies",
        },
        {
          active: active === "updates",
          href: "/preview/ministry/updates",
          icon: <Send />,
          label: "Donor updates",
        },
        {
          active: active === "reports",
          href: "/preview/ministry/reports",
          icon: <FileStack />,
          label: "Reports",
        },
      ],
    },
  ];
}

export function staffNav(active: string): NavGroup[] {
  return [
    {
      items: [
        {
          active: active === "queue",
          href: "/preview/staff",
          icon: <Inbox />,
          label: "Queue",
          badge: 8,
        },
        {
          active: active === "review",
          href: "/preview/staff/review",
          icon: <ClipboardCheck />,
          label: "Review",
        },
        {
          active: active === "publishing",
          href: "/preview/staff/publishing",
          icon: <Send />,
          label: "Publishing",
          badge: 2,
        },
      ],
    },
    {
      label: "Portfolio",
      items: [
        {
          active: active === "ministries",
          href: "/preview/staff/ministries",
          icon: <Building2 />,
          label: "Ministries",
        },
        {
          active: active === "leaders",
          href: "/preview/staff/leaders",
          icon: <ShieldCheck />,
          label: "Leader health",
          badge: 2,
        },
        {
          active: active === "donors",
          href: "/preview/staff/donors",
          icon: <Users />,
          label: "Donors",
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          active: active === "reviewers",
          href: "/preview/staff#reviewers",
          icon: <UserCircle />,
          label: "Reviewers",
        },
        {
          active: active === "audit",
          href: "/preview/staff/audit",
          icon: <History />,
          label: "Audit history",
        },
      ],
    },
  ];
}

export const DONOR_ACCOUNT = {
  name: "Margaret Ellison",
  role: "Donor since 2017",
};
export const MINISTRY_ACCOUNT_CHIP = {
  name: "Priscila Ramos",
  role: "Rio Hope Network",
};
export const STAFF_ACCOUNT = {
  name: "Hannah Bradley",
  role: "Senior Reviewer",
};
