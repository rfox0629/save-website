import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DataList,
  DataRow,
  Divider,
  Monogram,
  PageTitle,
  ScoreDial,
  Stat,
  StatRow,
  Tabs,
  TrustSeal,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import {
  AssessmentProvenance,
  CategoryBreakdown,
  ImpactGrid,
  PrayerCard,
  TestimonyCard,
  TierExplainer,
  UpdateItem,
} from "@/components/save/patterns";
import { DONOR_ACCOUNT, donorNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { GIFTS, MINISTRIES, PLEDGES, getMinistry } from "@/lib/preview/data";

export function generateStaticParams() {
  return MINISTRIES.map((ministry) => ({ slug: ministry.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  return { title: getMinistry(params.slug).name };
}

export default function DonorMinistryDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const ministry = getMinistry(params.slug);
  const gifts = GIFTS.filter((gift) => gift.ministrySlug === ministry.slug);
  const givenThisYear = gifts.reduce((total, gift) => total + gift.amount, 0);
  const pledge = PLEDGES.find((item) => item.ministrySlug === ministry.slug);

  return (
    <AppShell
      account={DONOR_ACCOUNT}
      groups={donorNav("following")}
      persona="donor"
      topBar={
        <TopBar
          actions={
            <>
              <Btn size="sm" variant="secondary">
                Following
              </Btn>
              <Btn size="sm">Give to this ministry</Btn>
            </>
          }
          breadcrumb={[
            { href: "/preview/donor", label: "Home" },
            { href: "/preview/donor/following", label: "Following" },
            { label: ministry.name },
          ]}
          status={<TrustSeal size="sm" tier={ministry.tier} />}
        />
      }
    >
      {/* --------------------------------------------------------- Header -- */}
      <div className="flex flex-wrap items-start gap-5">
        <Monogram name={ministry.name} size="xl" />
        <div className="min-w-0 flex-1">
          <PageTitle
            description={ministry.tagline}
            eyebrow={`${ministry.category} · ${ministry.location}`}
          >
            {ministry.name}
          </PageTitle>
        </div>
      </div>

      <div className="mt-7">
        <Tabs
          items={[
            { active: true, href: "#relationship", label: "Relationship" },
            { href: "#assessment", label: "Assessment" },
            { href: "#impact", label: "Impact" },
            { count: gifts.length, href: "#giving", label: "Your giving" },
            { count: ministry.updates.length, href: "#updates", label: "Updates" },
          ]}
        />
      </div>

      {/* ------------------------------------------------- Your position -- */}
      <div className="mt-7" id="relationship">
        <StatRow>
          <Stat
            caption="Your 2026 giving"
            label="Given this year"
            value={formatMoney(givenThisYear)}
          />
          <Stat
            caption="Since you began following"
            label="Lifetime to this ministry"
            value={formatMoney(givenThisYear * 3 + 40_000)}
          />
          <Stat
            caption={pledge ? `Through ${formatDate(pledge.through)}` : "No open pledge"}
            label="Outstanding commitment"
            value={
              pledge ? formatMoney(pledge.amount - pledge.committed) : "—"
            }
          />
          <Stat
            caption={`Reassessment ${formatDate(ministry.reassessmentDue)}`}
            label="SAVE score"
            value={ministry.score}
          />
        </StatRow>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* ------------------------------------------------------ Updates */}
          <Card id="updates">
            <CardHeader
              action={<Badge tone="sage">Following</Badge>}
              description="Sent to you directly because you follow this ministry."
              title="Updates from the field"
            />
            <div className="[&>article:last-child_.bg-hairline]:hidden">
              {ministry.updates.map((update) => (
                <UpdateItem key={update.id} update={update} />
              ))}
            </div>
            <CardFooter>
              <span className="text-caption text-ink-400">
                You receive these by email as they are published.
              </span>
              <Btn size="sm" variant="ghost">
                Notification settings
              </Btn>
            </CardFooter>
          </Card>

          {/* ------------------------------------------------------- Impact */}
          <Card id="impact">
            <CardHeader
              description="What has changed, measured over years rather than campaigns."
              title="Impact"
            />
            <CardBody>
              <ImpactGrid metrics={ministry.impact} />
              <p className="mt-5 text-caption leading-relaxed text-ink-400">
                Figures are reported by the ministry and checked against the
                evidence supplied during assessment. Where SAVE could not verify
                a figure independently, the assessment says so.
              </p>
            </CardBody>
          </Card>

          {/* --------------------------------------------------- Assessment */}
          <Card id="assessment">
            <CardHeader
              action={
                <Btn size="sm" variant="secondary">
                  Download full brief
                </Btn>
              }
              description="The complete SAVE assessment, opened by your donor access."
              title="The assessment"
            />
            <CardBody>
              <div className="flex flex-wrap items-center gap-7">
                <ScoreDial label="SAVE score" score={ministry.score} />
                <div className="min-w-0 flex-1">
                  <TierExplainer tier={ministry.tier} />
                </div>
              </div>
              <Divider className="my-6" />
              <CategoryBreakdown scores={ministry.categoryScores} />
            </CardBody>
          </Card>

          {/* --------------------------------------------------- Testimonies */}
          <Card>
            <CardHeader
              description="From the people this ministry serves."
              title="In their own words"
            />
            <CardBody className="grid gap-5 md:grid-cols-2">
              {ministry.testimonies.map((testimony) => (
                <TestimonyCard key={testimony.id} testimony={testimony} />
              ))}
            </CardBody>
          </Card>

          {/* -------------------------------------------------- Your giving */}
          <Card id="giving">
            <CardHeader
              action={
                <Btn size="sm" variant="secondary">
                  Give again
                </Btn>
              }
              title="Your giving to this ministry"
            />
            <div className="divide-y divide-hairline">
              {gifts.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-ink-400">
                  You have not given to this ministry yet.
                </div>
              ) : (
                gifts.map((gift) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                    key={gift.id}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900">
                        {gift.designation}
                      </p>
                      <p className="save-numeric mt-0.5 text-caption text-ink-400">
                        {formatDate(gift.date)} · {gift.method}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge tone="sage">Receipted</Badge>
                      <span className="save-numeric text-sm font-semibold text-ink-900">
                        {formatMoney(gift.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* ------------------------------------------------------------ Rail */}
        <aside className="space-y-6">
          <AssessmentProvenance
            assessedOn={ministry.assessedOn}
            reassessmentDue={ministry.reassessmentDue}
          />

          <Card>
            <CardHeader title="Prayer" />
            <CardBody className="space-y-4">
              {ministry.prayer.map((request) => (
                <PrayerCard key={request.id} request={request} />
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Leadership" />
            <CardBody>
              <div className="flex items-center gap-3.5">
                <Monogram name={ministry.leader.name} size="lg" tone="sage" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">
                    {ministry.leader.name}
                  </p>
                  <p className="text-caption text-ink-400">
                    {ministry.leader.title}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                {ministry.leader.bio}
              </p>
              <Btn className="mt-5 w-full" size="sm" variant="secondary">
                Request an introduction
              </Btn>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="At a glance" />
            <CardBody>
              <DataList>
                <DataRow label="Founded" value={ministry.founded} />
                <DataRow label="Annual budget" value={formatMoney(ministry.budget)} />
                <DataRow label="Staff" value={ministry.staff} />
                <DataRow label="Region" value={ministry.region} />
                <DataRow label="EIN" value={ministry.ein} />
              </DataList>
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">Visit them</p>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">
              SAVE arranges two donor visits a year to {ministry.location}. The
              next is in October.
            </p>
            <Btn className="mt-4 w-full" size="sm" variant="secondary">
              Express interest
            </Btn>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
