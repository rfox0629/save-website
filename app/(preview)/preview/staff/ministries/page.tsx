import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Card,
  CardHeader,
  Input,
  Monogram,
  PageTitle,
  Select,
  Stat,
  StatRow,
  Table,
  Td,
  Th,
  TrustSeal,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import { STAFF_ACCOUNT, staffNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { MINISTRIES } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Ministries" };

export default function StaffMinistriesPage() {
  const dueSoon = MINISTRIES.filter(
    (ministry) => ministry.reassessmentDue < "2027-06-01",
  );
  const totalBudget = MINISTRIES.reduce((sum, m) => sum + m.budget, 0);
  const avgScore = Math.round(
    MINISTRIES.reduce((sum, m) => sum + m.score, 0) / MINISTRIES.length,
  );

  return (
    <AppShell
      account={STAFF_ACCOUNT}
      groups={staffNav("ministries")}
      persona="staff"
      topBar={
        <TopBar
          actions={
            <Btn size="sm" variant="secondary">
              Export portfolio
            </Btn>
          }
          breadcrumb={[
            { href: "/preview/staff", label: "Queue" },
            { label: "Ministries" },
          ]}
        />
      }
    >
      <PageTitle
        description="Every ministry currently carrying a published SAVE assessment."
        eyebrow="Portfolio"
      >
        Ministries
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat caption="Published assessments" label="Ministries" value={MINISTRIES.length} />
          <Stat caption="Across the portfolio" label="Combined budget" value={formatMoney(totalBudget)} />
          <Stat caption="Weighted equally" label="Average score" value={avgScore} />
          <Stat caption="Within 12 months" label="Reassessment due" value={dueSoon.length} />
        </StatRow>
      </div>

      <Card className="mt-6">
        <CardHeader
          action={
            <div className="flex flex-wrap gap-2.5">
              <Input
                aria-label="Search ministries"
                className="h-9 w-52"
                placeholder="Search"
              />
              <Select aria-label="Tier" className="h-9 w-auto">
                <option>All tiers</option>
                <option>High Confidence Opportunity</option>
                <option>Strong Opportunity</option>
                <option>Proceed with Discernment</option>
              </Select>
            </div>
          }
          title="Published portfolio"
        />
        <Table>
          <thead>
            <tr>
              <Th>Ministry</Th>
              <Th>Tier</Th>
              <Th align="right">Score</Th>
              <Th align="right">Budget</Th>
              <Th>Assessed</Th>
              <Th>Reassessment</Th>
              <Th align="right" />
            </tr>
          </thead>
          <tbody>
            {[...MINISTRIES]
              .sort((a, b) => a.reassessmentDue.localeCompare(b.reassessmentDue))
              .map((ministry) => (
                <tr className="transition hover:bg-paper-100" key={ministry.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={ministry.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">
                          {ministry.name}
                        </p>
                        <p className="truncate text-caption text-ink-400">
                          {ministry.category} · {ministry.location}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <TrustSeal size="sm" tier={ministry.tier} />
                  </Td>
                  <Td align="right" numeric>
                    <span className="font-semibold text-ink-900">
                      {ministry.score}
                    </span>
                  </Td>
                  <Td align="right" numeric>
                    {formatMoney(ministry.budget)}
                  </Td>
                  <Td numeric>{formatDate(ministry.assessedOn)}</Td>
                  <Td numeric>
                    <span
                      className={
                        ministry.reassessmentDue < "2027-06-01"
                          ? "font-medium text-clay-700"
                          : "text-ink-500"
                      }
                    >
                      {formatDate(ministry.reassessmentDue)}
                    </span>
                  </Td>
                  <Td align="right">
                    <Btn
                      href={`/preview/ministry-profile/${ministry.slug}`}
                      size="sm"
                      variant="secondary"
                    >
                      View
                    </Btn>
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Card>

      {dueSoon.length > 0 ? (
        <Card className="mt-6">
          <CardHeader
            action={<Badge tone="clay">{dueSoon.length} due</Badge>}
            description="Start these three months before the due date so nothing lapses."
            title="Reassessment coming up"
          />
          <div className="divide-y divide-hairline">
            {dueSoon.map((ministry) => (
              <div
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                key={ministry.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Monogram name={ministry.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {ministry.name}
                    </p>
                    <p className="save-numeric text-caption text-ink-400">
                      Due {formatDate(ministry.reassessmentDue)}
                    </p>
                  </div>
                </div>
                <Btn size="sm" variant="secondary">
                  Open reassessment
                </Btn>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </AppShell>
  );
}
