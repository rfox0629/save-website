import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Card,
  Input,
  SectionTitle,
  Select,
} from "@/components/save/primitives";
import { MinistryCard } from "@/components/save/patterns";
import { PublicShell } from "@/components/save/shell";
import { MINISTRIES } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Ministry library" };

const FILTERS = [
  { label: "Cause", options: ["All causes", "Church Planting", "Relief & Development", "Theological Education", "Bible Translation", "Urban Ministry"] },
  { label: "Region", options: ["All regions", "North America", "Africa", "Asia", "Latin America", "Europe"] },
  { label: "Assessment", options: ["All assessments", "High Confidence Opportunity", "Strong Opportunity", "Proceed with Discernment"] },
  { label: "Budget", options: ["Any size", "Under $1M", "$1M – $5M", "Over $5M"] },
];

export default function LibraryPage() {
  return (
    <PublicShell
      cta={
        <>
          <Btn href="/preview/donor" size="sm" variant="ghost">
            Sign in
          </Btn>
          <Btn href="/preview/donor" size="sm">
            Request donor access
          </Btn>
        </>
      }
      nav={[
        { active: true, href: "/preview/library", label: "Ministry library" },
        { href: "/preview/library#standard", label: "The standard" },
        { href: "/preview/ministry", label: "For ministries" },
      ]}
    >
      {/* ---------------------------------------------------------- Hero -- */}
      <section className="save-texture border-b border-hairline bg-paper-200">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-20">
          <p className="save-eyebrow text-brass-700">The SAVE Standard</p>
          <h1 className="save-display mt-4 max-w-3xl text-display-lg font-semibold text-ink-900 md:text-display-xl">
            Ministries worth a lifetime relationship.
          </h1>
          <p className="mt-5 max-w-prose text-lg leading-relaxed text-ink-500">
            Every ministry below has been independently assessed against one
            published standard across six categories. We are not a marketplace
            and we take nothing from the ministries we assess.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
            {[
              { label: "Ministries assessed", value: "148" },
              { label: "Categories per assessment", value: "6" },
              { label: "Average assessment length", value: "11 weeks" },
              { label: "Paid placements", value: "0" },
            ].map((item) => (
              <div key={item.label}>
                <p className="save-numeric save-display text-title font-semibold text-ink-900">
                  {item.value}
                </p>
                <p className="save-eyebrow mt-1 text-ink-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Browse -- */}
      <section className="mx-auto max-w-content px-5 py-12 md:px-8">
        <Card className="p-5" tone="flat">
          <div className="grid gap-3 md:grid-cols-[1.6fr_repeat(4,1fr)]">
            <div className="md:col-span-1">
              <Input
                aria-label="Search ministries"
                defaultValue=""
                placeholder="Search by name, cause or country"
              />
            </div>
            {FILTERS.map((filter) => (
              <Select aria-label={filter.label} key={filter.label}>
                {filter.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            ))}
          </div>
        </Card>

        <div className="mt-8">
          <SectionTitle
            action={
              <div className="flex items-center gap-2.5">
                <span className="text-caption text-ink-400">Sort</span>
                <Select aria-label="Sort ministries" className="h-9 w-auto">
                  <option>Recently assessed</option>
                  <option>SAVE score</option>
                  <option>Alphabetical</option>
                </Select>
              </div>
            }
            description="Assessment reflects our review at a point in time. Every ministry is reassessed on a fixed cycle."
          >
            <span className="save-numeric">{MINISTRIES.length}</span> ministries
          </SectionTitle>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MINISTRIES.map((ministry) => (
              <MinistryCard
                action={
                  <div className="flex items-center justify-between">
                    <Btn size="sm" variant="ghost">
                      <svg
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M8 13.5S2 10 2 6.2A3.2 3.2 0 0 1 8 4.6a3.2 3.2 0 0 1 6 1.6C14 10 8 13.5 8 13.5Z"
                          stroke="currentColor"
                          strokeLinejoin="round"
                          strokeWidth="1.3"
                        />
                      </svg>
                      Save
                    </Btn>
                    <Btn
                      href={`/preview/ministry-profile/${ministry.slug}`}
                      size="sm"
                      variant="secondary"
                    >
                      View assessment
                    </Btn>
                  </div>
                }
                href={`/preview/ministry-profile/${ministry.slug}`}
                key={ministry.id}
                ministry={ministry}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Standard -- */}
      <section className="border-y border-hairline bg-surface" id="standard">
        <div className="mx-auto max-w-content px-5 py-16 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div>
              <p className="save-eyebrow text-brass-700">How we assess</p>
              <h2 className="save-display mt-3.5 text-display-md font-semibold text-ink-900">
                Six categories. One standard. No exceptions.
              </h2>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-500">
                Every ministry answers the same questions and supplies the same
                evidence. Reviewers score each category independently and record
                their confidence alongside the score, so you can see not only
                what we concluded but how sure we are.
              </p>
              <Btn className="mt-7" href="/preview/ministry" variant="secondary">
                See what a ministry goes through
              </Btn>
            </div>

            <div className="grid gap-px overflow-hidden rounded-lg bg-hairline sm:grid-cols-2">
              {[
                { body: "What they believe, how publicly they say it, and whether the board affirms it.", title: "Doctrine" },
                { body: "Board independence, meeting discipline, conflict-of-interest practice.", title: "Governance" },
                { body: "Audit history, reserves, compensation approval, designated-fund handling.", title: "Financial Integrity" },
                { body: "Accountability structures around the leader, and succession readiness.", title: "Leadership" },
                { body: "What actually changed, measured over years rather than campaigns.", title: "Fruit" },
                { body: "Eight independent sources checked for anything the application did not disclose.", title: "External Signals" },
              ].map((category) => (
                <div className="bg-surface px-6 py-6" key={category.title}>
                  <h3 className="text-sm font-semibold text-ink-900">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-caption leading-relaxed text-ink-500">
                    {category.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- CTA -- */}
      <section className="mx-auto max-w-content px-5 py-16 md:px-8">
        <Card className="overflow-hidden" tone="flat">
          <div className="grid md:grid-cols-2">
            <div className="border-b border-hairline p-9 md:border-b-0 md:border-r">
              <Badge tone="brass">For donors</Badge>
              <h3 className="save-display mt-4 text-display-sm font-semibold text-ink-900">
                See the full assessment
              </h3>
              <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-ink-500">
                Donor access opens category-level findings, financial detail,
                leadership assessment and direct introductions. Access is
                granted personally, not purchased.
              </p>
              <Btn className="mt-6" href="/preview/donor">
                Request donor access
              </Btn>
            </div>
            <div className="bg-paper-200 p-9">
              <Badge tone="sage">For ministries</Badge>
              <h3 className="save-display mt-4 text-display-sm font-semibold text-ink-900">
                Be known for your fruit
              </h3>
              <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-ink-500">
                Assessment takes about eleven weeks. You keep the findings and
                the roadmap whether or not you are listed, and you never pay for
                placement.
              </p>
              <Btn className="mt-6" href="/preview/ministry" variant="secondary">
                Start an application
              </Btn>
            </div>
          </div>
        </Card>
      </section>
    </PublicShell>
  );
}
