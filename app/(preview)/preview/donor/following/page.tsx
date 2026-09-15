import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Card,
  CardBody,
  CardHeader,
  PageTitle,
  SectionTitle,
  TrustSeal,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import { MinistryCard, MinistryRow } from "@/components/save/patterns";
import { DONOR_ACCOUNT, donorNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { DONOR, GIFTS, getMinistry } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Following" };

export default function DonorFollowingPage() {
  const following = DONOR.followingSlugs.map(getMinistry);
  const saved = DONOR.savedSlugs.map(getMinistry);

  return (
    <AppShell
      account={DONOR_ACCOUNT}
      groups={donorNav("following")}
      persona="donor"
      topBar={
        <TopBar
          actions={
            <Btn href="/preview/library" size="sm" variant="secondary">
              Discover ministries
            </Btn>
          }
          breadcrumb={[
            { href: "/preview/donor", label: "Home" },
            { label: "Following" },
          ]}
        />
      }
    >
      <PageTitle
        description="Following is a commitment to pay attention, not a commitment to give."
        eyebrow="Relationships"
      >
        Ministries you follow
      </PageTitle>

      <div className="mt-8 space-y-8">
        <Card>
          <CardHeader
            description="You receive every update, report and prayer request these ministries publish."
            title={`Following · ${following.length}`}
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
                      <span className="save-numeric">{formatMoney(given)}</span>{" "}
                      in 2026 · Reassessed{" "}
                      <span className="save-numeric">
                        {formatDate(ministry.reassessmentDue)}
                      </span>
                    </>
                  }
                  ministry={ministry}
                  trailing={
                    <div className="hidden items-center gap-4 md:flex">
                      <TrustSeal size="sm" tier={ministry.tier} />
                      <span className="save-numeric save-display w-8 text-right text-lg font-semibold text-ink-900">
                        {ministry.score}
                      </span>
                      <Btn size="sm" variant="secondary">
                        Following
                      </Btn>
                    </div>
                  }
                />
              );
            })}
          </div>
        </Card>

        <section>
          <SectionTitle
            action={<Badge tone="neutral">Not yet following</Badge>}
            description="Ministries you set aside to look at properly. Nobody is notified."
          >
            Saved for later
          </SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((ministry) => (
              <MinistryCard
                action={
                  <div className="flex items-center justify-between">
                    <Btn size="sm" variant="ghost">
                      Remove
                    </Btn>
                    <Btn size="sm" variant="secondary">
                      Follow
                    </Btn>
                  </div>
                }
                href={`/preview/donor/ministry/${ministry.slug}`}
                key={ministry.id}
                ministry={ministry}
              />
            ))}
            <Card className="flex items-center justify-center border-dashed p-8" tone="flat">
              <div className="text-center">
                <p className="text-sm font-semibold text-ink-800">
                  Looking for something specific?
                </p>
                <p className="mt-1.5 text-caption text-ink-400">
                  Hannah can shortlist ministries against your priorities.
                </p>
                <Btn className="mt-4" size="sm" variant="secondary">
                  Ask your advisor
                </Btn>
              </div>
            </Card>
          </div>
        </section>

        <Card>
          <CardHeader
            description="Control what reaches you and how often."
            title="Notification preferences"
          />
          <CardBody>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { body: "As they are published", label: "Field updates" },
                { body: "Weekly digest", label: "Prayer requests" },
                { body: "Immediately", label: "Assessment changes" },
                { body: "Annually in January", label: "Giving statements" },
              ].map((preference) => (
                <div
                  className="rounded-lg border border-hairline px-4 py-4"
                  key={preference.label}
                >
                  <p className="text-caption font-semibold text-ink-900">
                    {preference.label}
                  </p>
                  <p className="mt-1.5 text-caption text-ink-400">
                    {preference.body}
                  </p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
