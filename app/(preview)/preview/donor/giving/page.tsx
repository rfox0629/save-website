import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DataList,
  DataRow,
  Meter,
  PageTitle,
  Select,
  Stat,
  StatRow,
  Table,
  Td,
  Th,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import { GiftRow } from "@/components/save/patterns";
import { DONOR_ACCOUNT, donorNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import {
  DONOR,
  GIFTS,
  PLEDGES,
  STATEMENTS,
  getMinistry,
} from "@/lib/preview/data";

export const metadata: Metadata = { title: "Giving" };

export default function DonorGivingPage() {
  const byMinistry = Object.entries(
    GIFTS.reduce<Record<string, number>>((totals, gift) => {
      totals[gift.ministrySlug] = (totals[gift.ministrySlug] ?? 0) + gift.amount;
      return totals;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const total = GIFTS.reduce((sum, gift) => sum + gift.amount, 0);

  return (
    <AppShell
      account={DONOR_ACCOUNT}
      groups={donorNav("giving")}
      persona="donor"
      topBar={
        <TopBar
          actions={
            <>
              <Btn size="sm" variant="secondary">
                Download 2026 statement
              </Btn>
              <Btn size="sm">Give</Btn>
            </>
          }
          breadcrumb={[{ href: "/preview/donor", label: "Home" }, { label: "Giving" }]}
        />
      }
    >
      <PageTitle
        description="Every gift, every receipt, every commitment — in one place, ready for your accountant."
        eyebrow="Giving"
      >
        Your giving
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat
            delta={{ direction: "down", label: "16% vs 2025" }}
            label="Given in 2026"
            value={formatMoney(total)}
          />
          <Stat
            caption={`Across ${STATEMENTS.length} tax years`}
            label="Lifetime giving"
            value={formatMoney(DONOR.givenLifetime)}
          />
          <Stat
            caption="Every gift receipted"
            label="Gifts this year"
            value={GIFTS.length}
          />
          <Stat
            caption="Remaining on 2 pledges"
            label="Outstanding commitment"
            value={formatMoney(
              PLEDGES.reduce(
                (sum, pledge) => sum + (pledge.amount - pledge.committed),
                0,
              ),
            )}
          />
        </StatRow>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* ------------------------------------------------- Gift history */}
          <Card>
            <CardHeader
              action={
                <Select aria-label="Filter by year" className="h-9 w-auto">
                  <option>2026</option>
                  <option>2025</option>
                  <option>2024</option>
                  <option>All years</option>
                </Select>
              }
              description="Sorted newest first. Receipts are issued within one business day."
              title="Gift history"
            />
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Ministry &amp; designation</Th>
                  <Th>Method</Th>
                  <Th align="right">Receipt</Th>
                  <Th align="right">Amount</Th>
                </tr>
              </thead>
              <tbody>
                {GIFTS.map((gift) => (
                  <GiftRow
                    gift={gift}
                    key={gift.id}
                    ministryName={getMinistry(gift.ministrySlug).name}
                  />
                ))}
              </tbody>
            </Table>
            <CardFooter>
              <span className="save-numeric text-caption text-ink-400">
                {GIFTS.length} gifts
              </span>
              <span className="save-numeric text-sm font-semibold text-ink-900">
                {formatMoney(total)}
              </span>
            </CardFooter>
          </Card>

          {/* --------------------------------------------------- Statements */}
          <Card id="statements">
            <CardHeader
              description="Consolidated across every ministry you give through SAVE. Signed and audit-ready."
              title="Annual statements"
            />
            <Table>
              <thead>
                <tr>
                  <Th>Tax year</Th>
                  <Th>Gifts</Th>
                  <Th align="right">Total</Th>
                  <Th align="right">Statement</Th>
                </tr>
              </thead>
              <tbody>
                {STATEMENTS.map((statement) => (
                  <tr className="transition hover:bg-paper-100" key={statement.id}>
                    <Td numeric>
                      <span className="font-semibold text-ink-900">
                        {statement.year}
                      </span>
                    </Td>
                    <Td numeric>{statement.gifts}</Td>
                    <Td align="right" numeric>
                      <span className="font-semibold text-ink-900">
                        {formatMoney(statement.total)}
                      </span>
                    </Td>
                    <Td align="right">
                      <Btn size="sm" variant="secondary">
                        Download PDF
                      </Btn>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>

        {/* ------------------------------------------------------------ Rail */}
        <aside className="space-y-6">
          <Card>
            <CardHeader
              description="This year, by ministry."
              title="Where it went"
            />
            <CardBody className="space-y-5">
              {byMinistry.map(([slug, amount]) => {
                const ministry = getMinistry(slug);
                const pct = Math.round((amount / total) * 100);

                return (
                  <div key={slug}>
                    <Meter
                      label={ministry.name}
                      tone="ink"
                      value={pct}
                      valueLabel={formatMoney(amount)}
                    />
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Open commitments" />
            <CardBody className="space-y-5">
              {PLEDGES.map((pledge) => {
                const ministry = getMinistry(pledge.ministrySlug);
                const pct = Math.round((pledge.committed / pledge.amount) * 100);

                return (
                  <div key={pledge.ministrySlug}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-ink-900">
                        {ministry.name}
                      </p>
                      <Badge tone="brass">{pct}%</Badge>
                    </div>
                    <p className="save-numeric mt-1 text-caption text-ink-400">
                      {formatMoney(pledge.amount - pledge.committed)} remaining ·
                      through {formatDate(pledge.through)}
                    </p>
                    <div className="mt-2.5">
                      <Meter tone="brass" value={pct} />
                    </div>
                  </div>
                );
              })}
            </CardBody>
            <CardFooter>
              <span className="text-caption text-ink-400">
                Schedule the balance
              </span>
              <Btn size="sm" variant="secondary">
                Set a schedule
              </Btn>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader title="Giving methods" />
            <CardBody>
              <DataList>
                <DataRow label="Donor-advised fund" value="Fidelity Charitable" />
                <DataRow label="Wire" value="On file" />
                <DataRow label="Appreciated stock" value="On file" />
                <DataRow label="Default designation" value="Unrestricted" />
              </DataList>
              <Btn className="mt-5 w-full" size="sm" variant="secondary">
                Manage giving methods
              </Btn>
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">
              Planning a larger gift?
            </p>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">
              Hannah can model a multi-year commitment against a ministry&apos;s
              capacity so the gift lands well rather than merely arriving.
            </p>
            <Btn className="mt-4 w-full" size="sm" variant="secondary">
              Talk to Hannah
            </Btn>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
