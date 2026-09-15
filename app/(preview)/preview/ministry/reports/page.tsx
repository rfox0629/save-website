import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DataList,
  DataRow,
  Meter,
  PageTitle,
  SectionTitle,
  Stat,
  StatRow,
  Steps,
  Table,
  Td,
  Th,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import { ImpactGrid } from "@/components/save/patterns";
import { MINISTRY_ACCOUNT_CHIP, ministryNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { getMinistry } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Reports" };

const REPORTS = [
  { due: "2026-08-31", id: "rp1", period: "H1 2026", status: "in-progress", title: "Mid-year report" },
  { due: "2026-02-28", id: "rp2", period: "FY2025", status: "published", title: "Annual report" },
  { due: "2025-08-31", id: "rp3", period: "H1 2025", status: "published", title: "Mid-year report" },
  { due: "2025-02-28", id: "rp4", period: "FY2024", status: "published", title: "Annual report" },
];

export default function ReportsPage() {
  const ministry = getMinistry("rio-hope-church-network");

  return (
    <AppShell
      account={MINISTRY_ACCOUNT_CHIP}
      groups={ministryNav("reports")}
      persona="ministry"
      topBar={
        <TopBar
          actions={
            <>
              <Btn size="sm" variant="secondary">
                Preview as donor
              </Btn>
              <Btn size="sm">Continue mid-year report</Btn>
            </>
          }
          breadcrumb={[
            { href: "/preview/ministry", label: "Overview" },
            { label: "Reports" },
          ]}
          status={<Badge tone="clay">Due 31 Aug</Badge>}
        />
      }
    >
      <PageTitle
        description="Twice a year you tell your donors what happened and what it cost. This is the report that keeps a relationship going."
        eyebrow="Accountability"
      >
        Reports
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat caption="Since 2024" label="Reports published" value="3" />
          <Stat caption="Days before deadline" label="Average submission" value="6" />
          <Stat caption="Of followers open it" label="Read rate" value="84%" />
          <Stat caption="Mid-year 2026" label="Next due" value={formatDate("2026-08-31")} />
        </StatRow>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* ------------------------------------------------ Report in flight */}
          <Card>
            <CardHeader
              action={<Badge tone="clay">Due {formatDate("2026-08-31")}</Badge>}
              description="Four sections. Each one pulls forward what you already told us."
              title="Mid-year report · H1 2026"
            />
            <CardBody>
              <Steps
                steps={[
                  { label: "Narrative", meta: "Complete", state: "done" },
                  { label: "Impact figures", meta: "Complete", state: "done" },
                  { label: "Financials", meta: "In progress", state: "current" },
                  { label: "Roadmap progress", meta: "Not started", state: "todo" },
                ]}
              />
            </CardBody>
            <CardFooter>
              <div className="w-56">
                <Meter label="Report complete" tone="ink" value={55} />
              </div>
              <Btn size="sm">Continue</Btn>
            </CardFooter>
          </Card>

          {/* ------------------------------------------------------- Preview */}
          <Card>
            <CardHeader
              description="What your donors will see. Impact figures carry through from your profile."
              title="Impact this period"
            />
            <CardBody>
              <ImpactGrid metrics={ministry.impact} />
            </CardBody>
          </Card>

          {/* ---------------------------------------------------- Financials */}
          <Card>
            <CardHeader
              description="Pulled from the figures you supplied during assessment. Edit before publishing."
              title="Financial summary"
            />
            <Table>
              <thead>
                <tr>
                  <Th>Line</Th>
                  <Th align="right">H1 2026</Th>
                  <Th align="right">H1 2025</Th>
                  <Th align="right">Change</Th>
                </tr>
              </thead>
              <tbody>
                {[
                  { current: 862_000, label: "Total revenue", prior: 741_000 },
                  { current: 694_000, label: "Program expense", prior: 602_000 },
                  { current: 108_000, label: "Administration", prior: 96_000 },
                  { current: 61_000, label: "Fundraising", prior: 54_000 },
                ].map((row) => {
                  const change = Math.round(
                    ((row.current - row.prior) / row.prior) * 100,
                  );

                  return (
                    <tr key={row.label}>
                      <Td>
                        <span className="font-medium text-ink-900">
                          {row.label}
                        </span>
                      </Td>
                      <Td align="right" numeric>
                        {formatMoney(row.current)}
                      </Td>
                      <Td align="right" numeric>
                        {formatMoney(row.prior)}
                      </Td>
                      <Td align="right" numeric>
                        <span className="font-medium text-sage-600">
                          +{change}%
                        </span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <CardBody className="border-t border-hairline">
              <DataList>
                <DataRow label="Program expense ratio" value="80.1%" />
                <DataRow label="Months of operating reserve" value="12" />
                <DataRow label="Designated funds held" value={formatMoney(214_000)} />
              </DataList>
            </CardBody>
          </Card>

          {/* -------------------------------------------------------- Archive */}
          <Card>
            <CardHeader title="Published reports" />
            <Table>
              <thead>
                <tr>
                  <Th>Report</Th>
                  <Th>Period</Th>
                  <Th>Published</Th>
                  <Th align="right">Status</Th>
                </tr>
              </thead>
              <tbody>
                {REPORTS.map((report) => (
                  <tr className="transition hover:bg-paper-100" key={report.id}>
                    <Td>
                      <span className="font-medium text-ink-900">
                        {report.title}
                      </span>
                    </Td>
                    <Td>{report.period}</Td>
                    <Td numeric>{formatDate(report.due)}</Td>
                    <Td align="right">
                      {report.status === "published" ? (
                        <Badge tone="sage">Published</Badge>
                      ) : (
                        <Badge tone="clay">In progress</Badge>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>

        <aside className="space-y-6">
          <Callout title="Why twice a year" tone="ink">
            Quarterly reporting turns into paperwork and monthly turns into
            noise. Twice a year is enough for a donor to follow a story and
            light enough that a small team can do it well.
          </Callout>

          <Card>
            <CardHeader title="Who receives this" />
            <CardBody>
              <DataList>
                <DataRow label="Followers" value="214" />
                <DataRow label="Gave in this period" value="38" />
                <DataRow label="Major partners" value="12" />
                <DataRow label="Your SAVE reviewer" value="Always" />
              </DataList>
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <SectionTitle>Reporting and reassessment</SectionTitle>
            <p className="text-caption leading-relaxed text-ink-500">
              Reports feed directly into reassessment. Ministries that report on
              time with consistent figures spend markedly less time in
              reassessment because the evidence is already there.
            </p>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
