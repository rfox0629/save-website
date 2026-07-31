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
  Input,
  Monogram,
  PageTitle,
  ScoreDial,
  Select,
  Tabs,
  Textarea,
  formatDate,
  formatMoney,
} from "@/components/save/primitives";
import {
  CategoryBreakdown,
  EvidenceRow,
  FindingRow,
} from "@/components/save/patterns";
import { STAFF_ACCOUNT, staffNav } from "@/components/save/navs";
import { AppShell, TopBar } from "@/components/save/shell";
import {
  AUDIT_LOG,
  EVIDENCE,
  FINDINGS,
  MINISTRY_ACCOUNT,
  REVIEWERS,
  getMinistry,
} from "@/lib/preview/data";

export const metadata: Metadata = { title: "Review" };

/**
 * The reviewer workspace. Evidence, scoring and decision live side by side so
 * a reviewer never has to hold context across pages — the single biggest
 * complaint about the current dark application detail screen.
 */
export default function StaffReviewPage() {
  const ministry = getMinistry("rio-hope-church-network");
  const pending = EVIDENCE.filter((item) => item.status === "in-review");
  const returned = EVIDENCE.filter((item) => item.status === "needs-attention");

  return (
    <AppShell
      account={STAFF_ACCOUNT}
      groups={staffNav("review")}
      persona="staff"
      topBar={
        <TopBar
          actions={
            <>
              <Btn size="sm" variant="secondary">
                Return to ministry
              </Btn>
              <Btn size="sm" variant="secondary">
                Save notes
              </Btn>
              <Btn size="sm">Advance to decision</Btn>
            </>
          }
          breadcrumb={[
            { href: "/preview/staff", label: "Queue" },
            { label: ministry.name },
          ]}
          status={<Badge tone="ink">Evidence review</Badge>}
        />
      }
    >
      <div className="flex flex-wrap items-start gap-5">
        <Monogram name={ministry.name} size="xl" />
        <div className="min-w-0 flex-1">
          <PageTitle
            description={`${ministry.category} · ${ministry.location} · ${formatMoney(ministry.budget)} annual budget`}
            eyebrow={MINISTRY_ACCOUNT.applicationId}
          >
            {ministry.name}
          </PageTitle>
        </div>
      </div>

      <div className="mt-7">
        <Tabs
          items={[
            { active: true, count: EVIDENCE.length, href: "#evidence", label: "Evidence" },
            { href: "#scoring", label: "Scoring" },
            { count: FINDINGS.length, href: "#findings", label: "Findings" },
            { count: 8, href: "#external", label: "External checks" },
            { href: "#decision", label: "Decision" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <div className="min-w-0 space-y-6">
          {/* ------------------------------------------------ Evidence review */}
          <Card id="evidence">
            <CardHeader
              action={<Badge tone="ink">{pending.length} awaiting you</Badge>}
              description="Accept, return with a note, or request something different."
              title="Evidence review"
            />
            <div className="divide-y divide-hairline">
              {pending.map((item) => (
                <EvidenceRow
                  action={
                    <div className="flex gap-2">
                      <Btn size="sm" variant="secondary">
                        Return
                      </Btn>
                      <Btn size="sm">Accept</Btn>
                    </div>
                  }
                  item={item}
                  key={item.id}
                />
              ))}
              {returned.map((item) => (
                <EvidenceRow
                  action={
                    <Btn size="sm" variant="ghost">
                      View note
                    </Btn>
                  }
                  item={item}
                  key={item.id}
                />
              ))}
            </div>
            <CardFooter>
              <span className="text-caption text-ink-400">
                Returning a document notifies the ministry immediately.
              </span>
              <Btn size="sm" variant="secondary">
                View all evidence
              </Btn>
            </CardFooter>
          </Card>

          {/* -------------------------------------------------------- Scoring */}
          <Card id="scoring">
            <CardHeader
              action={
                <Btn size="sm" variant="secondary">
                  Recalculate
                </Btn>
              }
              description="Engine scores are advisory. Any override requires a written reason and is recorded in the audit log."
              title="Scoring"
            />
            <CardBody>
              <div className="flex flex-wrap items-center gap-7">
                <ScoreDial label="Composite" score={ministry.score} />
                <div className="min-w-0 flex-1 space-y-3">
                  <DataList>
                    <DataRow label="Engine score" value="85" />
                    <DataRow label="Reviewer overrides" value="1" />
                    <DataRow label="Composite" value={ministry.score} />
                    <DataRow label="Proposed tier" value={ministry.tier} />
                  </DataList>
                </div>
              </div>
              <Divider className="my-6" />
              <CategoryBreakdown scores={ministry.categoryScores} />
            </CardBody>
            <CardBody className="border-t border-hairline">
              <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-end">
                <Field label="Category">
                  <Select defaultValue="Fruit">
                    <option>Doctrine</option>
                    <option>Governance</option>
                    <option>Financial Integrity</option>
                    <option>Leadership</option>
                    <option>Fruit</option>
                    <option>External Signals</option>
                  </Select>
                </Field>
                <Field label="Override reason" required>
                  <Input placeholder="Evidence supports a higher score than the engine credited" />
                </Field>
                <Btn variant="secondary">Apply override</Btn>
              </div>
            </CardBody>
          </Card>

          {/* ------------------------------------------------------- Findings */}
          <Card id="findings">
            <CardHeader
              action={
                <Btn size="sm" variant="secondary">
                  Add a finding
                </Btn>
              }
              description="These become the ministry's findings report and roadmap."
              title="Findings"
            />
            <div className="divide-y divide-hairline">
              {FINDINGS.map((finding) => (
                <FindingRow
                  action={
                    <div className="flex gap-2">
                      <Btn size="sm" variant="ghost">
                        Edit
                      </Btn>
                    </div>
                  }
                  finding={finding}
                  key={finding.id}
                />
              ))}
            </div>
          </Card>

          {/* ------------------------------------------------ External checks */}
          <Card id="external">
            <CardHeader
              action={<Badge tone="sage">0 adverse</Badge>}
              description="Run automatically on submission and re-run before any decision."
              title="External checks"
            />
            <CardBody className="grid gap-px overflow-hidden rounded-lg bg-hairline sm:grid-cols-2">
              {[
                { note: "Exempt status current", source: "IRS Publication 78" },
                { note: "Filed through FY2024", source: "Form 990 filings" },
                { note: "Rated, no concerns", source: "Charity Navigator" },
                { note: "Member in good standing", source: "ECFA" },
                { note: "No adverse coverage", source: "News & press" },
                { note: "Statement of faith public", source: "Website review" },
                { note: "No litigation found", source: "Court records" },
                { note: "No sanctions matches", source: "Sanctions lists" },
              ].map((check) => (
                <div className="bg-surface px-5 py-4" key={check.source}>
                  <p className="text-caption font-semibold text-ink-900">
                    {check.source}
                  </p>
                  <p className="mt-1 text-caption text-ink-500">{check.note}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* ------------------------------------------------------- Decision */}
          <Card id="decision">
            <CardHeader
              description="A decision publishes findings to the ministry and, if approved, queues the donor brief."
              title="Decision"
            />
            <CardBody className="space-y-5">
              <Callout tone="clay" title="Two blockers remain">
                Form 990 is the wrong fiscal year and the compensation approval
                minute has not been supplied. You can still record a provisional
                recommendation.
              </Callout>

              <Field label="Recommendation" required>
                <Select defaultValue="Advance">
                  <option>Advance — recommend approval</option>
                  <option>Advance with conditions</option>
                  <option>Hold — more information required</option>
                  <option>Decline</option>
                </Select>
              </Field>

              <Field
                help="Read by the ministry and, in summary form, by donors."
                label="Reviewer summary"
                required
              >
                <Textarea
                  defaultValue="Rio Hope demonstrates unusually disciplined governance for its size, with a fully independent board and twelve months of operating reserve. The self-support model is well documented and working. Two items hold this back from a higher tier: the concentration of executive and committee authority in one person, and the absence of a common discipleship measure across congregations. Both are addressable and are reflected in the roadmap."
                  rows={7}
                />
              </Field>
            </CardBody>
            <CardFooter>
              <Btn size="sm" variant="danger">
                Decline
              </Btn>
              <div className="flex gap-2.5">
                <Btn size="sm" variant="secondary">
                  Save draft
                </Btn>
                <Btn size="sm">Submit decision</Btn>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* ------------------------------------------------------------ Rail */}
        <aside className="space-y-6">
          <Card>
            <CardHeader title="Assignment" />
            <CardBody>
              <div className="flex items-center gap-3.5">
                <Monogram name={STAFF_ACCOUNT.name} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">
                    {STAFF_ACCOUNT.name}
                  </p>
                  <p className="text-caption text-ink-400">
                    Assigned {formatDate("2026-07-29")}
                  </p>
                </div>
              </div>
              <Divider className="my-4" />
              <Field label="Reassign to">
                <Select>
                  {REVIEWERS.map((reviewer) => (
                    <option key={reviewer.id}>
                      {reviewer.name} ({reviewer.active}/{reviewer.capacity})
                    </option>
                  ))}
                </Select>
              </Field>
              <Btn className="mt-3.5 w-full" size="sm" variant="secondary">
                Reassign
              </Btn>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Reviewer notes" />
            <CardBody>
              <Textarea
                placeholder="Private to the SAVE team. Never shown to the ministry or donors."
                rows={5}
              />
              <Btn className="mt-3 w-full" size="sm" variant="secondary">
                Add note
              </Btn>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Audit history" />
            <div className="divide-y divide-hairline">
              {AUDIT_LOG.map((entry) => (
                <div className="px-6 py-3.5" key={entry.id}>
                  <p className="text-caption font-medium text-ink-900">
                    {entry.action}
                  </p>
                  {entry.detail ? (
                    <p className="mt-0.5 text-caption text-ink-500">
                      {entry.detail}
                    </p>
                  ) : null}
                  <p className="save-numeric mt-1 text-micro text-ink-400">
                    {entry.actor} · {entry.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}
