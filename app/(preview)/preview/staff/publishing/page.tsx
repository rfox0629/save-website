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
  Divider,
  Field,
  Monogram,
  PageTitle,
  Stat,
  StatRow,
  Steps,
  Textarea,
  TrustSeal,
  formatDate,
} from "@/components/save/primitives";
import { AssessmentProvenance, ImpactGrid } from "@/components/save/patterns";
import { STAFF_ACCOUNT, staffNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { getMinistry } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Publishing" };

const PUBLISH_QUEUE = [
  { decided: "2026-07-24", id: "APP-2026-0142", ministry: "Bright Path Foster Care", stage: "Ready to publish", tier: "High Confidence Opportunity" },
  { decided: "2026-07-26", id: "APP-2026-0144", ministry: "Sierra Leone Medical Mission", stage: "Awaiting ministry sign-off", tier: "Strong Opportunity" },
];

/**
 * Publishing is the moment SAVE puts its name behind a ministry. The workflow
 * is deliberately gated: nothing reaches donors without a second reviewer and
 * the ministry's own sign-off on its public profile.
 */
export default function PublishingPage() {
  const ministry = getMinistry("new-city-fellowship");

  return (
    <AppShell
      account={STAFF_ACCOUNT}
      groups={staffNav("publishing")}
      persona="staff"
      topBar={
        <TopBar
          actions={
            <>
              <Btn size="sm" variant="secondary">
                Preview as donor
              </Btn>
              <Btn size="sm">Publish to donors</Btn>
            </>
          }
          breadcrumb={[
            { href: "/preview/staff", label: "Queue" },
            { label: "Publishing" },
          ]}
          status={<Badge tone="brass">2 awaiting publication</Badge>}
        />
      }
    >
      <PageTitle
        description="Publishing puts the SAVE name behind a ministry. Two reviewers and the ministry itself must sign off before donors see anything."
        eyebrow="Operations"
      >
        Publishing
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat caption="Awaiting publication" label="In queue" value={PUBLISH_QUEUE.length} />
          <Stat caption="This quarter" label="Published" value="11" />
          <Stat caption="From decision to live" label="Median days" value="4" />
          <Stat caption="Due for reassessment" label="Expiring in 90 days" value="3" />
        </StatRow>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <div className="min-w-0 space-y-6">
          {/* --------------------------------------------------- Publish gate */}
          <Card>
            <CardHeader
              action={<TrustSeal size="md" tier={ministry.tier} year={2026} />}
              description="Approved 24 July. Every gate must be green before the publish action unlocks."
              title={ministry.name}
            />
            <CardBody>
              <Steps
                steps={[
                  { label: "Decision recorded", meta: "Hannah Bradley", state: "done" },
                  { label: "Second reviewer", meta: "Tom Reyes", state: "done" },
                  { label: "Ministry sign-off", meta: "Received 28 Jul", state: "done" },
                  { label: "Donor brief", meta: "Ready", state: "current" },
                  { label: "Live to donors", state: "todo" },
                ]}
              />
            </CardBody>

            <CardBody className="border-t border-hairline">
              <p className="save-eyebrow mb-4 text-brass-700">
                Publication checklist
              </p>
              <div className="space-y-3">
                {[
                  { done: true, label: "All required evidence accepted" },
                  { done: true, label: "External checks re-run within 30 days" },
                  { done: true, label: "Score overrides carry written reasons" },
                  { done: true, label: "Ministry has approved its public profile" },
                  { done: true, label: "Impact figures traced to evidence" },
                  { done: false, label: "Donor brief summary proofread" },
                ].map((check) => (
                  <div className="flex items-center gap-3" key={check.label}>
                    <span
                      className={
                        check.done
                          ? "flex h-4 w-4 items-center justify-center rounded-sm bg-sage-600 text-paper-50"
                          : "h-4 w-4 rounded-sm border border-hairline-strong bg-surface"
                      }
                    >
                      {check.done ? (
                        <svg
                          aria-hidden="true"
                          className="h-2.5 w-2.5"
                          fill="none"
                          viewBox="0 0 12 12"
                        >
                          <path
                            d="m2.5 6.2 2.4 2.4L9.5 3.8"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                        </svg>
                      ) : null}
                    </span>
                    <span
                      className={
                        check.done
                          ? "text-sm text-ink-600"
                          : "text-sm font-medium text-ink-900"
                      }
                    >
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>

            <CardFooter>
              <span className="text-caption text-ink-400">
                One item outstanding
              </span>
              <div className="flex gap-2.5">
                <Btn size="sm" variant="secondary">
                  Send back to review
                </Btn>
                <Btn disabled size="sm">
                  Publish to donors
                </Btn>
              </div>
            </CardFooter>
          </Card>

          {/* ------------------------------------------------- Brief composer */}
          <Card>
            <CardHeader
              action={
                <Btn size="sm" variant="secondary">
                  Regenerate draft
                </Btn>
              }
              description="What donors read first. Written by the reviewer, never by the ministry."
              title="Donor brief"
            />
            <CardBody className="space-y-5">
              <Field
                help="Two sentences. This appears on the ministry card in the library."
                hint="128/180"
                label="Summary line"
                required
              >
                <Textarea defaultValue={ministry.summary} rows={2} />
              </Field>

              <Field
                help="Four to six sentences. What a donor needs to know before a first conversation."
                label="Executive summary"
                required
              >
                <Textarea
                  defaultValue="New City Fellowship Network plants churches in mid-size American cities and hands each one to local leadership within four years. Four consecutive audits have closed without management letter comments, and the board is majority-independent. Ninety-one percent of plants reaching year five are still active — a figure the network has published consistently since 2016. The open question is discipleship depth, which remains self-reported across plants."
                  rows={6}
                />
              </Field>

              <Divider />

              <div>
                <p className="save-eyebrow mb-3 text-brass-700">
                  Included in the published brief
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Category scores and confidence",
                    "Impact figures",
                    "Leadership assessment",
                    "Financial summary",
                    "Testimonies",
                    "Voice alignment summary",
                  ].map((item) => (
                    <div
                      className="flex items-center gap-2.5 rounded-md border border-hairline px-3.5 py-2.5"
                      key={item}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-sage-500" />
                      <span className="text-caption text-ink-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Callout tone="clay" title="Never published">
                Reviewer notes, internal flags, score overrides and the raw
                assessment responses stay internal. Donors see conclusions and
                evidence, never the working.
              </Callout>
            </CardBody>
          </Card>

          {/* ----------------------------------------------------- Live preview */}
          <Card>
            <CardHeader
              description="Exactly what a donor will see on the public profile."
              title="Preview"
            />
            <CardBody className="space-y-5">
              <div className="flex items-center gap-4">
                <Monogram name={ministry.name} size="lg" />
                <div>
                  <p className="save-display text-title font-semibold text-ink-900">
                    {ministry.name}
                  </p>
                  <p className="text-caption text-ink-400">
                    {ministry.category} · {ministry.location}
                  </p>
                </div>
              </div>
              <ImpactGrid metrics={ministry.impact} />
            </CardBody>
          </Card>
        </div>

        {/* ------------------------------------------------------------ Rail */}
        <aside className="space-y-6">
          <Card>
            <CardHeader title="Publishing queue" />
            <div className="divide-y divide-hairline">
              {PUBLISH_QUEUE.map((item) => (
                <div className="px-6 py-4" key={item.id}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-900">
                      {item.ministry}
                    </p>
                    <Badge
                      tone={item.stage === "Ready to publish" ? "sage" : "clay"}
                    >
                      {item.stage === "Ready to publish" ? "Ready" : "Waiting"}
                    </Badge>
                  </div>
                  <p className="save-numeric mt-1 text-caption text-ink-400">
                    {item.id} · decided {formatDate(item.decided)}
                  </p>
                  <p className="mt-1.5 text-caption text-ink-500">{item.tier}</p>
                </div>
              ))}
            </div>
          </Card>

          <AssessmentProvenance
            assessedOn={ministry.assessedOn}
            reassessmentDue={ministry.reassessmentDue}
            reviewer="Hannah Bradley"
          />

          <Card>
            <CardHeader title="Donor visibility" />
            <CardBody>
              <DataList>
                <DataRow label="Donors with access" value="164" />
                <DataRow label="Will be notified" value="164" />
                <DataRow label="Following this cause" value="52" />
                <DataRow label="Public library listing" value="Yes" />
              </DataList>
              <p className="mt-4 text-caption leading-relaxed text-ink-400">
                Publishing sends one notification. Donors following the cause
                area see it in their feed; nobody is emailed twice.
              </p>
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">Unpublishing</p>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">
              A published assessment can be withdrawn at any time. Donors who
              follow the ministry are told why, in plain language, within 24
              hours.
            </p>
            <Btn className="mt-4 w-full" size="sm" variant="danger">
              Withdraw a published assessment
            </Btn>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
