import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Meter,
  PageTitle,
  Stat,
  StatRow,
  formatDate,
} from "@/components/save/primitives";
import { RoadmapRow } from "@/components/save/patterns";
import { MINISTRY_ACCOUNT_CHIP, ministryNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { ROADMAP } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Roadmap" };

export default function RoadmapPage() {
  const verified = ROADMAP.filter((item) => item.status === "verified");
  const submitted = ROADMAP.filter((item) => item.status === "submitted");
  const open = ROADMAP.filter(
    (item) => item.status === "not-started" || item.status === "in-progress",
  );
  const pct = Math.round((verified.length / ROADMAP.length) * 100);

  return (
    <AppShell
      account={MINISTRY_ACCOUNT_CHIP}
      groups={ministryNav("roadmap")}
      persona="ministry"
      topBar={
        <TopBar
          actions={
            <>
              <Btn size="sm" variant="secondary">
                Export for board
              </Btn>
              <Btn size="sm">Add an item</Btn>
            </>
          }
          breadcrumb={[
            { href: "/preview/ministry", label: "Overview" },
            { label: "Roadmap" },
          ]}
        />
      }
    >
      <PageTitle
        description="Every gap in your findings becomes an item here, with an owner and a date. Working the roadmap is what moves your score at reassessment."
        eyebrow="Implementation"
      >
        Your roadmap
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat caption="Confirmed by SAVE" label="Verified" value={verified.length} />
          <Stat caption="Awaiting reviewer" label="Submitted" value={submitted.length} />
          <Stat caption="With your team" label="Open" value={open.length} />
          <Stat caption="Of all roadmap items" label="Complete" value={`${pct}%`} />
        </StatRow>
      </div>

      <Card className="mt-6 px-7 py-6">
        <Meter
          label="Roadmap progress"
          tone="sage"
          value={pct}
          valueLabel={`${verified.length} of ${ROADMAP.length} verified`}
        />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              action={<Badge tone="ink">{open.length} open</Badge>}
              description="Sorted by due date. Anything overdue moves to the top."
              title="In flight"
            />
            <div className="divide-y divide-hairline">
              {[...open, ...submitted]
                .sort((a, b) => a.due.localeCompare(b.due))
                .map((item) => (
                  <RoadmapRow item={item} key={item.id} />
                ))}
            </div>
            <CardFooter>
              <span className="text-caption text-ink-400">
                Next due {formatDate(open.sort((a, b) => a.due.localeCompare(b.due))[0]?.due ?? "2026-08-15")}
              </span>
              <Btn size="sm" variant="secondary">
                Assign owners
              </Btn>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader
              action={<Badge tone="sage">{verified.length} verified</Badge>}
              description="Confirmed by your reviewer. These count toward reassessment."
              title="Done"
            />
            <div className="divide-y divide-hairline">
              {verified.map((item) => (
                <RoadmapRow item={item} key={item.id} />
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Callout title="What the roadmap is for" tone="sage">
            The roadmap is not a punishment list. It is the shortest path from
            where you are to the assessment you want. Ministries that close
            their roadmap before reassessment gain an average of eleven points.
          </Callout>

          <Card>
            <CardHeader title="Effort at a glance" />
            <CardBody className="space-y-4">
              {(["low", "medium", "high"] as const).map((effort) => {
                const items = ROADMAP.filter((item) => item.effort === effort);
                return (
                  <div
                    className="flex items-center justify-between gap-3"
                    key={effort}
                  >
                    <span className="text-sm capitalize text-ink-600">
                      {effort} effort
                    </span>
                    <span className="save-numeric text-sm font-semibold text-ink-900">
                      {items.length}
                    </span>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Owners" />
            <CardBody className="space-y-3.5">
              {Array.from(new Set(ROADMAP.map((item) => item.owner))).map(
                (owner) => {
                  const count = ROADMAP.filter(
                    (item) => item.owner === owner && item.status !== "verified",
                  ).length;

                  return (
                    <div
                      className="flex items-center justify-between gap-3"
                      key={owner}
                    >
                      <span className="text-sm text-ink-600">{owner}</span>
                      <Badge tone={count === 0 ? "sage" : "neutral"}>
                        {count === 0 ? "Clear" : `${count} open`}
                      </Badge>
                    </div>
                  );
                },
              )}
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">
              Reassessment
            </p>
            <p className="save-numeric mt-2 text-caption leading-relaxed text-ink-500">
              Scheduled for {formatDate("2028-06-03")}. You can request an early
              reassessment once every roadmap item is verified.
            </p>
            <Btn className="mt-4 w-full" size="sm" variant="secondary">
              Request early reassessment
            </Btn>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
