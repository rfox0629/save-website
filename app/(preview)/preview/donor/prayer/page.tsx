import type { Metadata } from "next";

import {
  Btn,
  Card,
  CardBody,
  CardHeader,
  PageTitle,
  Stat,
  StatRow,
} from "@/components/save/primitives";
import { PrayerCard } from "@/components/save/patterns";
import { DONOR_ACCOUNT, donorNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { DONOR, getMinistry } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Prayer" };

export default function DonorPrayerPage() {
  const following = DONOR.followingSlugs.map(getMinistry);
  const requests = following
    .flatMap((ministry) =>
      ministry.prayer.map((request) => ({ ministry, request })),
    )
    .sort(
      (a, b) =>
        Number(b.request.urgent ?? 0) - Number(a.request.urgent ?? 0) ||
        b.request.date.localeCompare(a.request.date),
    );

  const urgent = requests.filter((item) => item.request.urgent);

  return (
    <AppShell
      account={DONOR_ACCOUNT}
      groups={donorNav("prayer")}
      persona="donor"
      topBar={
        <TopBar
          actions={
            <Btn size="sm" variant="secondary">
              Print prayer list
            </Btn>
          }
          breadcrumb={[
            { href: "/preview/donor", label: "Home" },
            { label: "Prayer" },
          ]}
        />
      }
    >
      <PageTitle
        description="The ministries you support asked for this. It is the part of the relationship that costs nothing and matters most."
        eyebrow="Relationships"
      >
        Pray with them
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat label="Open requests" value={requests.length} />
          <Stat label="Marked urgent" value={urgent.length} />
          <Stat label="Ministries" value={following.length} />
          <Stat caption="Across all followers" label="People praying" value="404" />
        </StatRow>
      </div>

      {urgent.length > 0 ? (
        <section className="mt-8">
          <Card>
            <CardHeader
              description="These ministries flagged a time-sensitive need."
              title="Urgent"
            />
            <CardBody className="grid gap-5 md:grid-cols-2">
              {urgent.map(({ ministry, request }) => (
                <PrayerCard
                  key={`${ministry.id}-${request.id}`}
                  ministryName={ministry.name}
                  request={request}
                />
              ))}
            </CardBody>
          </Card>
        </section>
      ) : null}

      <section className="mt-6">
        <Card>
          <CardHeader
            description="From every ministry you follow."
            title="All requests"
          />
          <CardBody className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {requests.map(({ ministry, request }) => (
              <PrayerCard
                key={`${ministry.id}-${request.id}`}
                ministryName={ministry.name}
                request={request}
              />
            ))}
          </CardBody>
        </Card>
      </section>

      <section className="mt-6">
        <Card className="p-8" tone="seal">
          <p className="save-display text-title font-semibold text-brass-700">
            Answered
          </p>
          <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-brass-700/80">
            When a request is answered, the ministry tells you. Four of the
            requests you prayed for this year have been marked answered — the
            Springfield building, two family relocations, and the Karen
            translation reaching press.
          </p>
          <Btn className="mt-5" size="sm" variant="secondary">
            Read the answers
          </Btn>
        </Card>
      </section>
    </AppShell>
  );
}
