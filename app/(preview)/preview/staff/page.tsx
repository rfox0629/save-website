import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Meter,
  Monogram,
  PageTitle,
  Select,
  Stat,
  StatRow,
  Table,
  Tabs,
  Td,
  Th,
  formatDate,
} from "@/components/save/primitives";
import { STAFF_ACCOUNT, staffNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { AUDIT_LOG, QUEUE, REVIEWERS, STAFF_METRICS } from "@/lib/preview/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Queue" };

const STAGE_TONE = {
  Assessment: "ink",
  Decision: "brass",
  "Evidence review": "ink",
  Inquiry: "neutral",
  Publishing: "sage",
  Scoring: "clay",
} as const;

export default function StaffQueuePage() {
  const unassigned = QUEUE.filter((item) => item.reviewer === null);
  const breached = QUEUE.filter((item) => item.slaBreached);

  return (
    <AppShell
      account={STAFF_ACCOUNT}
      groups={staffNav("queue")}
      persona="staff"
      topBar={
        <TopBar
          actions={
            <>
              <Btn size="sm" variant="secondary">
                Export queue
              </Btn>
              <Btn size="sm">Assign unclaimed</Btn>
            </>
          }
          breadcrumb={[{ label: "Queue" }]}
          status={
            breached.length > 0 ? (
              <Badge tone="risk">{breached.length} past SLA</Badge>
            ) : null
          }
        />
      }
    >
      <PageTitle
        description="Every application SAVE is currently carrying, and who is carrying it."
        eyebrow="Operations"
      >
        Application queue
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat
            caption={`${unassigned.length} awaiting a reviewer`}
            label="In queue"
            value={STAFF_METRICS.inQueue}
          />
          <Stat
            delta={{ direction: "down", label: "4 days vs Q1" }}
            label="Median days to decision"
            value={STAFF_METRICS.medianDaysToDecision}
          />
          <Stat
            caption="Trailing twelve months"
            label="Approval rate"
            value={`${STAFF_METRICS.approvalRate}%`}
          />
          <Stat
            caption="Briefs live to donors"
            label="Published this quarter"
            value={STAFF_METRICS.publishedThisQuarter}
          />
        </StatRow>
      </div>

      <div className="mt-8 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Tabs
            items={[
              { active: true, count: QUEUE.length, href: "#all", label: "All" },
              { count: unassigned.length, href: "#unassigned", label: "Unassigned" },
              { count: 4, href: "#mine", label: "Mine" },
              { count: breached.length, href: "#sla", label: "Past SLA" },
            ]}
          />

          <Card>
            <CardHeader
              action={
                <div className="flex gap-2.5">
                  <Input
                    aria-label="Search applications"
                    className="h-9 w-52"
                    placeholder="Search ministry or ID"
                  />
                  <Select aria-label="Stage" className="h-9 w-auto">
                    <option>All stages</option>
                    <option>Inquiry</option>
                    <option>Assessment</option>
                    <option>Evidence review</option>
                    <option>Scoring</option>
                    <option>Decision</option>
                    <option>Publishing</option>
                  </Select>
                </div>
              }
              title="Applications"
            />
            <Table>
              <thead>
                <tr>
                  <Th>Ministry</Th>
                  <Th>Stage</Th>
                  <Th>Reviewer</Th>
                  <Th align="right">Days</Th>
                  <Th align="right">Flags</Th>
                  <Th align="right">Score</Th>
                  <Th align="right" />
                </tr>
              </thead>
              <tbody>
                {QUEUE.map((application) => (
                  <tr
                    className={cn(
                      "transition hover:bg-paper-100",
                      application.slaBreached && "bg-risk-50/40",
                    )}
                    key={application.id}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <Monogram name={application.ministry} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-900">
                            {application.ministry}
                          </p>
                          <p className="save-numeric text-caption text-ink-400">
                            {application.id} ·{" "}
                            {formatDate(application.submitted)}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={STAGE_TONE[application.stage]}>
                        {application.stage}
                      </Badge>
                    </Td>
                    <Td>
                      {application.reviewer ? (
                        <span className="text-ink-700">
                          {application.reviewer}
                        </span>
                      ) : (
                        <Badge tone="clay">Unassigned</Badge>
                      )}
                    </Td>
                    <Td align="right" numeric>
                      <span
                        className={cn(
                          application.slaBreached &&
                            "font-semibold text-risk-700",
                        )}
                      >
                        {application.daysInStage}
                      </span>
                    </Td>
                    <Td align="right" numeric>
                      {application.flags > 0 ? (
                        <Badge tone={application.flags >= 3 ? "risk" : "clay"}>
                          {application.flags}
                        </Badge>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </Td>
                    <Td align="right" numeric>
                      {application.score !== null ? (
                        <span className="font-semibold text-ink-900">
                          {application.score}
                        </span>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </Td>
                    <Td align="right">
                      <Btn
                        href="/preview/staff/review"
                        size="sm"
                        variant="secondary"
                      >
                        Open
                      </Btn>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <CardFooter>
              <span className="save-numeric text-caption text-ink-400">
                {QUEUE.length} applications · {unassigned.length} unassigned
              </span>
              <Btn size="sm" variant="secondary">
                Bulk assign
              </Btn>
            </CardFooter>
          </Card>
        </div>

        {/* ------------------------------------------------------------ Rail */}
        <aside className="space-y-6">
          <Card id="reviewers">
            <CardHeader
              description="Load against declared capacity."
              title="Reviewers"
            />
            <CardBody className="space-y-5">
              {REVIEWERS.map((reviewer) => {
                const load = Math.round(
                  (reviewer.active / reviewer.capacity) * 100,
                );

                return (
                  <div key={reviewer.id}>
                    <div className="flex items-center gap-3">
                      <Monogram name={reviewer.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-caption font-semibold text-ink-900">
                          {reviewer.name}
                        </p>
                        <p className="truncate text-micro uppercase tracking-[0.08em] text-ink-400">
                          {reviewer.specialty}
                        </p>
                      </div>
                      <span className="save-numeric shrink-0 text-caption font-semibold text-ink-700">
                        {reviewer.active}/{reviewer.capacity}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Meter
                        tone={load >= 100 ? "clay" : load >= 80 ? "brass" : "sage"}
                        value={load}
                      />
                    </div>
                  </div>
                );
              })}
            </CardBody>
            <CardFooter>
              <span className="text-caption text-ink-400">
                Michael has capacity
              </span>
              <Btn size="sm" variant="secondary">
                Assign
              </Btn>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader
              action={
                <Btn href="/preview/staff/audit" size="sm" variant="ghost">
                  All
                </Btn>
              }
              title="Recent activity"
            />
            <div className="divide-y divide-hairline">
              {AUDIT_LOG.slice(0, 5).map((entry) => (
                <div className="px-6 py-3.5" key={entry.id}>
                  <p className="text-caption font-medium text-ink-900">
                    {entry.action}
                  </p>
                  {entry.detail ? (
                    <p className="mt-0.5 text-caption text-ink-500">
                      {entry.detail}
                    </p>
                  ) : null}
                  <p className="save-numeric mt-1 text-micro text-ink-400">
                    {entry.actor} · {entry.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">
              SLA at a glance
            </p>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">
              Inquiry response within 5 business days. Evidence review within
              10. Decision within 90 days of assessment submission.
            </p>
            <Badge className="mt-3.5" tone="risk">
              {breached.length} breached
            </Badge>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
