import type { Metadata } from "next";
import Link from "next/link";

import {
  Badge,
  Btn,
  Card,
  CardBody,
  CardHeader,
  SectionTitle,
} from "@/components/save/primitives";
import { SaveWordmark } from "@/components/save/shell";

export const metadata: Metadata = { title: "Design preview" };

const SURFACES = [
  {
    description:
      "How a donor discovers ministries. Assessment-forward, never a marketplace.",
    persona: "Public",
    routes: [
      { href: "/preview/library", label: "Ministry library" },
      { href: "/preview/ministry-profile/new-city-fellowship", label: "Ministry profile" },
    ],
    tone: "brass" as const,
  },
  {
    description:
      "A private relationship dashboard. Following, giving, updates, prayer, impact.",
    persona: "Donor Portal",
    routes: [
      { href: "/preview/donor", label: "Home" },
      { href: "/preview/donor/following", label: "Following" },
      { href: "/preview/donor/giving", label: "Giving & annual statements" },
      { href: "/preview/donor/ministry/new-city-fellowship", label: "Ministry detail" },
      { href: "/preview/donor/updates", label: "Updates" },
      { href: "/preview/donor/prayer", label: "Prayer" },
    ],
    tone: "sage" as const,
  },
  {
    description:
      "Applying, being assessed, and maintaining approval — as a journey rather than a form queue.",
    persona: "Ministry Portal",
    routes: [
      { href: "/preview/ministry", label: "Overview" },
      { href: "/preview/ministry/assessment", label: "Assessment workflow" },
      { href: "/preview/ministry/evidence", label: "Evidence" },
      { href: "/preview/ministry/findings", label: "Findings" },
      { href: "/preview/ministry/roadmap", label: "Roadmap & implementation" },
      { href: "/preview/ministry/profile", label: "Profile editing" },
      { href: "/preview/ministry/testimonies", label: "Testimonies" },
      { href: "/preview/ministry/updates", label: "Donor updates" },
      { href: "/preview/ministry/reports", label: "Reports" },
    ],
    tone: "ink" as const,
  },
  {
    description:
      "The operating system for SAVE. Queue, review, publishing, portfolio and audit.",
    persona: "Staff Portal",
    routes: [
      { href: "/preview/staff", label: "Application queue" },
      { href: "/preview/staff/review", label: "Assessment & evidence review" },
      { href: "/preview/staff/publishing", label: "Publishing workflow" },
      { href: "/preview/staff/ministries", label: "Ministry portfolio" },
      { href: "/preview/staff/leaders", label: "Leader health" },
      { href: "/preview/staff/donors", label: "Donor visibility" },
      { href: "/preview/staff/audit", label: "Audit history" },
    ],
    tone: "clay" as const,
  },
];

export default function PreviewIndexPage() {
  return (
    <div className="min-h-screen bg-paper-100">
      <header className="border-b border-hairline bg-paper-200 save-texture">
        <div className="mx-auto max-w-content px-5 py-14 md:px-8">
          <SaveWordmark sublabel="Design preview" />
          <p className="save-eyebrow mt-9 text-brass-700">USA-133</p>
          <h1 className="save-display mt-3.5 max-w-3xl text-display-lg font-semibold text-ink-900">
            The SAVE Standard, redesigned.
          </h1>
          <p className="mt-5 max-w-prose text-lg leading-relaxed text-ink-500">
            SAVE is not an assessment platform. It is how affluent donors find
            ministries they can trust, and how those relationships last. Every
            screen below is built from one design language and one component
            system.
          </p>
          <div className="mt-8 flex flex-wrap gap-2.5">
            <Btn href="/preview/library">Start with the public library</Btn>
            <Btn href="/preview/system" variant="secondary">
              See the design language
            </Btn>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-content px-5 py-12 md:px-8">
        <SectionTitle description="Seventeen high-fidelity screens across four surfaces.">
          Surfaces
        </SectionTitle>

        <div className="grid gap-6 md:grid-cols-2">
          {SURFACES.map((surface) => (
            <Card key={surface.persona}>
              <CardHeader
                action={<Badge tone={surface.tone}>{surface.routes.length}</Badge>}
                description={surface.description}
                title={surface.persona}
              />
              <CardBody flush>
                <ul className="divide-y divide-hairline">
                  {surface.routes.map((route) => (
                    <li key={route.href}>
                      <Link
                        className="flex items-center justify-between gap-4 px-6 py-3.5 text-sm text-ink-700 transition hover:bg-paper-100 hover:text-ink-900"
                        href={route.href}
                      >
                        {route.label}
                        <span className="text-ink-300">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <Card className="p-8" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">
              About this preview
            </p>
            <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-ink-500">
              These routes render from static fixtures in{" "}
              <code className="rounded-sm bg-paper-300 px-1.5 py-0.5 font-mono text-caption">
                lib/preview/data.ts
              </code>
              . Nothing here touches Supabase, auth, tenancy or RLS, so the
              design can be reviewed and iterated without credentials. The data
              shapes mirror the real domain — six assessment categories, four
              SAVE tiers — so wiring these screens to live data is a data-source
              swap, not a rewrite.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
