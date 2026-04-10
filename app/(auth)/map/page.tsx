import Link from "next/link";

import { CopyRouteButton } from "@/components/map/copy-route-button";
import { Button } from "@/components/ui/button";
import { requireReviewerPageAccess } from "@/lib/review";

type RouteEntry = {
  description: string;
  example?: string;
  label: string;
  notes?: string;
  openHref?: string;
  path: string;
};

type RouteSection = {
  id: string;
  routes: RouteEntry[];
  title: string;
};

const sections: RouteSection[] = [
  {
    id: "public-pages",
    title: "Public Pages",
    routes: [
      {
        path: "/",
        label: "Home",
        description: "Primary public landing page for the SAVE platform.",
        openHref: "/",
      },
      {
        path: "/about",
        label: "About",
        description: "Public overview of the SAVE standard and its purpose.",
        openHref: "/about",
      },
      {
        path: "/for-donors",
        label: "For Donors",
        description: "Public donor-facing marketing and explanation page.",
        openHref: "/for-donors",
      },
      {
        path: "/for-ministries",
        label: "For Ministries",
        description: "Public ministry-facing overview for organizations applying to SAVE.",
        openHref: "/for-ministries",
      },
    ],
  },
  {
    id: "auth",
    title: "Auth",
    routes: [
      {
        path: "/login",
        label: "Sign In",
        description: "Primary authentication page for password and magic-link access.",
        openHref: "/login",
      },
      {
        path: "/register",
        label: "Register",
        description: "Ministry registration flow that provisions the organization and application.",
        openHref: "/register",
      },
      {
        path: "/auth/confirm",
        label: "Magic Link Confirm",
        description: "Auth callback route that exchanges the email code for a session.",
        notes: "Utility callback route. Not normally opened directly.",
      },
    ],
  },
  {
    id: "internal-save-team",
    title: "Internal SAVE Team",
    routes: [
      {
        path: "/dashboard",
        label: "Application Dashboard",
        description: "Reviewer and admin overview for applications, scores, flags, and triage.",
        openHref: "/dashboard",
      },
      {
        path: "/applications/[id]",
        example: "/applications/22222222-2222-4222-8222-222222222222",
        label: "Application Detail",
        description: "Full internal review view for one nonprofit application.",
        openHref: "/applications/22222222-2222-4222-8222-222222222222",
      },
      {
        path: "/applications/[id]/brief",
        example: "/applications/22222222-2222-4222-8222-222222222222/brief",
        label: "Donor Brief Editor",
        description: "Internal donor brief editor, publishing controls, and share settings.",
        openHref: "/applications/22222222-2222-4222-8222-222222222222/brief",
      },
      {
        path: "/applications/[id]/brief/export",
        example: "/applications/22222222-2222-4222-8222-222222222222/brief/export",
        label: "Brief PDF Export View",
        description: "Print-optimized internal export view for saving a donor brief as PDF.",
        openHref: "/applications/22222222-2222-4222-8222-222222222222/brief/export",
      },
      {
        path: "/applications/compare",
        label: "Application Compare",
        description: "Internal side-by-side nonprofit comparison view for reviewers.",
        openHref:
          "/applications/compare?left=22222222-2222-4222-8222-222222222222&right=22222222-2222-4222-8222-222222222222",
      },
      {
        path: "/admin/donor-requests",
        label: "Donor Requests Admin",
        description: "Admin-only queue for donor access requests.",
        openHref: "/admin/donor-requests",
      },
      {
        path: "/map",
        label: "Route Map",
        description: "Hidden internal route map and control-panel style sitemap for the product.",
        openHref: "/map",
      },
    ],
  },
  {
    id: "ministry-portal",
    title: "Ministry Portal",
    routes: [
      {
        path: "/portal",
        label: "Portal Home",
        description: "Ministry landing page after authentication and onboarding.",
        openHref: "/portal",
      },
      {
        path: "/portal/inquiry",
        label: "Inquiry Form",
        description: "Structured inquiry workflow for ministries entering SAVE.",
        openHref: "/portal/inquiry",
      },
      {
        path: "/portal/application",
        label: "Complete Application",
        description:
          "Structured application where ministries provide detailed information on leadership, doctrine, governance, and stewardship.",
        openHref: "/portal/application",
      },
      {
        path: "/portal/documents",
        label: "Document Center",
        description: "Document upload and management surface for ministry submissions.",
        openHref: "/portal/documents",
      },
    ],
  },
  {
    id: "donor-experience",
    title: "Donor Experience",
    routes: [
      {
        path: "/donors",
        label: "Donor Dashboard",
        description: "Authenticated donor-facing landing page for published briefs.",
        openHref: "/donors",
      },
      {
        path: "/donors/[slug]",
        example: "/donors/new-city-fellowship-brief",
        label: "Public Donor Brief",
        description: "Published donor brief experience with SAVE brief, AI summary, and relational discernment.",
        openHref: "/donors/new-city-fellowship-brief",
      },
      {
        path: "/donors/request-access",
        label: "Donor Access Request",
        description: "Public request form for prospective donors seeking platform access.",
        openHref: "/donors/request-access",
      },
      {
        path: "/donors/compare",
        label: "Donor Compare",
        description: "Authenticated donor-side nonprofit comparison view for published briefs.",
        openHref:
          "/donors/compare?left=new-city-fellowship-brief&right=new-city-fellowship-brief",
      },
    ],
  },
  {
    id: "utility-demo",
    title: "Utility / Demo",
    routes: [
      {
        path: "/brief/[slug]",
        example: "/brief/new-city-fellowship-brief",
        label: "Legacy Brief Route",
        description: "Alternate brief route useful for internal checks or older share paths.",
        openHref: "/brief/new-city-fellowship-brief",
      },
      {
        path: "/voice-alignment/[token]",
        label: "Voice Alignment Invite Form",
        description: "Invite-only public feedback form used for internal and external response collection.",
        notes: "Dynamic token required. No stable public example should be exposed here.",
      },
    ],
  },
];

function RouteCard({ route }: { route: RouteEntry }) {
  return (
    <article className="rounded-[28px] border border-[#E5DED0] bg-white p-5 shadow-[0_16px_40px_rgba(27,77,53,0.05)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-[#1B4D35]">{route.label}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5E6C62]">
              {route.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B7A57]">
                Route
              </span>
              <code className="rounded-full border border-[#E3DCCF] bg-[#FBF8F2] px-3 py-1 text-sm text-[#1B4D35]">
                {route.path}
              </code>
              <CopyRouteButton value={route.path} />
            </div>

            {route.example ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B7A57]">
                  Example
                </span>
                <code className="rounded-full border border-[#E3DCCF] bg-[#FBF8F2] px-3 py-1 text-sm text-[#1B4D35]">
                  {route.example}
                </code>
                <CopyRouteButton value={route.example} />
              </div>
            ) : null}

            {route.notes ? (
              <p className="text-sm leading-7 text-[#7A867D]">{route.notes}</p>
            ) : null}
          </div>
        </div>

        {route.openHref ? (
          <Button
            asChild
            className="bg-[#1B4D35] text-white hover:bg-[#236645]"
          >
            <Link href={route.openHref}>Open</Link>
          </Button>
        ) : (
          <span className="rounded-full border border-[#E3DCCF] bg-[#FBF8F2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A867D]">
            Dynamic only
          </span>
        )}
      </div>
    </article>
  );
}

export default async function MapPage() {
  await requireReviewerPageAccess();

  return (
    <main className="min-h-screen bg-[#F7F6F2] px-6 py-10 text-[#1B4D35]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[32px] border border-[#E5DED0] bg-[#FFFDF8] p-8 shadow-[0_24px_60px_rgba(27,77,53,0.06)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#8B7A57]">
            Internal Map
          </p>
          <h1
            className="mt-5 text-4xl text-[#1B4D35] md:text-5xl"
            style={{ fontFamily: "var(--font-auth-serif)" }}
          >
            SAVE route map
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[#5E6C62]">
            A hidden internal control-panel style sitemap for navigating the
            main product surfaces quickly. This page is based on the current
            routes present in the app directory.
          </p>

          <div className="mt-8 rounded-[28px] border border-[#E5DED0] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B7A57]">
              Quick Jump
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  className="rounded-full border border-[#E3DCCF] bg-[#FBF8F2] px-4 py-2 text-sm font-medium text-[#5E6C62] transition hover:border-[#D4C6AE] hover:text-[#1B4D35]"
                  href={`#${section.id}`}
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="space-y-4 rounded-[32px] border border-[#E5DED0] bg-[#FFFDF8] p-6 shadow-[0_16px_40px_rgba(27,77,53,0.05)] md:p-8"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8B7A57]">
                Route Group
              </p>
              <h2
                className="mt-3 text-3xl text-[#1B4D35]"
                style={{ fontFamily: "var(--font-auth-serif)" }}
              >
                {section.title}
              </h2>
            </div>

            <div className="space-y-4">
              {section.routes.map((route) => (
                <RouteCard key={`${section.id}-${route.path}`} route={route} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
