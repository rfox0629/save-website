import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Meter,
  Monogram,
  PageTitle,
  Stat,
  StatRow,
  TrustSeal,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import {
  MinistryRow,
  PrayerCard,
  TestimonyCard,
  UpdateItem,
} from "@/components/save/patterns";
import { DONOR_ACCOUNT, donorNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import {
  DONOR,
  GIFTS,
  MINISTRIES,
  PLEDGES,
  getMinistry,
} from "@/lib/preview/data";

export const metadata: Metadata = { title: "Home" };

export default function DonorHomePage() {
  const following = DONOR.followingSlugs.map(getMinistry);

  // The relationship feed: every follower update, newest first.
  const feed = following
    .flatMap((ministry) =>
      ministry.updates.map((update) => ({ ministry, update })),
    )
    .sort((a, b) => b.update.date.localeCompare(a.update.date))
    .slice(0, 4);

  const prayers = following
    .flatMap((ministry) =>
      ministry.prayer.map((request) => ({ ministry, request })),
    )
    .sort((a, b) => Number(b.request.urgent ?? 0) - Number(a.request.urgent ?? 0))
    .slice(0, 2);

  return (
    <AppShell
      account={DONOR_ACCOUNT}
      groups={donorNav("home")}
      persona="donor"
      topBar={
        <TopBar
          actions={
            <Btn href="/preview/library" size="sm" variant="secondary">
              Discover ministries
            </Btn>
          }
          breadcrumb={[{ label: "Home" }]}
        />
      }
    >
      <PageTitle
        description="Four ministries you walk with, and what has happened since you last visited."
        eyebrow={`Donor since ${DONOR.since}`}
      >
        Good afternoon, Margaret.
      </PageTitle>

      {/* ------------------------------------------------------ Position -- */}
      <div className="mt-8">
        <StatRow>
          <Stat
            caption="Across 4 ministries"
            label="Given this year"
            value={formatMoney(DONOR.givenThisYear)}
          />
          <Stat
            caption={`Since ${DONOR.since}`}
            label="Lifetime giving"
            value={formatMoney(DONOR.givenLifetime)}
          />
          <Stat
            caption="2 multi-year commitments"
            label="Pledged, not yet given"
            value={formatMoney(
              PLEDGES.reduce(
                (total, pledge) => total + (pledge.amount - pledge.committed),
                0,
              ),
            )}
          />
          <Stat
            caption="All currently in good standing"
            label="Ministries followed"
            value={following.length}
          />
        </StatRow>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* -------------------------------------------------- Main column -- */}
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              action={
                <Btn href="/preview/donor/updates" size="sm" variant="ghost">
                  All updates
                </Btn>
              }
              description="From the ministries you follow."
              title="What has happened"
            />
            <div className="[&>article:last-child_.bg-hairline]:hidden">
              {feed.map(({ ministry, update }) => (
                <UpdateItem
                  key={`${ministry.id}-${update.id}`}
                  ministryName={ministry.name}
                  update={update}
                />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              action={
                <Btn href="/preview/donor/following" size="sm" variant="ghost">
                  Manage
                </Btn>
              }
              description="Your relationships, and where each one stands with SAVE."
              title="Ministries you follow"
            />
            <div className="divide-y divide-hairline">
              {following.map((ministry) => {
                const given = GIFTS.filter(
                  (gift) => gift.ministrySlug === ministry.slug,
                ).reduce((total, gift) => total + gift.amount, 0);

                return (
                  <MinistryRow
                    href={`/preview/donor/ministry/${ministry.slug}`}
                    key={ministry.id}
                    meta={
                      <>
                        {ministry.category} · Given{" "}
                        <span className="save-numeric">
                          {formatMoney(given)}
                        </span>{" "}
                        this year
                      </>
                    }
                    ministry={ministry}
                    trailing={
                      <div className="hidden items-center gap-4 sm:flex">
                        <TrustSeal size="sm" tier={ministry.tier} />
                        <span className="save-numeric save-display w-8 text-right text-lg font-semibold text-ink-900">
                          {ministry.score}
                        </span>
                      </div>
                    }
                  />
                );
              })}
            </div>
            <CardFooter>
              <span className="text-caption text-ink-400">
                Reassessment keeps every listing current.
              </span>
              <Btn href="/preview/library" size="sm" variant="secondary">
                Find another ministry
              </Btn>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader
              description="A story from someone served by a ministry you support this year."
              title="Why it mattered"
            />
            <CardBody>
              <TestimonyCard testimony={MINISTRIES[0].testimonies[0]} />
            </CardBody>
          </Card>
        </div>

        {/* -------------------------------------------------------- Rail -- */}
        <aside className="space-y-6">
          {/* Advisor: the relationship, not a support ticket. */}
          <Card id="advisor">
            <CardBody>
              <p className="save-eyebrow text-brass-700">Your SAVE advisor</p>
              <div className="mt-4 flex items-center gap-3.5">
                <Monogram name={DONOR.advisor.name} size="lg" tone="brass" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">
                    {DONOR.advisor.name}
                  </p>
                  <p className="text-caption text-ink-400">
                    Senior Reviewer · with you since 2019
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                Hannah knows every ministry in your portfolio personally. She
                will arrange introductions, sit in on a visit, or talk through a
                decision before you make it.
              </p>
              <div className="mt-5 flex gap-2.5">
                <Btn className="flex-1" size="sm">
                  Message Hannah
                </Btn>
                <Btn className="flex-1" size="sm" variant="secondary">
                  Book a call
                </Btn>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              action={
                <Btn href="/preview/donor/prayer" size="sm" variant="ghost">
                  All
                </Btn>
              }
              title="Pray with them"
            />
            <CardBody className="space-y-4">
              {prayers.map(({ ministry, request }) => (
                <PrayerCard
                  key={`${ministry.id}-${request.id}`}
                  ministryName={ministry.name}
                  request={request}
                />
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              action={
                <Btn href="/preview/donor/giving" size="sm" variant="ghost">
                  Giving
                </Btn>
              }
              title="Commitments"
            />
            <CardBody className="space-y-5">
              {PLEDGES.map((pledge) => {
                const ministry = getMinistry(pledge.ministrySlug);
                const pct = Math.round(
                  (pledge.committed / pledge.amount) * 100,
                );

                return (
                  <div key={pledge.ministrySlug}>
                    <p className="text-sm font-medium text-ink-900">
                      {ministry.name}
                    </p>
                    <p className="save-numeric mt-0.5 text-caption text-ink-400">
                      Through {formatDate(pledge.through)}
                    </p>
                    <div className="mt-2.5">
                      <Meter
                        label={`${formatMoney(pledge.committed)} of ${formatMoney(pledge.amount)}`}
                        tone="brass"
                        value={pct}
                        valueLabel={`${pct}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">
                  Saved for later
                </p>
                <Badge tone="neutral">{DONOR.savedSlugs.length}</Badge>
              </div>
              <Divider className="my-4" />
              <div className="space-y-3.5">
                {DONOR.savedSlugs.map(getMinistry).map((ministry) => (
                  <div className="flex items-center gap-3" key={ministry.id}>
                    <Monogram name={ministry.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-caption font-medium text-ink-900">
                        {ministry.name}
                      </p>
                      <p className="truncate text-micro uppercase tracking-[0.08em] text-ink-400">
                        {ministry.category}
                      </p>
                    </div>
                    <span className="save-numeric text-caption font-semibold text-ink-700">
                      {ministry.score}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
