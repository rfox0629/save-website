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
  Stat,
  StatRow,
  Textarea,
} from "@/components/save/primitives";
import { TestimonyCard } from "@/components/save/patterns";
import { MINISTRY_ACCOUNT_CHIP, ministryNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { MINISTRIES, getMinistry } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Testimonies" };

export default function TestimoniesPage() {
  const ministry = getMinistry("rio-hope-church-network");
  // Borrow a couple of extra examples so the queue reads realistically.
  const pending = MINISTRIES[0].testimonies;

  return (
    <AppShell
      account={MINISTRY_ACCOUNT_CHIP}
      groups={ministryNav("testimonies")}
      persona="ministry"
      topBar={
        <TopBar
          actions={<Btn size="sm">Add a testimony</Btn>}
          breadcrumb={[
            { href: "/preview/ministry", label: "Overview" },
            { label: "Testimonies" },
          ]}
        />
      }
    >
      <PageTitle
        description="A testimony is one person saying what changed. It does the work that no statistic can do."
        eyebrow="Your public profile"
      >
        Testimonies
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat caption="Live on your profile" label="Published" value={ministry.testimonies.length} />
          <Stat caption="Awaiting reviewer" label="In review" value={pending.length} />
          <Stat caption="Consent recorded" label="With permission" value="3" />
          <Stat caption="Recommended minimum" label="Target" value="3" />
        </StatRow>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              action={<Badge tone="sage">Live</Badge>}
              description="Visible on your public profile and to every donor who follows you."
              title="Published"
            />
            <CardBody className="grid gap-5 md:grid-cols-2">
              {ministry.testimonies.map((testimony) => (
                <div key={testimony.id}>
                  <TestimonyCard testimony={testimony} />
                  <div className="mt-2.5 flex gap-2">
                    <Btn size="sm" variant="secondary">
                      Edit
                    </Btn>
                    <Btn size="sm" variant="ghost">
                      Unpublish
                    </Btn>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              action={<Badge tone="brass">In review</Badge>}
              description="Your reviewer checks attribution and consent, never content."
              title="Submitted"
            />
            <CardBody className="grid gap-5 md:grid-cols-2">
              {pending.map((testimony) => (
                <TestimonyCard key={testimony.id} testimony={testimony} />
              ))}
            </CardBody>
            <CardFooter>
              <span className="text-caption text-ink-400">
                Submitted 2 days ago · typical review is 1 business day
              </span>
            </CardFooter>
          </Card>
        </div>

        {/* ------------------------------------------------------- Composer */}
        <aside className="space-y-6">
          <Card>
            <CardHeader title="Add a testimony" />
            <CardBody className="space-y-5">
              <Field
                help="Their words, lightly edited for length only. Do not polish it."
                label="What they said"
                required
              >
                <Textarea
                  placeholder="They handed us the keys and then stayed close enough to help but far enough away to let us lead."
                  rows={5}
                />
              </Field>

              <Field label="Name" required>
                <Input placeholder="Pastor Ruth Alvarez" />
              </Field>

              <Field
                help="How they are connected to your ministry."
                label="Role"
                required
              >
                <Input placeholder="Lead Pastor, Cornerstone Wichita" />
              </Field>

              <Field
                help="Required before we can publish. A forwarded email is fine."
                label="Consent record"
                required
              >
                <Btn className="w-full" size="sm" variant="secondary">
                  Attach consent
                </Btn>
              </Field>
            </CardBody>
            <CardFooter>
              <Btn size="sm" variant="ghost">
                Save draft
              </Btn>
              <Btn size="sm">Submit for review</Btn>
            </CardFooter>
          </Card>

          <Callout title="A note on consent" tone="clay">
            We will not publish a testimony without a record that the person
            agreed to it being public and attributed. If someone would prefer to
            be anonymous, that is fine — we publish the role without the name.
          </Callout>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">
              What makes a good one
            </p>
            <ul className="mt-3 space-y-2.5 text-caption leading-relaxed text-ink-500">
              <li>One specific thing that changed, not a general endorsement.</li>
              <li>Their voice, not your marketing voice.</li>
              <li>A name and a role, so a donor knows who is speaking.</li>
              <li>Recent. Anything older than three years reads as archive.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
