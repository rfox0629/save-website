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
  Monogram,
  PageTitle,
  Stat,
  StatRow,
  Steps,
  formatDate,
} from "@/components/save/primitives";
import { EvidenceRow, FindingRow } from "@/components/save/patterns";
import { MINISTRY_ACCOUNT_CHIP, ministryNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import {
  ASSESSMENT_SECTIONS,
  CATEGORY_LABELS,
  EVIDENCE,
  FINDINGS,
  MINISTRY_ACCOUNT,
  ROADMAP,
} from "@/lib/preview/data";

export const metadata: Metadata = { title: "Overview" };

export default function MinistryOverviewPage() {
  const answered = ASSESSMENT_SECTIONS.reduce((n, s) => n + s.answered, 0);
  const totalQuestions = ASSESSMENT_SECTIONS.reduce((n, s) => n + s.total, 0);
  const pct = Math.round((answered / totalQuestions) * 100);

  const outstandingEvidence = EVIDENCE.filter(
    (item) => item.required && item.status !== "accepted",
  );
  const openRoadmap = ROADMAP.filter((item) => item.status !== "verified");

  return (
    <AppShell
      account={MINISTRY_ACCOUNT_CHIP}
      groups={ministryNav("home")}
      persona="ministry"
      topBar={
        <TopBar
          actions={
            <Btn href="/preview/ministry/assessment" size="sm">
              Continue assessment
            </Btn>
          }
          breadcrumb={[{ label: "Overview" }]}
          status={<Badge tone="clay">{MINISTRY_ACCOUNT.stage}</Badge>}
        />
      }
    >
      <PageTitle
        description="You are partway through the SAVE Standard. Nothing here is a test — the findings are yours to keep whichever way the decision goes."
        eyebrow={MINISTRY_ACCOUNT.applicationId}
      >
        {MINISTRY_ACCOUNT.ministry}
      </PageTitle>

      {/* -------------------------------------------------------- Journey -- */}
      <Card className="mt-8 px-7 py-7">
        <Steps
          steps={[
            { label: "Inquiry", meta: "Approved 14 Jun", state: "done" },
            { label: "Assessment", meta: `${pct}% complete`, state: "current" },
            { label: "Evidence review", meta: "3 items open", state: "todo" },
            { label: "Findings & roadmap", meta: "Draft shared", state: "todo" },
            { label: "Decision", meta: "Expected Oct", state: "todo" },
            { label: "Published", state: "todo" },
          ]}
        />
      </Card>

      <div className="mt-6">
        <StatRow>
          <Stat
            caption={`${answered} of ${totalQuestions} questions`}
            label="Assessment complete"
            value={`${pct}%`}
          />
          <Stat
            caption="Required documents"
            label="Evidence outstanding"
            value={outstandingEvidence.length}
          />
          <Stat
            caption={`${ROADMAP.length - openRoadmap.length} verified`}
            label="Roadmap items open"
            value={openRoadmap.length}
          />
          <Stat
            caption="Reviewer target"
            label="Submission due"
            value={formatDate(MINISTRY_ACCOUNT.assessmentDue)}
          />
        </StatRow>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* --------------------------------------------- Next best action */}
          <Callout title="Two things are holding up your review" tone="clay">
            Your Form 990 is for the wrong fiscal year, and we still need the
            board minute approving executive compensation. Both take minutes to
            fix and unblock the whole evidence review.
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Btn href="/preview/ministry/evidence" size="sm">
                Fix evidence
              </Btn>
              <Btn size="sm" variant="secondary">
                Ask Hannah a question
              </Btn>
            </div>
          </Callout>

          {/* ------------------------------------------------ Section status */}
          <Card>
            <CardHeader
              action={
                <Btn href="/preview/ministry/assessment" size="sm" variant="ghost">
                  Open
                </Btn>
              }
              description="Six categories. Answer in any order, save as you go."
              title="The SAVE Standard"
            />
            <CardBody className="space-y-5">
              {ASSESSMENT_SECTIONS.map((section) => (
                <div key={section.key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-ink-800">
                      {CATEGORY_LABELS[section.key]}
                    </span>
                    <div className="flex items-center gap-3">
                      {section.status === "returned" ? (
                        <Badge tone="clay">Returned with notes</Badge>
                      ) : null}
                      <span className="save-numeric text-caption text-ink-400">
                        {section.answered}/{section.total}
                      </span>
                    </div>
                  </div>
                  <Meter
                    tone={
                      section.status === "complete"
                        ? "sage"
                        : section.status === "returned"
                          ? "clay"
                          : "ink"
                    }
                    value={(section.answered / section.total) * 100}
                  />
                </div>
              ))}
            </CardBody>
            <CardFooter>
              <span className="save-numeric text-caption text-ink-400">
                {answered} of {totalQuestions} answered
              </span>
              <Btn href="/preview/ministry/assessment" size="sm">
                Continue where you left off
              </Btn>
            </CardFooter>
          </Card>

          {/* --------------------------------------------- Findings preview */}
          <Card>
            <CardHeader
              action={
                <Btn href="/preview/ministry/findings" size="sm" variant="ghost">
                  All findings
                </Btn>
              }
              description="What your reviewer has concluded so far. Strengths included."
              title="Early findings"
            />
            <div className="divide-y divide-hairline">
              {FINDINGS.slice(0, 3).map((finding) => (
                <FindingRow finding={finding} key={finding.id} />
              ))}
            </div>
          </Card>
        </div>

        {/* ------------------------------------------------------------ Rail */}
        <aside className="space-y-6">
          <Card>
            <CardBody>
              <p className="save-eyebrow text-brass-600">Your reviewer</p>
              <div className="mt-4 flex items-center gap-3.5">
                <Monogram name={MINISTRY_ACCOUNT.reviewer} size="lg" tone="brass" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">
                    {MINISTRY_ACCOUNT.reviewer}
                  </p>
                  <p className="text-caption text-ink-400">
                    Senior Reviewer · Church planting
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-600">
                Hannah reads everything you submit. If a question is unclear or
                you think a finding is wrong, say so — that conversation is part
                of the assessment.
              </p>
              <Btn className="mt-5 w-full" size="sm">
                Message your reviewer
              </Btn>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              action={
                <Btn href="/preview/ministry/evidence" size="sm" variant="ghost">
                  All
                </Btn>
              }
              title="Evidence needing you"
            />
            <div className="divide-y divide-hairline">
              {outstandingEvidence.slice(0, 3).map((item) => (
                <EvidenceRow item={item} key={item.id} />
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Application" />
            <CardBody>
              <DataList>
                <DataRow label="Reference" value={MINISTRY_ACCOUNT.applicationId} />
                <DataRow label="Stage" value={MINISTRY_ACCOUNT.stage} />
                <DataRow label="Opened" value={formatDate("2026-06-14")} />
                <DataRow label="Target decision" value={formatDate("2026-10-15")} />
              </DataList>
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">
              You keep the findings
            </p>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">
              Whatever the decision, the findings report and the roadmap are
              yours. Many ministries reapply a year later having worked through
              it. There is no fee either way.
            </p>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
