import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Input,
  Monogram,
  PageTitle,
  Stat,
  StatRow,
  Table,
  Td,
  Th,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import { STAFF_ACCOUNT, staffNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { REVIEWERS } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Donors" };

const DONORS = [
  { advisor: "Hannah Bradley", following: 4, givenYtd: 285_000, joined: "2017-04-12", name: "Margaret Ellison", status: "active" },
  { advisor: "Tom Reyes", following: 7, givenYtd: 640_000, joined: "2015-09-30", name: "The Callahan Foundation", status: "active" },
  { advisor: "Hannah Bradley", following: 2, givenYtd: 95_000, joined: "2022-01-18", name: "David & Ruth Kimani", status: "active" },
  { advisor: "Dana Kim", following: 11, givenYtd: 1_240_000, joined: "2013-06-05", name: "Northbridge Family Office", status: "active" },
  { advisor: null, following: 0, givenYtd: 0, joined: "2026-07-28", name: "Peter Vance", status: "pending" },
  { advisor: null, following: 0, givenYtd: 0, joined: "2026-07-30", name: "Grace Lindqvist", status: "pending" },
];

/**
 * Donor visibility for staff. Deliberately thin: SAVE tracks the relationship
 * and the access grant, not a donor's giving behaviour across the sector.
 */
export default function StaffDonorsPage() {
  const pending = DONORS.filter((donor) => donor.status === "pending");
  const active = DONORS.filter((donor) => donor.status === "active");
  const totalYtd = DONORS.reduce((sum, donor) => sum + donor.givenYtd, 0);

  return (
    <AppShell
      account={STAFF_ACCOUNT}
      groups={staffNav("donors")}
      persona="staff"
      topBar={
        <TopBar
          actions={<Btn size="sm">Review access requests</Btn>}
          breadcrumb={[
            { href: "/preview/staff", label: "Queue" },
            { label: "Donors" },
          ]}
          status={
            pending.length > 0 ? (
              <Badge tone="clay">{pending.length} awaiting access</Badge>
            ) : null
          }
        />
      }
    >
      <PageTitle
        description="Donor access is granted personally by a SAVE advisor. It is never self-service and never purchased."
        eyebrow="Portfolio"
      >
        Donors
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat caption="With full access" label="Active donors" value={active.length} />
          <Stat caption="Awaiting a decision" label="Access requests" value={pending.length} />
          <Stat caption="Through SAVE, this year" label="Given" value={formatMoney(totalYtd)} />
          <Stat caption="Per active donor" label="Ministries followed" value="6" />
        </StatRow>
      </div>

      {pending.length > 0 ? (
        <Card className="mt-6">
          <CardHeader
            action={<Badge tone="clay">{pending.length} pending</Badge>}
            description="Each request is reviewed by a person. We decline more than we accept."
            title="Access requests"
          />
          <div className="divide-y divide-hairline">
            {pending.map((donor) => (
              <div
                className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
                key={donor.name}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Monogram name={donor.name} size="md" tone="brass" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">
                      {donor.name}
                    </p>
                    <p className="save-numeric text-caption text-ink-400">
                      Requested {formatDate(donor.joined)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <Btn size="sm" variant="secondary">
                    Decline
                  </Btn>
                  <Btn size="sm">Grant access</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="mt-6">
        <CardHeader
          action={
            <Input
              aria-label="Search donors"
              className="h-9 w-56"
              placeholder="Search donors"
            />
          }
          title="Active donors"
        />
        <Table>
          <thead>
            <tr>
              <Th>Donor</Th>
              <Th>Advisor</Th>
              <Th>Donor since</Th>
              <Th align="right">Following</Th>
              <Th align="right">Given in 2026</Th>
              <Th align="right" />
            </tr>
          </thead>
          <tbody>
            {[...active]
              .sort((a, b) => b.givenYtd - a.givenYtd)
              .map((donor) => (
                <tr className="transition hover:bg-paper-100" key={donor.name}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Monogram name={donor.name} size="sm" tone="brass" />
                      <span className="font-medium text-ink-900">
                        {donor.name}
                      </span>
                    </div>
                  </Td>
                  <Td>{donor.advisor}</Td>
                  <Td numeric>{formatDate(donor.joined)}</Td>
                  <Td align="right" numeric>
                    {donor.following}
                  </Td>
                  <Td align="right" numeric>
                    <span className="font-semibold text-ink-900">
                      {formatMoney(donor.givenYtd)}
                    </span>
                  </Td>
                  <Td align="right">
                    <Btn size="sm" variant="secondary">
                      Open
                    </Btn>
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Callout title="What SAVE does not do" tone="ink">
          We do not sell donor lists, we do not let ministries browse donors,
          and we do not rank donors by capacity. A ministry learns a donor&apos;s
          name when that donor chooses to introduce themselves.
        </Callout>

        <Card>
          <CardHeader title="Advisor load" />
          <CardBody className="space-y-4">
            {REVIEWERS.slice(0, 3).map((reviewer) => {
              const count = active.filter(
                (donor) => donor.advisor === reviewer.name,
              ).length;

              return (
                <div
                  className="flex items-center justify-between gap-3"
                  key={reviewer.id}
                >
                  <span className="text-sm text-ink-600">{reviewer.name}</span>
                  <span className="save-numeric text-sm font-semibold text-ink-900">
                    {count} donors
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
