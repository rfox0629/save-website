import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  PageTitle,
  Select,
  Stat,
  StatRow,
  Table,
  Td,
  Th,
} from "@/components/save/primitives";
import { STAFF_ACCOUNT, staffNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { AUDIT_LOG, REVIEWERS } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Audit history" };

// A few more entries so the log reads like a real week of activity.
const EXTENDED_LOG = [
  ...AUDIT_LOG,
  { action: "Brief published", actor: "Tom Reyes", detail: "Bright Path Foster Care — live to 164 donors", id: "a7", timestamp: "2026-07-28 11:15" },
  { action: "Ministry sign-off received", actor: "Bright Path Foster Care", detail: "Public profile approved", id: "a8", timestamp: "2026-07-28 09:02" },
  { action: "Second reviewer sign-off", actor: "Dana Kim", detail: "APP-2026-0142", id: "a9", timestamp: "2026-07-27 15:47" },
  { action: "Leader check-in logged", actor: "Hannah Bradley", detail: "Andre Whitfield — accountability team lapsed", id: "a10", timestamp: "2026-07-27 10:20" },
  { action: "Donor access granted", actor: "Dana Kim", detail: "2 new donor accounts", id: "a11", timestamp: "2026-07-26 16:33" },
];

const ACTION_TONE = (action: string) => {
  if (action.includes("published") || action.includes("accepted") || action.includes("sign-off")) {
    return "sage" as const;
  }
  if (action.includes("returned") || action.includes("override")) {
    return "clay" as const;
  }
  return "neutral" as const;
};

/**
 * The audit log is append-only and covers every action that could affect a
 * donor's decision. It exists so SAVE can answer "why did this ministry get
 * this score" years later.
 */
export default function AuditPage() {
  return (
    <AppShell
      account={STAFF_ACCOUNT}
      groups={staffNav("audit")}
      persona="staff"
      topBar={
        <TopBar
          actions={
            <Btn size="sm" variant="secondary">
              Export log
            </Btn>
          }
          breadcrumb={[
            { href: "/preview/staff", label: "Queue" },
            { label: "Audit history" },
          ]}
          status={<Badge tone="neutral">Append-only</Badge>}
        />
      }
    >
      <PageTitle
        description="Every action that could affect a donor's decision, permanently recorded. Entries cannot be edited or deleted."
        eyebrow="Operations"
      >
        Audit history
      </PageTitle>

      <Callout className="mt-7" title="Why this exists" tone="ink">
        A donor giving six figures on the strength of a SAVE assessment is
        entitled to know how that assessment was reached. If a score was
        overridden, this log records who did it and why.
      </Callout>

      <div className="mt-6">
        <StatRow>
          <Stat caption="Last 7 days" label="Entries" value={EXTENDED_LOG.length} />
          <Stat caption="With written reasons" label="Score overrides" value="1" />
          <Stat caption="This week" label="Documents returned" value="1" />
          <Stat caption="Retention" label="Kept for" value="Forever" />
        </StatRow>
      </div>

      <Card className="mt-6">
        <CardHeader
          action={
            <div className="flex flex-wrap gap-2.5">
              <Input
                aria-label="Search log"
                className="h-9 w-52"
                placeholder="Search actor, action or ID"
              />
              <Select aria-label="Actor" className="h-9 w-auto">
                <option>All actors</option>
                {REVIEWERS.map((reviewer) => (
                  <option key={reviewer.id}>{reviewer.name}</option>
                ))}
                <option>System</option>
              </Select>
              <Select aria-label="Range" className="h-9 w-auto">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>This quarter</option>
                <option>All time</option>
              </Select>
            </div>
          }
          title="Activity"
        />
        <Table>
          <thead>
            <tr>
              <Th>When</Th>
              <Th>Action</Th>
              <Th>Detail</Th>
              <Th align="right">Actor</Th>
            </tr>
          </thead>
          <tbody>
            {EXTENDED_LOG.map((entry) => (
              <tr className="transition hover:bg-paper-100" key={entry.id}>
                <Td numeric>
                  <span className="whitespace-nowrap text-ink-500">
                    {entry.timestamp}
                  </span>
                </Td>
                <Td>
                  <Badge tone={ACTION_TONE(entry.action)}>{entry.action}</Badge>
                </Td>
                <Td>{entry.detail ?? "—"}</Td>
                <Td align="right">
                  <span className="font-medium text-ink-900">
                    {entry.actor}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <CardFooter>
          <span className="save-numeric text-caption text-ink-400">
            Showing {EXTENDED_LOG.length} of 2,418 entries
          </span>
          <Btn size="sm" variant="secondary">
            Load more
          </Btn>
        </CardFooter>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="What gets logged" />
          <CardBody>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                "Status changes",
                "Reviewer assignment",
                "Evidence accepted or returned",
                "Score overrides and reasons",
                "Findings added or edited",
                "External checks run",
                "Brief published or withdrawn",
                "Donor access granted or revoked",
                "Leader check-ins",
                "Ministry sign-off",
              ].map((item) => (
                <div
                  className="flex items-center gap-2.5 rounded-md border border-hairline px-3.5 py-2.5"
                  key={item}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                  <span className="text-caption text-ink-600">{item}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Activity by reviewer" />
          <CardBody className="space-y-4">
            {REVIEWERS.map((reviewer) => {
              const count = EXTENDED_LOG.filter(
                (entry) => entry.actor === reviewer.name,
              ).length;

              return (
                <div
                  className="flex items-center justify-between gap-3"
                  key={reviewer.id}
                >
                  <span className="text-sm text-ink-600">{reviewer.name}</span>
                  <span className="save-numeric text-sm font-semibold text-ink-900">
                    {count}
                  </span>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
