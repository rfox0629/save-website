import type { Metadata } from "next";

import {
  Btn,
  Card,
  CardHeader,
  PageTitle,
  Select,
  Tabs,
} from "@/components/save/primitives";
import { UpdateItem } from "@/components/save/patterns";
import { DONOR_ACCOUNT, donorNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { DONOR, getMinistry } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Updates" };

export default function DonorUpdatesPage() {
  const following = DONOR.followingSlugs.map(getMinistry);
  const feed = following
    .flatMap((ministry) =>
      ministry.updates.map((update) => ({ ministry, update })),
    )
    .sort((a, b) => b.update.date.localeCompare(a.update.date));

  return (
    <AppShell
      account={DONOR_ACCOUNT}
      groups={donorNav("updates")}
      persona="donor"
      topBar={
        <TopBar
          breadcrumb={[
            { href: "/preview/donor", label: "Home" },
            { label: "Updates" },
          ]}
        />
      }
    >
      <PageTitle
        description="Everything the ministries you follow have published, newest first."
        eyebrow="Relationships"
      >
        Updates
      </PageTitle>

      <div className="mt-7">
        <Tabs
          items={[
            { active: true, count: feed.length, href: "#all", label: "All" },
            { href: "#milestones", label: "Milestones" },
            { href: "#field", label: "From the field" },
            { href: "#financial", label: "Financial" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card className="min-w-0">
          <CardHeader
            action={
              <Select aria-label="Filter by ministry" className="h-9 w-auto">
                <option>All ministries</option>
                {following.map((ministry) => (
                  <option key={ministry.id}>{ministry.name}</option>
                ))}
              </Select>
            }
            title="Your feed"
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

        <aside className="space-y-6">
          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">
              Quiet by design
            </p>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">
              Ministries may publish at most two updates a month to donors. We
              would rather you read every one than skim forty.
            </p>
          </Card>

          <Card>
            <CardHeader title="Publishing this month" />
            <div className="divide-y divide-hairline">
              {following.map((ministry) => (
                <div
                  className="flex items-center justify-between gap-3 px-6 py-3.5"
                  key={ministry.id}
                >
                  <span className="truncate text-caption font-medium text-ink-800">
                    {ministry.name}
                  </span>
                  <span className="save-numeric shrink-0 text-caption text-ink-400">
                    {ministry.updates.length} of 2
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-ink-900">
              Want more detail?
            </p>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">
              Full ministry reports — financials, outcomes and roadmap progress
              — are published twice a year.
            </p>
            <Btn className="mt-4 w-full" size="sm" variant="secondary">
              View reports
            </Btn>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
