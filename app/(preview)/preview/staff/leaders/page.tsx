import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Monogram,
  PageTitle,
  Stat,
  StatRow,
  Table,
  Td,
  Th,
  formatDate,
} from "@/components/save/primitives";
import { STAFF_ACCOUNT, staffNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { LEADER_HEALTH } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Leader health" };

/**
 * Leader health is the quiet, pastoral half of the standard. It is tracked
 * separately from scoring because a leader in trouble is a care question
 * before it is an assessment question.
 */
export default function LeaderHealthPage() {
  const watch = LEADER_HEALTH.filter((item) => item.status === "watch");

  return (
    <AppShell
      account={STAFF_ACCOUNT}
      groups={staffNav("leaders")}
      persona="staff"
      topBar={
        <TopBar
          actions={<Btn size="sm">Log a check-in</Btn>}
          breadcrumb={[
            { href: "/preview/staff", label: "Queue" },
            { label: "Leader health" },
          ]}
          status={<Badge tone="clay">{watch.length} on watch</Badge>}
        />
      }
    >
      <PageTitle
        description="Every approved ministry has a leader we stay in touch with. This is pastoral care, not surveillance — and it is never shown to donors."
        eyebrow="Portfolio"
      >
        Leader health
      </PageTitle>

      <Callout className="mt-7" title="How this is used" tone="ink">
        A flag here does not change a ministry&apos;s score. It tells us to pick
        up the phone. Assessment consequences only follow if a leader declines
        accountability entirely, and that conversation happens with them first.
      </Callout>

      <div className="mt-6">
        <StatRow>
          <Stat caption="Under active care" label="Leaders tracked" value={LEADER_HEALTH.length} />
          <Stat caption="Needing a conversation" label="On watch" value={watch.length} />
          <Stat caption="Target is 90 days" label="Median days since check-in" value="41" />
          <Stat caption="Overdue check-ins" label="Past 120 days" value="1" />
        </StatRow>
      </div>

      <Card className="mt-6">
        <CardHeader
          description="Sorted by how long it has been since anyone from SAVE spoke with them."
          title="Leaders"
        />
        <Table>
          <thead>
            <tr>
              <Th>Leader</Th>
              <Th>Ministry</Th>
              <Th>Last check-in</Th>
              <Th>Note</Th>
              <Th align="right">Status</Th>
              <Th align="right" />
            </tr>
          </thead>
          <tbody>
            {[...LEADER_HEALTH]
              .sort((a, b) => a.lastCheckIn.localeCompare(b.lastCheckIn))
              .map((item) => (
                <tr className="transition hover:bg-paper-100" key={item.leader}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram
                        name={item.leader}
                        size="sm"
                        tone={item.status === "watch" ? "clay" : "sage"}
                      />
                      <span className="font-medium text-ink-900">
                        {item.leader}
                      </span>
                    </div>
                  </Td>
                  <Td>{item.ministry}</Td>
                  <Td numeric>{formatDate(item.lastCheckIn)}</Td>
                  <Td>
                    {item.flag ? (
                      <span className="text-clay-700">{item.flag}</span>
                    ) : (
                      <span className="text-ink-300">—</span>
                    )}
                  </Td>
                  <Td align="right">
                    {item.status === "watch" ? (
                      <Badge tone="clay">Watch</Badge>
                    ) : (
                      <Badge tone="sage">Healthy</Badge>
                    )}
                  </Td>
                  <Td align="right">
                    <Btn size="sm" variant="secondary">
                      Log check-in
                    </Btn>
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            description="The four things we ask about, every time."
            title="What a check-in covers"
          />
          <CardBody className="space-y-4">
            {[
              { body: "Who can tell this leader something they do not want to hear, and when did that last happen?", title: "Accountability" },
              { body: "Is the marriage and family in a sustainable place? We ask, we do not investigate.", title: "Household" },
              { body: "Is there a written, board-adopted plan for what happens if they stop tomorrow?", title: "Succession" },
              { body: "What is the hardest thing right now that they have not told anyone?", title: "Load" },
            ].map((item) => (
              <div key={item.title}>
                <p className="text-sm font-semibold text-ink-900">
                  {item.title}
                </p>
                <p className="mt-1 text-caption leading-relaxed text-ink-500">
                  {item.body}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Open concerns" />
          <CardBody className="space-y-5">
            {watch.map((item) => (
              <div
                className="rounded-lg border border-clay-100 bg-clay-50 px-5 py-4"
                key={item.leader}
              >
                <p className="text-sm font-semibold text-clay-700">
                  {item.leader}
                </p>
                <p className="mt-0.5 text-caption text-clay-700/70">
                  {item.ministry}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-clay-700/90">
                  {item.flag}
                </p>
                <div className="mt-3.5 flex gap-2.5">
                  <Btn size="sm" variant="secondary">
                    Schedule a call
                  </Btn>
                  <Btn size="sm" variant="ghost">
                    Add note
                  </Btn>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
