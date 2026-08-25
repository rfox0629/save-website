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
  Meter,
  PageTitle,
  Select,
  Textarea,
} from "@/components/save/primitives";
import { MINISTRY_ACCOUNT_CHIP, ministryNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import {
  ASSESSMENT_SECTIONS,
  CATEGORY_LABELS,
  MINISTRY_ACCOUNT,
} from "@/lib/preview/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "The standard" };

/**
 * The assessment is presented as a section-at-a-time worksheet with a
 * persistent section rail, replacing the current 1,493-line single-page form.
 * Progress is visible, saving is continuous, and reviewer notes appear inline
 * against the question they concern.
 */
export default function AssessmentPage() {
  const answered = ASSESSMENT_SECTIONS.reduce((n, s) => n + s.answered, 0);
  const total = ASSESSMENT_SECTIONS.reduce((n, s) => n + s.total, 0);

  return (
    <AppShell
      account={MINISTRY_ACCOUNT_CHIP}
      groups={ministryNav("assessment")}
      persona="ministry"
      topBar={
        <TopBar
          actions={
            <>
              <span className="save-numeric text-caption text-ink-400">
                Saved just now
              </span>
              <Btn size="sm" variant="secondary">
                Save &amp; exit
              </Btn>
              <Btn size="sm">Next section</Btn>
            </>
          }
          breadcrumb={[
            { href: "/preview/ministry", label: "Overview" },
            { href: "/preview/ministry/assessment", label: "The standard" },
            { label: "Financial Integrity" },
          ]}
        />
      }
    >
      <PageTitle
        description="Answer in any order. Every response saves as you type, and you can hand a section to a colleague."
        eyebrow={MINISTRY_ACCOUNT.applicationId}
      >
        The SAVE Standard
      </PageTitle>

      <div className="mt-8 grid gap-6 lg:grid-cols-[268px_minmax(0,1fr)]">
        {/* --------------------------------------------------- Section rail */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardBody className="space-y-1" flush>
              <div className="px-5 pb-4 pt-5">
                <Meter
                  label="Overall"
                  tone="ink"
                  value={(answered / total) * 100}
                  valueLabel={`${answered}/${total}`}
                />
              </div>
              <Divider />
              <nav className="p-2">
                {ASSESSMENT_SECTIONS.map((section) => {
                  const active = section.key === "financial";

                  return (
                    <button
                      className={cn(
                        "save-focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition",
                        active
                          ? "bg-ink-100"
                          : "hover:bg-paper-200",
                      )}
                      key={section.key}
                      type="button"
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-micro font-semibold",
                          section.status === "complete" &&
                            "border-sage-600 bg-sage-600 text-paper-50",
                          section.status === "returned" &&
                            "border-clay-600 bg-clay-50 text-clay-700",
                          section.status === "in-progress" &&
                            "border-ink-600 bg-surface text-ink-700",
                          section.status === "not-started" &&
                            "border-hairline-strong bg-surface text-ink-300",
                        )}
                      >
                        {section.status === "complete" ? "✓" : ""}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-caption font-semibold",
                            active ? "text-ink-900" : "text-ink-600",
                          )}
                        >
                          {CATEGORY_LABELS[section.key]}
                        </span>
                        <span className="save-numeric block text-micro text-ink-400">
                          {section.answered}/{section.total}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </CardBody>
          </Card>

          <Card className="mt-5 p-5" tone="sunken">
            <p className="text-caption font-semibold text-ink-900">
              Stuck on a question?
            </p>
            <p className="mt-1.5 text-caption leading-relaxed text-ink-500">
              Leave it blank and add a note. Reviewers would rather have an
              honest gap than a guess.
            </p>
          </Card>
        </aside>

        {/* -------------------------------------------------------- Section */}
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              action={<Badge tone="ink">12 of 19 answered</Badge>}
              description="How money is handled, who approves it, and what happens when someone disagrees."
              title="Financial Integrity"
            />

            <CardBody className="space-y-8">
              <Callout tone="ink" title="Why we ask this">
                Financial questions are not about how much you raise. They are
                about whether one person could move money without anyone
                noticing. Small ministries score well here all the time.
              </Callout>

              {/* Question 1 */}
              <div>
                <Field
                  help="If you have never been audited, choose 'No audit' — it is not a disqualifier."
                  hint="Question 8 of 19"
                  label="What level of external financial review do you undergo?"
                  required
                >
                  <Select defaultValue="Full audit">
                    <option>Full audit by an independent CPA firm</option>
                    <option>Financial review (not a full audit)</option>
                    <option>Compilation only</option>
                    <option>No external review</option>
                  </Select>
                </Field>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <Badge tone="sage">Evidence attached</Badge>
                  <span className="text-caption text-ink-400">
                    FY2025 audited financial statements
                  </span>
                </div>
              </div>

              <Divider />

              {/* Question 2 */}
              <div>
                <Field
                  help="Enter the number of months of total operating expense your unrestricted reserves would cover."
                  hint="Question 9 of 19"
                  label="How many months of operating reserve do you hold?"
                  required
                >
                  <Input defaultValue="12" inputMode="numeric" />
                </Field>
              </div>

              <Divider />

              {/* Question 3 — with reviewer note */}
              <div>
                <Field
                  hint="Question 10 of 19"
                  label="Who approves the executive director's compensation?"
                  required
                >
                  <Select defaultValue="The board">
                    <option>The full board, in a recorded minute</option>
                    <option>A board compensation committee</option>
                    <option>The board chair alone</option>
                    <option>The executive director</option>
                  </Select>
                </Field>
                <Callout className="mt-3.5" tone="clay" title="Hannah asked about this">
                  You answered that the full board approves it, which is what we
                  want to see — but the minute you attached is from 2023. Could
                  you attach the most recent one?
                  <div className="mt-3">
                    <Btn href="/preview/ministry/evidence" size="sm" variant="secondary">
                      Attach the minute
                    </Btn>
                  </div>
                </Callout>
              </div>

              <Divider />

              {/* Question 4 */}
              <div>
                <Field
                  help="Describe your practice in a few sentences. There is no right answer length."
                  hint="Question 11 of 19"
                  label="How do you handle designated gifts that exceed the need?"
                  required
                >
                  <Textarea
                    defaultValue="When a designated fund is oversubscribed we contact each donor individually and offer three options: redirect to a related need, hold for the next cycle, or return the gift. We do not redirect without written consent."
                    rows={5}
                  />
                </Field>
              </div>
            </CardBody>

            <CardFooter>
              <Btn size="sm" variant="quiet">
                ← Governance
              </Btn>
              <div className="flex items-center gap-2.5">
                <span className="save-numeric text-caption text-ink-400">
                  Saved just now
                </span>
                <Btn size="sm">Continue to Leadership →</Btn>
              </div>
            </CardFooter>
          </Card>

          <Card className="p-6" tone="flat">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  Hand this section to someone else
                </p>
                <p className="mt-1 text-caption text-ink-500">
                  Your finance director can complete Financial Integrity without
                  seeing the rest of the application.
                </p>
              </div>
              <Btn size="sm" variant="secondary">
                Invite a colleague
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
