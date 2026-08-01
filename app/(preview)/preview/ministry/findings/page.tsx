import type { Metadata } from "next";

import {
  Badge,
  Btn,
  Callout,
  Card,
  CardBody,
  CardHeader,
  PageTitle,
  ScoreDial,
  Stat,
  StatRow,
  Tabs,
} from "@/components/save/primitives";
import { CategoryBreakdown, FindingRow } from "@/components/save/patterns";
import { MINISTRY_ACCOUNT_CHIP, ministryNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import { FINDINGS, getMinistry } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Findings" };

export default function FindingsPage() {
  const ministry = getMinistry("rio-hope-church-network");
  const strengths = FINDINGS.filter((f) => f.severity === "strength");
  const gaps = FINDINGS.filter((f) => f.severity === "gap");
  const risks = FINDINGS.filter((f) => f.severity === "risk");
  const observations = FINDINGS.filter((f) => f.severity === "observation");

  return (
    <AppShell
      account={MINISTRY_ACCOUNT_CHIP}
      groups={ministryNav("findings")}
      persona="ministry"
      topBar={
        <TopBar
          actions={
            <>
              <Btn size="sm" variant="secondary">
                Download findings report
              </Btn>
              <Btn href="/preview/ministry/roadmap" size="sm">
                Open roadmap
              </Btn>
            </>
          }
          breadcrumb={[
            { href: "/preview/ministry", label: "Overview" },
            { label: "Findings" },
          ]}
          status={<Badge tone="brass">Draft — not yet published</Badge>}
        />
      }
    >
      <PageTitle
        description="This is what your reviewer has concluded so far. Nothing here is final until you have had a chance to respond."
        eyebrow="Assessment"
      >
        Findings
      </PageTitle>

      <Callout className="mt-7" title="This report is yours" tone="sage">
        Whatever the decision, you keep this report and the roadmap that comes
        with it. If you disagree with a finding, say so — reviewers change their
        conclusions when the evidence warrants it.
      </Callout>

      <div className="mt-6">
        <StatRow>
          <Stat caption="Above standard" label="Strengths" value={strengths.length} />
          <Stat caption="Worth closing" label="Gaps" value={gaps.length} />
          <Stat caption="Needs a decision" label="Risks" value={risks.length} />
          <Stat caption="Noted, no action" label="Observations" value={observations.length} />
        </StatRow>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <div>
            <Tabs
              items={[
                { active: true, count: FINDINGS.length, href: "#all", label: "All" },
                { count: strengths.length, href: "#strengths", label: "Strengths" },
                { count: gaps.length, href: "#gaps", label: "Gaps" },
                { count: risks.length, href: "#risks", label: "Risks" },
              ]}
            />
          </div>

          <Card id="strengths">
            <CardHeader
              description="We lead with these because they are the reason your application is progressing."
              title="What is working"
            />
            <div className="divide-y divide-hairline">
              {strengths.map((finding) => (
                <FindingRow finding={finding} key={finding.id} />
              ))}
            </div>
          </Card>

          <Card id="gaps">
            <CardHeader
              action={
                <Btn href="/preview/ministry/roadmap" size="sm" variant="ghost">
                  See roadmap
                </Btn>
              }
              description="Each of these has a corresponding roadmap item with an owner and a date."
              title="Gaps to close"
            />
            <div className="divide-y divide-hairline">
              {[...gaps, ...observations].map((finding) => (
                <FindingRow
                  action={
                    <Btn size="sm" variant="secondary">
                      Respond
                    </Btn>
                  }
                  finding={finding}
                  key={finding.id}
                />
              ))}
            </div>
          </Card>

          <Card id="risks">
            <CardHeader
              description="These need a decision from your board, not just a document."
              title="Risks"
            />
            <div className="divide-y divide-hairline">
              {risks.map((finding) => (
                <FindingRow
                  action={
                    <Btn size="sm" variant="secondary">
                      Respond
                    </Btn>
                  }
                  finding={finding}
                  key={finding.id}
                />
              ))}
            </div>
            <CardBody className="border-t border-hairline">
              <Callout tone="clay" title="How this affects your assessment">
                Concentrated decision authority does not stop an approval, but
                it caps the Leadership category until it is addressed. Ministries
                that separate the roles typically gain six to nine points at
                reassessment.
              </Callout>
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader title="Provisional score" />
            <CardBody>
              <div className="flex items-center gap-5">
                <ScoreDial label="Provisional" score={ministry.score} />
                <p className="text-caption leading-relaxed text-ink-500">
                  Based on evidence accepted so far. This will move as the
                  remaining categories are completed.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="By category" />
            <CardBody>
              <CategoryBreakdown scores={ministry.categoryScores} showNotes={false} />
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">
              Disagree with something?
            </p>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">
              Use Respond on any finding. Your reviewer sees it immediately and
              must answer before the assessment is finalised.
            </p>
            <Btn className="mt-4 w-full" size="sm" variant="secondary">
              Message Hannah
            </Btn>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
