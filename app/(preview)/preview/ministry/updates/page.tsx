import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Field,
  Input,
  PageTitle,
  Select,
  Stat,
  StatRow,
  Table,
  Td,
  Textarea,
  Th,
  formatDate,
} from "@/components/save/primitives";
import { MINISTRY_ACCOUNT_CHIP, ministryNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { DONOR_UPDATE_DRAFTS } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Donor updates" };

export default function DonorUpdatesPage() {
  const published = DONOR_UPDATE_DRAFTS.filter(
    (item) => item.status === "published",
  );

  return (
    <AppShell
      account={MINISTRY_ACCOUNT_CHIP}
      groups={ministryNav("updates")}
      persona="ministry"
      topBar={
        <TopBar
          actions={<Btn size="sm">Write an update</Btn>}
          breadcrumb={[
            { href: "/preview/ministry", label: "Overview" },
            { label: "Donor updates" },
          ]}
          status={<Badge tone="neutral">1 of 2 this month</Badge>}
        />
      }
    >
      <PageTitle
        description="Updates go to every donor who follows you. Two a month, maximum — we would rather they read all of them."
        eyebrow="Your public profile"
      >
        Donor updates
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat caption="All time" label="Published" value={published.length} />
          <Stat caption="Currently following you" label="Reach" value="214" />
          <Stat caption="Trailing 6 updates" label="Open rate" value="78%" />
          <Stat caption="Resets 1 August" label="Remaining this month" value="1" />
        </StatRow>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              action={
                <Select aria-label="Filter" className="h-9 w-auto">
                  <option>All updates</option>
                  <option>Published</option>
                  <option>Drafts</option>
                </Select>
              }
              title="Your updates"
            />
            <Table>
              <thead>
                <tr>
                  <Th>Title</Th>
                  <Th>Audience</Th>
                  <Th>Sent</Th>
                  <Th align="right">Reach</Th>
                  <Th align="right">Status</Th>
                </tr>
              </thead>
              <tbody>
                {DONOR_UPDATE_DRAFTS.map((update) => (
                  <tr className="transition hover:bg-paper-100" key={update.id}>
                    <Td>
                      <span className="font-medium text-ink-900">
                        {update.title}
                      </span>
                    </Td>
                    <Td>{update.audience}</Td>
                    <Td numeric>
                      {update.sent ? formatDate(update.sent) : "—"}
                    </Td>
                    <Td align="right" numeric>
                      {update.reach || "—"}
                    </Td>
                    <Td align="right">
                      {update.status === "published" ? (
                        <Badge tone="sage">Published</Badge>
                      ) : (
                        <Badge tone="neutral">Draft</Badge>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <CardFooter>
              <span className="text-caption text-ink-400">
                Published updates appear on your public profile.
              </span>
              <Btn size="sm" variant="secondary">
                Export list
              </Btn>
            </CardFooter>
          </Card>

          <Callout title="What donors actually want" tone="ink">
            The updates with the highest engagement are the ones that name a
            specific person or place and say what happened. Fundraising appeals
            have the lowest. SAVE donors have already decided to give.
          </Callout>
        </div>

        {/* -------------------------------------------------------- Composer */}
        <aside>
          <Card className="lg:sticky lg:top-24">
            <CardHeader
              description="Drafts save automatically."
              title="Write an update"
            />
            <CardBody className="space-y-5">
              <Field label="Kind" required>
                <Select defaultValue="Milestone">
                  <option>Milestone</option>
                  <option>From the field</option>
                  <option>Financial</option>
                  <option>Answered prayer</option>
                </Select>
              </Field>

              <Field label="Audience" required>
                <Select>
                  <option>All followers (214)</option>
                  <option>Major partners (12)</option>
                  <option>Donors who gave this year (38)</option>
                </Select>
              </Field>

              <Field hint="0/80" label="Title" required>
                <Input placeholder="2021 cohort fully self-supporting" />
              </Field>

              <Field
                help="Three or four sentences. Name a place or a person."
                hint="0/500"
                label="Update"
                required
              >
                <Textarea
                  placeholder="Our 2021 cohort of five congregations all reached full financial self-support this year..."
                  rows={7}
                />
              </Field>

              <Field help="Optional. One image, at least 1200px wide." label="Photograph">
                <Btn className="w-full" size="sm" variant="secondary">
                  Attach a photograph
                </Btn>
              </Field>
            </CardBody>
            <CardFooter>
              <Btn size="sm" variant="ghost">
                Preview
              </Btn>
              <Btn size="sm">Publish to 214 donors</Btn>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
