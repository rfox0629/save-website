import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Card,
  CardBody,
  CardHeader,
  DataList,
  DataRow,
  Divider,
  Monogram,
  ScoreDial,
  SectionTitle,
  TrustSeal,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import {
  AssessmentProvenance,
  CategoryBreakdown,
  ImpactGrid,
  TestimonyCard,
  TierExplainer,
  UpdateItem,
} from "@/components/save/patterns";
import { PublicShell } from "@/components/save/shell";
import { MINISTRIES, getMinistry } from "@/lib/preview/data";

export function generateStaticParams() {
  return MINISTRIES.map((ministry) => ({ slug: ministry.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const ministry = getMinistry(params.slug);
  return { description: ministry.summary, title: ministry.name };
}

export default function MinistryProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const ministry = getMinistry(params.slug);

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
      {/* --------------------------------------------------------- Header -- */}
      <section className="border-b border-hairline bg-paper-200">
        <div className="mx-auto max-w-content px-5 py-12 md:px-8">
          <Btn href="/preview/library" size="sm" variant="quiet">
            ← All ministries
          </Btn>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <div className="flex items-center gap-4">
                <Monogram name={ministry.name} size="xl" />
                <div className="min-w-0">
                  <p className="save-eyebrow text-brass-600">
                    {ministry.category}
                  </p>
                  <h1 className="save-display mt-2 text-display-md font-semibold text-ink-900">
                    {ministry.name}
                  </h1>
                </div>
              </div>

              <p className="save-display mt-6 text-title text-ink-700">
                {ministry.tagline}
              </p>
              <p className="mt-3.5 text-base leading-relaxed text-ink-500">
                {ministry.story}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <TrustSeal
                  size="lg"
                  tier={ministry.tier}
                  year={new Date(ministry.assessedOn).getFullYear()}
                />
                <Badge tone="neutral">{ministry.location}</Badge>
                <Badge tone="neutral">Founded {ministry.founded}</Badge>
              </div>
            </div>

            <Card className="w-full shrink-0 p-6 lg:w-[340px]">
              <div className="flex items-center gap-5">
                <ScoreDial label="SAVE score" score={ministry.score} />
                <div className="min-w-0">
                  <p className="text-caption font-semibold text-ink-900">
                    Assessed across six categories
                  </p>
                  <p className="mt-1.5 text-caption leading-relaxed text-ink-500">
                    Scored independently, with reviewer confidence recorded
                    alongside every category.
                  </p>
                </div>
              </div>

              <Divider className="my-5" />

              <DataList>
                <DataRow label="Annual budget" value={formatMoney(ministry.budget)} />
                <DataRow label="Staff" value={ministry.staff} />
                <DataRow label="Assessed" value={formatDate(ministry.assessedOn)} />
                <DataRow label="EIN" value={ministry.ein} />
              </DataList>

              <Btn className="mt-5 w-full" href="/preview/donor">
                Request an introduction
              </Btn>
              <p className="mt-3 text-center text-caption text-ink-400">
                Introductions are made by a SAVE advisor, never automated.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Body -- */}
      <div className="mx-auto max-w-content px-5 py-12 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-10">
            {/* Impact */}
            <section>
              <SectionTitle description="Reported by the ministry, verified against evidence during assessment.">
                What has actually happened
              </SectionTitle>
              <ImpactGrid metrics={ministry.impact} />
            </section>

            {/* Assessment */}
            <section>
              <SectionTitle description="Each category is scored on its own evidence. Dots indicate how confident the reviewer was.">
                The assessment
              </SectionTitle>
              <Card>
                <CardBody>
                  <TierExplainer tier={ministry.tier} />
                  <Divider className="my-5" />
                  <CategoryBreakdown scores={ministry.categoryScores} />
                </CardBody>
              </Card>
            </section>

            {/* Leadership */}
            <section>
              <SectionTitle>Leadership</SectionTitle>
              <Card>
                <CardBody>
                  <div className="flex flex-wrap items-start gap-5">
                    <Monogram name={ministry.leader.name} size="lg" tone="sage" />
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold text-ink-900">
                        {ministry.leader.name}
                      </p>
                      <p className="mt-0.5 text-caption text-ink-400">
                        {ministry.leader.title} · {ministry.leader.tenure}
                      </p>
                      <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-600">
                        {ministry.leader.bio}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </section>

            {/* Testimonies */}
            <section>
              <SectionTitle description="Collected by the ministry and reviewed by SAVE for accuracy of attribution.">
                In their own words
              </SectionTitle>
              <div className="grid gap-5 md:grid-cols-2">
                {ministry.testimonies.map((testimony) => (
                  <TestimonyCard key={testimony.id} testimony={testimony} />
                ))}
              </div>
            </section>

            {/* Updates */}
            <section>
              <SectionTitle
                action={
                  <Btn href="/preview/donor" size="sm" variant="secondary">
                    Follow for updates
                  </Btn>
                }
                description="Followers receive these directly. Donor access opens the full history."
              >
                Recent updates
              </SectionTitle>
              <Card>
                <div className="[&>article:last-child_.bg-hairline]:hidden">
                  {ministry.updates.map((update) => (
                    <UpdateItem key={update.id} update={update} />
                  ))}
                </div>
              </Card>
            </section>
          </div>

          {/* ------------------------------------------------------ Rail -- */}
          <aside className="space-y-5">
            <AssessmentProvenance
              assessedOn={ministry.assessedOn}
              reassessmentDue={ministry.reassessmentDue}
            />

            <Card>
              <CardHeader title="Prayer" />
              <div className="divide-y divide-hairline">
                {ministry.prayer.map((request) => (
                  <div className="px-6 py-4" key={request.id}>
                    {request.urgent ? (
                      <Badge className="mb-2" tone="clay">
                        Urgent
                      </Badge>
                    ) : null}
                    <p className="text-sm leading-relaxed text-ink-600">
                      {request.body}
                    </p>
                    <p className="save-numeric mt-2.5 text-caption text-ink-400">
                      {request.praying} praying · {formatDate(request.date)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Financial snapshot" />
              <CardBody>
                <DataList>
                  <DataRow label="Annual budget" value={formatMoney(ministry.budget)} />
                  <DataRow label="Financial integrity score" value={ministry.categoryScores.find((c) => c.key === "financial")?.score ?? "—"} />
                  <DataRow label="Governance score" value={ministry.categoryScores.find((c) => c.key === "governance")?.score ?? "—"} />
                  <DataRow label="Region" value={ministry.region} />
                </DataList>
                <p className="mt-4 text-caption leading-relaxed text-ink-400">
                  Donor access opens audited statements, reserve position and
                  compensation practice.
                </p>
              </CardBody>
            </Card>

            <Card className="p-6" tone="sunken">
              <p className="text-sm font-semibold text-ink-900">
                Considering a significant gift?
              </p>
              <p className="mt-2 text-caption leading-relaxed text-ink-500">
                A SAVE advisor will walk you through the full assessment,
                introduce you to leadership, and stay with the relationship.
              </p>
              <Btn className="mt-4 w-full" href="/preview/donor" variant="secondary">
                Talk to an advisor
              </Btn>
            </Card>
          </aside>
        </div>

        {/* Related */}
        <section className="mt-section">
          <SectionTitle description="Assessed against the same standard, working in adjacent fields.">
            Others you may want to know
          </SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MINISTRIES.filter((item) => item.slug !== ministry.slug)
              .slice(0, 3)
              .map((item) => (
                <Card className="p-6" key={item.id}>
                  <div className="flex items-start justify-between gap-4">
                    <Monogram name={item.name} size="md" />
                    <span className="save-numeric save-display text-lg font-semibold text-ink-900">
                      {item.score}
                    </span>
                  </div>
                  <p className="mt-3.5 text-sm font-semibold text-ink-900">
                    {item.name}
                  </p>
                  <p className="mt-1 text-caption text-ink-400">
                    {item.category}
                  </p>
                  <Btn
                    className="mt-4"
                    href={`/preview/ministry-profile/${item.slug}`}
                    size="sm"
                    variant="secondary"
                  >
                    View assessment
                  </Btn>
                </Card>
              ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
