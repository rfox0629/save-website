import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Field,
  Input,
  Monogram,
  PageTitle,
  SectionTitle,
  Select,
  Textarea,
  TrustSeal,
} from "@/components/save/primitives";
import { ImpactGrid } from "@/components/save/patterns";
import { MINISTRY_ACCOUNT_CHIP, ministryNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { getMinistry } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Profile" };

/**
 * Profile editing is split deliberately: the ministry controls its story, and
 * SAVE controls the assessment. The screen makes that boundary visible so a
 * ministry never wonders why it cannot edit its own score.
 */
export default function MinistryProfilePage() {
  const ministry = getMinistry("rio-hope-church-network");

  return (
    <AppShell
      account={MINISTRY_ACCOUNT_CHIP}
      groups={ministryNav("profile")}
      persona="ministry"
      topBar={
        <TopBar
          actions={
            <>
              <Btn
                href={`/preview/ministry-profile/${ministry.slug}`}
                size="sm"
                variant="secondary"
              >
                Preview public page
              </Btn>
              <Btn size="sm">Save changes</Btn>
            </>
          }
          breadcrumb={[
            { href: "/preview/ministry", label: "Overview" },
            { label: "Profile" },
          ]}
          status={<Badge tone="brass">Unpublished changes</Badge>}
        />
      }
    >
      <PageTitle
        description="This is what donors read before they read your assessment. Write it like you would tell a friend, not a foundation."
        eyebrow="Your public profile"
      >
        Profile
      </PageTitle>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* --------------------------------------------------- Identity -- */}
          <Card>
            <CardHeader
              description="Name and legal details are locked to your assessment record."
              title="Identity"
            />
            <CardBody className="space-y-5">
              <div className="flex items-center gap-5">
                <Monogram name={ministry.name} size="xl" />
                <div>
                  <Btn size="sm" variant="secondary">
                    Upload logo
                  </Btn>
                  <p className="mt-2 text-caption text-ink-400">
                    Square, at least 400×400. We use a monogram until you add one.
                  </p>
                </div>
              </div>

              <Divider />

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  help="Locked. Contact your reviewer to change your legal name."
                  label="Ministry name"
                >
                  <Input defaultValue={ministry.name} disabled />
                </Field>
                <Field label="EIN">
                  <Input defaultValue={ministry.ein} disabled />
                </Field>
                <Field label="Primary location" required>
                  <Input defaultValue={ministry.location} />
                </Field>
                <Field label="Cause area" required>
                  <Select defaultValue={ministry.category}>
                    <option>Church Planting</option>
                    <option>Relief &amp; Development</option>
                    <option>Theological Education</option>
                    <option>Bible Translation</option>
                    <option>Urban Ministry</option>
                  </Select>
                </Field>
              </div>
            </CardBody>
          </Card>

          {/* ------------------------------------------------------ Story -- */}
          <Card>
            <CardHeader
              description="Two fields do most of the work on your public page."
              title="Your story"
            />
            <CardBody className="space-y-5">
              <Field
                help="One sentence. It sits directly under your name."
                hint={`${ministry.tagline.length}/90`}
                label="Tagline"
                required
              >
                <Input defaultValue={ministry.tagline} maxLength={90} />
              </Field>

              <Field
                help="Three or four sentences. What you do, who for, and what makes your approach different."
                hint={`${ministry.story.length}/600`}
                label="About your ministry"
                required
              >
                <Textarea defaultValue={ministry.story} rows={6} />
              </Field>

              <Callout tone="ink" title="Write about the work, not the need">
                The strongest profiles describe what a ministry actually does
                and how it knows the work is landing. Donors reading SAVE have
                already decided to give; they are deciding to whom.
              </Callout>
            </CardBody>
          </Card>

          {/* ----------------------------------------------------- Impact -- */}
          <Card>
            <CardHeader
              action={
                <Btn size="sm" variant="secondary">
                  Add a metric
                </Btn>
              }
              description="Four figures maximum. Each must be traceable to evidence you supplied."
              title="Impact figures"
            />
            <CardBody>
              <ImpactGrid metrics={ministry.impact} />
              <div className="mt-5 space-y-4">
                {ministry.impact.slice(0, 2).map((metric) => (
                  <div className="grid gap-3 md:grid-cols-3" key={metric.label}>
                    <Field label="Figure">
                      <Input defaultValue={metric.value} />
                    </Field>
                    <Field label="Label">
                      <Input defaultValue={metric.label} />
                    </Field>
                    <Field label="Period">
                      <Input defaultValue={metric.period} />
                    </Field>
                  </div>
                ))}
              </div>
            </CardBody>
            <CardFooter>
              <span className="text-caption text-ink-400">
                Your reviewer checks each figure before publication.
              </span>
              <Btn size="sm">Save impact figures</Btn>
            </CardFooter>
          </Card>

          {/* ------------------------------------------------- Leadership -- */}
          <Card>
            <CardHeader
              description="Donors want to know who is carrying this."
              title="Leadership"
            />
            <CardBody className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Name" required>
                  <Input defaultValue={ministry.leader.name} />
                </Field>
                <Field label="Title" required>
                  <Input defaultValue={ministry.leader.title} />
                </Field>
              </div>
              <Field
                help="Two sentences. Include how they are held accountable."
                label="Biography"
                required
              >
                <Textarea defaultValue={ministry.leader.bio} rows={4} />
              </Field>
            </CardBody>
          </Card>
        </div>

        {/* ------------------------------------------------------------ Rail */}
        <aside className="space-y-6">
          <Card>
            <CardHeader title="What SAVE controls" />
            <CardBody className="space-y-4">
              <TrustSeal size="md" tier={ministry.tier} year={2026} />
              <p className="text-sm leading-relaxed text-ink-600">
                Your score, tier, category findings and assessment date are set
                by your reviewer and cannot be edited here. That is the point —
                donors trust the assessment because you do not write it.
              </p>
              <Divider />
              <p className="text-caption font-semibold text-ink-900">
                You control
              </p>
              <ul className="space-y-2 text-caption text-ink-500">
                {["Your story and tagline", "Impact figures", "Leadership bios", "Testimonies", "Prayer requests", "Donor updates"].map((item) => (
                  <li className="flex items-center gap-2" key={item}>
                    <span className="h-1 w-1 rounded-full bg-sage-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Publication" />
            <CardBody>
              <p className="text-sm leading-relaxed text-ink-600">
                Profile changes go to your reviewer before they appear publicly.
                Typical turnaround is one business day.
              </p>
              <Btn className="mt-5 w-full" size="sm">
                Submit for publication
              </Btn>
              <Btn className="mt-2.5 w-full" size="sm" variant="secondary">
                Save as draft
              </Btn>
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <SectionTitle>Profile completeness</SectionTitle>
            <p className="text-caption leading-relaxed text-ink-500">
              You are missing prayer requests and have only one testimony.
              Profiles with three or more testimonies are followed at roughly
              twice the rate.
            </p>
            <Btn
              className="mt-4 w-full"
              href="/preview/ministry/testimonies"
              size="sm"
              variant="secondary"
            >
              Add testimonies
            </Btn>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
