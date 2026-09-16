import Link from "next/link";

import { ViewModeSwitcher } from "@/components/app/view-mode-switcher";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StaffShell } from "@/components/dashboard/staff-shell";
import {
  AiSummaryButton,
  AssignReviewerForm,
  DocumentReviewToggle,
  ExternalCheckForm,
  NoteForm,
  OverrideScoreForm,
  ResolveFlagForm,
  RunAssessmentButton,
  StatusForm,
} from "@/components/dashboard/workspace-actions";
import {
  RecordEngagementForm,
  RelationalDiligenceExceptionForm,
} from "@/components/dashboard/diligence-actions";
import {
  BriefApprovalControls,
  LibraryVisibilityToggle,
} from "@/components/dashboard/publishing-actions";
import {
  AddRoadmapItemForm,
  RoadmapStatusControl,
  ShareFindingsControl,
} from "@/components/dashboard/roadmap-actions";
import {
  Badge,
  type BadgeTone,
  Btn,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DataList,
  DataRow,
  Divider,
  EmptyState,
  Meter,
  Monogram,
  PageTitle,
  ScoreDial,
  Table,
  Tabs,
  Td,
  Th,
  formatDate,
} from "@/components/save/primitives";
import { TopBar } from "@/components/save/shell";
import { parseReviewerSummary } from "@/lib/ai/reviewerSummary";
import {
  buildInquirySections,
  getInquirySubmittedAt,
} from "@/lib/staff-inquiry";
import {
  DILIGENCE_KIND_LABELS,
  DILIGENCE_STATUS_LABELS,
  type DiligenceKind,
  type DiligenceStatus,
  getDiligenceEngagements,
  getRelationalDiligenceStatus,
} from "@/lib/diligence";
import {
  ROADMAP_STATUS_LABELS,
  type RoadmapStatus,
  getRoadmapItems,
  getRoadmapProgress,
} from "@/lib/roadmap";
import {
  getApplicationDetail,
  getExternalCheckLabel,
  getStatusLabel,
} from "@/lib/review";
import type { RiskFlag } from "@/lib/supabase/types";
import { getViewerContext } from "@/lib/view-mode";

/**
 * The reviewer workspace — the approved SAVE design over the canonical review
 * backend. Evidence, scoring, flags, external checks and the decision live on
 * one page so a reviewer never has to hold context across tabs.
 *
 * Every action here calls the same API routes and the same `lib/review`
 * functions the legacy dark screen called. Nothing about scoring, overrides,
 * permissions or the audit trail changed — only the interface.
 */

/** Stored category keys, with the maximum the scoring engine can award each. */
const CATEGORIES = [
  { key: "leadership", label: "Leadership integrity", max: 20 },
  { key: "doctrine", label: "Doctrine", max: 15 },
  { key: "governance", label: "Governance", max: 15 },
  { key: "financial", label: "Financial stewardship", max: 20 },
  { key: "fruit", label: "Fruit", max: 20 },
  { key: "external", label: "External signals", max: 10 },
] as const;

const STATUS_OPTIONS = [
  "inquiry_submitted",
  "inquiry_approved",
  "vetting_submitted",
  "under_review",
  "more_info_requested",
  "approved",
  "declined",
  "hard_stop",
] as const;

function statusTone(status: string): BadgeTone {
  if (status === "approved") return "sage";
  if (status === "declined" || status === "hard_stop") return "risk";
  if (status === "under_review" || status === "inquiry_approved") return "ink";
  if (status === "more_info_requested") return "brass";
  return "neutral";
}

function severityTone(severity: RiskFlag["severity"]): BadgeTone {
  if (severity === "hard_stop" || severity === "high") return "risk";
  if (severity === "medium") return "clay";
  return "neutral";
}

function checkTone(status: string): BadgeTone {
  if (status === "pass") return "sage";
  if (status === "flag") return "risk";
  if (status === "not_applicable") return "neutral";
  return "neutral";
}

function meterTone(pct: number) {
  if (pct >= 85) return "sage" as const;
  if (pct >= 70) return "brass" as const;
  return "clay" as const;
}

function isAiSummaryOutdated(
  aiSummary: string | null,
  generatedAt: string | null,
  updatedAt: string | null | undefined,
) {
  if (!aiSummary) return false;
  if (!generatedAt) return true;
  if (!updatedAt) return false;

  const generatedMs = Date.parse(generatedAt);
  const updatedMs = Date.parse(updatedAt);

  if (Number.isNaN(generatedMs) || Number.isNaN(updatedMs)) return true;

  return updatedMs > generatedMs;
}

export default async function ApplicationWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const [data, viewer] = await Promise.all([
    getApplicationDetail(params.id),
    getViewerContext(),
  ]);
  // Read after the access gate above, never alongside it.
  const engagements = await getDiligenceEngagements(params.id);
  const relational = getRelationalDiligenceStatus(
    engagements,
    data.application,
  );
  const isAdmin = viewer.realRole === "admin";
  const roadmapItems = await getRoadmapItems(params.id);
  const roadmapProgress = getRoadmapProgress(roadmapItems);

  const scoreByCategory: Record<string, number> = {
    doctrine: data.scoreSummary.doctrine,
    external: data.scoreSummary.external,
    financial: data.scoreSummary.financial,
    fruit: data.scoreSummary.fruit,
    governance: data.scoreSummary.governance,
    leadership: data.scoreSummary.leadership,
  };

  const componentsByCategory = data.scoreComponents.reduce<
    Record<string, typeof data.scoreComponents>
  >((acc, component) => {
    acc[component.category] = [...(acc[component.category] ?? []), component];
    return acc;
  }, {});

  const reviewerSummary = parseReviewerSummary(data.application.ai_summary);
  const summaryOutdated = isAiSummaryOutdated(
    data.application.ai_summary,
    data.application.ai_summary_generated_at,
    data.application.updated_at,
  );

  const openFlags = data.flags.filter((flag) => !flag.resolved);
  const recordedChecks = data.externalChecks.filter((check) => check.id);
  const adverseChecks = recordedChecks.filter(
    (check) => check.status === "flag",
  );
  const reviewedDocuments = data.documents.filter(
    (document) => document.reviewed,
  );
  const voice = data.voiceAlignment;
  const respondedInvites = voice.invites.filter((invite) => invite.response);

  return (
    <StaffShell
      active="queue"
      topBar={
        <TopBar
          actions={
            <>
              <ViewModeSwitcher
                canPreview={viewer.canPreview}
                currentViewMode={viewer.currentViewMode}
              />
              <SignOutButton className="save-focus-ring rounded-md border border-hairline px-3 py-1.5 text-caption font-semibold text-ink-500 transition hover:bg-paper-200 hover:text-ink-800" />
            </>
          }
          breadcrumb={[
            { href: "/dashboard", label: "Queue" },
            { label: data.organization.legal_name },
          ]}
          status={
            <Badge tone={statusTone(data.application.status)}>
              {getStatusLabel(data.application.status)}
            </Badge>
          }
        />
      }
    >
      <div className="flex flex-wrap items-start gap-5">
        <Monogram name={data.organization.legal_name} size="xl" />
        <div className="min-w-0 flex-1">
          <PageTitle
            description={[
              data.organization.entity_type ?? "Entity type not recorded",
              data.organization.ein ? `EIN ${data.organization.ein}` : null,
              `Submitted ${formatDate(data.application.created_at)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
            eyebrow={`Application ${data.application.id.slice(0, 8)}`}
          >
            {data.organization.legal_name}
          </PageTitle>
        </div>
      </div>

      <div className="mt-7">
        <Tabs
          items={[
            {
              active: true,
              href: "#inquiry",
              label: "Submitted inquiry",
            },
            {
              count: data.documents.length,
              href: "#evidence",
              label: "Evidence",
            },
            { href: "#scoring", label: "Scoring" },
            { count: openFlags.length, href: "#flags", label: "Risk flags" },
            {
              count: recordedChecks.length,
              href: "#external",
              label: "External checks",
            },
            {
              count: engagements.length,
              href: "#diligence",
              label: "Time with leadership",
            },
            { href: "#voice", label: "Voice alignment" },
            {
              count: roadmapItems.length,
              href: "#roadmap",
              label: "Roadmap",
            },
            { href: "#decision", label: "Decision" },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <div className="min-w-0 space-y-6">
          {/* --------------------------------------------- Submitted inquiry */}
          <Card id="inquiry">
            <CardHeader
              action={
                <Badge
                  tone={
                    getInquirySubmittedAt(data.inquiry) ? "sage" : "neutral"
                  }
                >
                  {getInquirySubmittedAt(data.inquiry)
                    ? `Submitted ${formatDate(getInquirySubmittedAt(data.inquiry))}`
                    : "Not yet submitted"}
                </Badge>
              }
              description="What the ministry told SAVE, in its own words and exactly as submitted. Read-only, and the basis for the inquiry decision."
              title="Submitted inquiry"
            />
            {buildInquirySections(data.organization, data.inquiry).length ===
            0 ? (
              <EmptyState
                description="This ministry has not submitted its inquiry yet. There is nothing to review until it does."
                title="No inquiry submitted yet"
              />
            ) : (
              <CardBody className="space-y-7">
                {buildInquirySections(data.organization, data.inquiry).map(
                  (inquirySection) => (
                    <section key={inquirySection.title}>
                      <p className="save-eyebrow text-ink-400">
                        {inquirySection.title}
                      </p>
                      <div className="mt-3">
                        <DataList>
                          {inquirySection.rows.map((inquiryRow) =>
                            inquiryRow.narrative ? (
                              <div
                                className="py-3 first:pt-0 last:pb-0"
                                key={inquiryRow.label}
                              >
                                <p className="text-sm text-ink-500">
                                  {inquiryRow.label}
                                </p>
                                <p className="mt-1.5 text-sm leading-relaxed text-ink-900">
                                  {inquiryRow.value}
                                </p>
                              </div>
                            ) : (
                              <DataRow
                                key={inquiryRow.label}
                                label={inquiryRow.label}
                                value={inquiryRow.value}
                              />
                            ),
                          )}
                        </DataList>
                      </div>
                    </section>
                  ),
                )}
              </CardBody>
            )}
          </Card>

          {/* ------------------------------------------------------ Evidence */}
          <Card id="evidence">
            <CardHeader
              action={
                <Badge tone={data.documents.length > 0 ? "ink" : "neutral"}>
                  {reviewedDocuments.length} of {data.documents.length} reviewed
                </Badge>
              }
              description="Documents the ministry has supplied. Opening a file uses a short-lived signed link."
              title="Evidence"
            />
            {data.documents.length === 0 ? (
              <EmptyState
                description="Nothing has been uploaded against this application yet."
                title="No documents"
              />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Document</Th>
                    <Th>Type</Th>
                    <Th>Uploaded</Th>
                    <Th align="right" />
                  </tr>
                </thead>
                <tbody>
                  {data.documents.map((document) => (
                    <tr key={document.id}>
                      <Td>
                        {document.signedUrl ? (
                          <a
                            className="save-focus-ring rounded-sm font-medium text-ink-900 underline decoration-hairline underline-offset-4 hover:text-ink-600"
                            href={document.signedUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {document.file_name}
                          </a>
                        ) : (
                          <span className="font-medium text-ink-900">
                            {document.file_name}
                          </span>
                        )}
                        {document.uploadedByEmail ? (
                          <p className="mt-0.5 text-caption text-ink-400">
                            {document.uploadedByEmail}
                          </p>
                        ) : null}
                      </Td>
                      <Td>{document.document_type}</Td>
                      <Td numeric>{formatDate(document.uploaded_at)}</Td>
                      <Td align="right">
                        <DocumentReviewToggle
                          applicationId={params.id}
                          documentId={document.id}
                          reviewed={document.reviewed}
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          {/* ------------------------------------------------------- Scoring */}
          <Card id="scoring">
            <CardHeader
              action={
                <RunAssessmentButton
                  applicationId={params.id}
                  blockedReason={
                    data.hasVettingResponse
                      ? null
                      : "The ministry has not submitted its vetting answers yet, so the scoring engine cannot run."
                  }
                />
              }
              description="Engine scores are advisory. Any override requires a written reason and is recorded against the score record."
              title="Scoring"
            />
            <CardBody>
              {data.latestScore ? (
                <>
                  <div className="flex flex-wrap items-center gap-7">
                    <ScoreDial
                      label="Composite"
                      score={data.scoreSummary.total}
                    />
                    <div className="min-w-0 flex-1">
                      <DataList>
                        <DataRow
                          label="Composite"
                          value={`${data.scoreSummary.total} / ${data.scoreSummary.max}`}
                        />
                        <DataRow
                          label="Recommendation"
                          value={data.scoreRecommendation}
                        />
                        <DataRow
                          label="Calculated"
                          value={formatDate(data.latestScore.calculated_at)}
                        />
                        <DataRow
                          label="Reviewer override"
                          value={data.latestScore.override_by ? "Yes" : "None"}
                        />
                      </DataList>
                    </div>
                  </div>

                  {data.latestScore.is_hard_stop ? (
                    <Callout
                      className="mt-5"
                      title="Hard stop recorded"
                      tone="risk"
                    >
                      {data.latestScore.hard_stop_reason ??
                        "The scoring engine recorded a hard stop for this application."}
                    </Callout>
                  ) : null}

                  {data.latestScore.override_notes ? (
                    <Callout
                      className="mt-5"
                      title="Most recent override"
                      tone="brass"
                    >
                      {data.latestScore.override_notes}
                    </Callout>
                  ) : null}

                  <Divider className="my-6" />

                  <ul className="divide-y divide-hairline">
                    {CATEGORIES.map((category) => {
                      const score = scoreByCategory[category.key] ?? 0;
                      const pct = Math.round((score / category.max) * 100);
                      const components =
                        componentsByCategory[category.key] ?? [];

                      return (
                        <li className="py-4 first:pt-0" key={category.key}>
                          <div className="flex items-baseline justify-between gap-4">
                            <p className="text-sm font-semibold text-ink-900">
                              {category.label}
                            </p>
                            <span className="save-numeric text-sm font-semibold text-ink-900">
                              {score} / {category.max}
                            </span>
                          </div>
                          <div className="mt-2.5">
                            <Meter tone={meterTone(pct)} value={pct} />
                          </div>
                          {components.length > 0 ? (
                            <ul className="mt-3 space-y-2">
                              {components.map((component) => (
                                <li
                                  className="rounded-md bg-surface-sunken px-3.5 py-2.5"
                                  key={component.id}
                                >
                                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                                    <p className="text-caption font-medium text-ink-800">
                                      {component.criterion}
                                    </p>
                                    <span className="save-numeric text-caption font-semibold text-ink-700">
                                      {component.awarded_points} /{" "}
                                      {component.max_points}
                                    </span>
                                  </div>
                                  {component.rationale ? (
                                    <p className="mt-1 text-caption leading-relaxed text-ink-500">
                                      {component.rationale}
                                    </p>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <EmptyState
                  description="No score has been calculated yet. Run the assessment pipeline to score this application from its answers, documents and external checks."
                  title="Not yet scored"
                />
              )}
            </CardBody>

            {data.latestScore ? (
              <CardBody className="border-t border-hairline">
                <OverrideScoreForm
                  applicationId={params.id}
                  categories={CATEGORIES.map((category) => ({
                    label: `${category.label} (max ${category.max})`,
                    value: category.key,
                  }))}
                />
              </CardBody>
            ) : null}
          </Card>

          {/* --------------------------------------------------- AI summary */}
          <Card id="summary">
            <CardHeader
              action={<AiSummaryButton applicationId={params.id} />}
              description="SAVE-assisted analysis, generated from the ministry's submitted answers, external checks and reviewer notes. This is SAVE's synthesis, not the ministry's testimony — read the submitted inquiry above for what the ministry actually said. Advisory only: it never sets a score."
              title="AI review summary — SAVE-assisted analysis"
            />
            <CardBody>
              {summaryOutdated ? (
                <Callout
                  className="mb-5"
                  title="This summary may be out of date"
                  tone="clay"
                >
                  The application has changed since the summary was generated on{" "}
                  {formatDate(data.application.ai_summary_generated_at)}.
                </Callout>
              ) : null}

              {reviewerSummary ? (
                <div className="space-y-5">
                  <div>
                    <p className="save-eyebrow text-ink-400">
                      Executive summary
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-700">
                      {reviewerSummary.executive_summary}
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <p className="save-eyebrow text-ink-400">Strengths</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-700">
                        {reviewerSummary.top_strengths.map((strength) => (
                          <li key={strength}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="save-eyebrow text-ink-400">Risks</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-700">
                        {reviewerSummary.top_risks.map((risk) => (
                          <li key={risk}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {reviewerSummary.follow_up_questions.length > 0 ? (
                    <div>
                      <p className="save-eyebrow text-ink-400">
                        Follow-up questions
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-700">
                        {reviewerSummary.follow_up_questions.map((question) => (
                          <li key={question}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : data.application.ai_summary ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                  {data.application.ai_summary}
                </p>
              ) : (
                <EmptyState
                  description="Generate one after reviewing the inquiry, vetting answers, documents and external checks."
                  title="No AI summary yet"
                />
              )}
            </CardBody>
          </Card>

          {/* ----------------------------------------------------- Risk flags */}
          <Card id="flags">
            <CardHeader
              action={
                openFlags.length > 0 ? (
                  <Badge tone="risk">{openFlags.length} open</Badge>
                ) : (
                  <Badge tone="sage">None open</Badge>
                )
              }
              description="Raised by the scoring engine or by a reviewer. Resolving one requires a written resolution."
              title="Risk flags"
            />
            {data.flags.length === 0 ? (
              <EmptyState
                description="No risk flags have been raised against this application."
                title="No flags"
              />
            ) : (
              <div className="divide-y divide-hairline">
                {data.flags.map((flag) => (
                  <div
                    className="flex flex-wrap items-start gap-4 px-6 py-5"
                    key={flag.id}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Badge tone={severityTone(flag.severity)}>
                          {getStatusLabel(flag.severity)}
                        </Badge>
                        <span className="text-caption text-ink-400">
                          {flag.category} · {flag.flag_code}
                        </span>
                      </div>
                      <p className="mt-2.5 max-w-prose text-sm leading-relaxed text-ink-700">
                        {flag.description}
                      </p>
                      {flag.resolved ? (
                        <p className="mt-2 text-caption text-ink-400">
                          Resolved {formatDate(flag.resolved_at)}
                          {flag.resolution_notes
                            ? ` — ${flag.resolution_notes}`
                            : ""}
                        </p>
                      ) : null}
                    </div>
                    {flag.resolved ? (
                      <Badge tone="sage">Resolved</Badge>
                    ) : (
                      <ResolveFlagForm
                        applicationId={params.id}
                        flagId={flag.id}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ------------------------------------------------ External checks */}
          <Card id="external">
            <CardHeader
              action={
                adverseChecks.length > 0 ? (
                  <Badge tone="risk">{adverseChecks.length} adverse</Badge>
                ) : (
                  <Badge tone="sage">0 adverse</Badge>
                )
              }
              description="Run by the assessment pipeline and re-checked by a reviewer before any decision."
              title="External checks"
            />
            <div className="divide-y divide-hairline">
              {data.externalChecks.map((check) => (
                <div
                  className="px-6 py-4"
                  key={check.id || `pending-${check.source}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-sm font-semibold text-ink-900">
                          {getExternalCheckLabel(check.source)}
                        </p>
                        <Badge tone={checkTone(check.status)}>
                          {getStatusLabel(check.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-caption leading-relaxed text-ink-500">
                        {check.summary ?? "No result recorded."}
                      </p>
                      {check.checked_at ? (
                        <p className="save-numeric mt-1 text-micro text-ink-400">
                          Checked {formatDate(check.checked_at)}
                        </p>
                      ) : null}
                    </div>
                    <ExternalCheckForm
                      applicationId={params.id}
                      check={{
                        id: check.id,
                        score_impact: check.score_impact,
                        source: check.source,
                        status: check.status,
                        summary: check.summary,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ------------------------------------------ Time with leadership */}
          <Card id="diligence">
            <CardHeader
              action={<RecordEngagementForm applicationId={params.id} />}
              description="SAVE's judgement is not only documentary. This is the record of time actually spent with this leadership — internal to SAVE unless a reviewer writes a donor excerpt."
              title="Time with leadership"
            />
            <CardBody>
              {relational.satisfiedByEngagement ? (
                <Callout title="In-person time recorded" tone="sage">
                  {relational.inPersonCompleted.length} in-person{" "}
                  {relational.inPersonCompleted.length === 1
                    ? "engagement has"
                    : "engagements have"}{" "}
                  taken place with this leadership.
                </Callout>
              ) : relational.exception ? (
                <Callout
                  title="Documented exception to in-person diligence"
                  tone="brass"
                >
                  {relational.exception}
                </Callout>
              ) : (
                <Callout title="No in-person time recorded yet" tone="clay">
                  The top trust tier requires an onsite visit or a shared meal
                  with this leadership, or an exception documented by a SAVE
                  administrator.
                </Callout>
              )}
            </CardBody>

            {engagements.length > 0 ? (
              <div className="divide-y divide-hairline border-t border-hairline">
                {engagements.map((engagement) => (
                  <div className="px-6 py-5" key={engagement.id}>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Badge tone="ink">
                        {
                          DILIGENCE_KIND_LABELS[
                            engagement.kind as DiligenceKind
                          ]
                        }
                      </Badge>
                      <Badge
                        tone={
                          engagement.status === "scheduled" ? "neutral" : "sage"
                        }
                      >
                        {
                          DILIGENCE_STATUS_LABELS[
                            engagement.status as DiligenceStatus
                          ]
                        }
                      </Badge>
                      {engagement.visibility === "summary_shareable" ? (
                        <Badge tone="brass">Excerpt shareable</Badge>
                      ) : (
                        <Badge tone="neutral">Internal only</Badge>
                      )}
                      <span className="save-numeric text-caption text-ink-400">
                        {formatDate(engagement.occurred_on)}
                        {engagement.location ? ` · ${engagement.location}` : ""}
                      </span>
                    </div>

                    {engagement.narrative ? (
                      <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                        {engagement.narrative}
                      </p>
                    ) : null}

                    {engagement.save_participants.length > 0 ? (
                      <p className="mt-2 text-caption text-ink-400">
                        SAVE: {engagement.save_participants.join(", ")}
                      </p>
                    ) : null}

                    {engagement.strengths.length > 0 ||
                    engagement.concerns.length > 0 ? (
                      <div className="mt-3 grid gap-4 sm:grid-cols-2">
                        {engagement.strengths.length > 0 ? (
                          <div>
                            <p className="save-eyebrow mb-1.5 text-ink-400">
                              Strengths
                            </p>
                            <ul className="list-disc space-y-1 pl-5 text-caption leading-relaxed text-ink-600">
                              {engagement.strengths.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {engagement.concerns.length > 0 ? (
                          <div>
                            <p className="save-eyebrow mb-1.5 text-ink-400">
                              Concerns
                            </p>
                            <ul className="list-disc space-y-1 pl-5 text-caption leading-relaxed text-ink-600">
                              {engagement.concerns.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="No visits, meals or leadership conversations have been recorded against this assessment."
                title="Nothing recorded"
              />
            )}

            {isAdmin ? (
              <CardBody className="border-t border-hairline">
                <RelationalDiligenceExceptionForm
                  applicationId={params.id}
                  current={relational.exception}
                />
              </CardBody>
            ) : null}
          </Card>

          {/* ------------------------------------------------ Voice alignment */}
          <Card id="voice">
            <CardHeader
              action={
                <Btn
                  href={`/applications/${params.id}/voice-alignment`}
                  size="sm"
                  variant="secondary"
                >
                  Manage references
                </Btn>
              }
              description="What the people around this ministry say, gathered independently from staff and outside references."
              title="Voice alignment"
            />
            <CardBody>
              <DataList>
                <DataRow
                  label="Collection status"
                  value={<Badge tone="neutral">{voice.status}</Badge>}
                />
                <DataRow
                  label="Internal responses"
                  value={voice.internalCount}
                />
                <DataRow
                  label="External responses"
                  value={voice.externalCount}
                />
                <DataRow
                  label="Invitations sent"
                  value={`${respondedInvites.length} of ${voice.invites.length} returned`}
                />
                {voice.alignmentSummary ? (
                  <DataRow
                    label="Synthesis"
                    value={`${voice.alignmentSummary.status} · ${formatDate(
                      voice.alignmentSummary.generatedAt,
                    )}`}
                  />
                ) : (
                  <DataRow label="Synthesis" value="Not generated" />
                )}
              </DataList>
            </CardBody>
          </Card>

          {/* -------------------------------------------------------- Roadmap */}
          <Card id="roadmap">
            <CardHeader
              action={<AddRoadmapItemForm applicationId={params.id} />}
              description="What we are asking this ministry to close, with an owner and a date. This is the shortest path from where they are to the assessment they want — not a punishment list."
              title="Roadmap"
            />

            {roadmapItems.length > 0 ? (
              <CardBody>
                <Meter
                  label="Verified by SAVE"
                  tone="sage"
                  value={roadmapProgress.verifiedPct}
                  valueLabel={`${roadmapProgress.verified} of ${roadmapProgress.total} verified · ${roadmapProgress.open} open`}
                />
              </CardBody>
            ) : null}

            {roadmapItems.length > 0 ? (
              <div className="divide-y divide-hairline border-t border-hairline">
                {roadmapItems.map((item) => (
                  <div
                    className="flex flex-wrap items-start gap-4 px-6 py-4"
                    key={item.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-900">
                        {item.title}
                      </p>
                      {item.detail ? (
                        <p className="mt-1 max-w-prose text-caption leading-relaxed text-ink-500">
                          {item.detail}
                        </p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-ink-400">
                        {item.category ? (
                          <span className="capitalize">{item.category}</span>
                        ) : null}
                        {item.owner ? <span>Owner · {item.owner}</span> : null}
                        {item.due_date ? (
                          <span className="save-numeric">
                            Due {formatDate(item.due_date)}
                          </span>
                        ) : null}
                        <Badge
                          tone={
                            item.status === "verified"
                              ? "sage"
                              : item.status === "waived"
                                ? "neutral"
                                : item.status === "in_progress"
                                  ? "ink"
                                  : "clay"
                          }
                        >
                          {ROADMAP_STATUS_LABELS[item.status as RoadmapStatus]}
                        </Badge>
                      </div>
                    </div>
                    <RoadmapStatusControl
                      applicationId={params.id}
                      current={item.status}
                      itemId={item.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="Nothing has been asked of this ministry yet. Roadmap items usually come from the gaps a reviewer records against a category."
                title="No roadmap items"
              />
            )}

            <CardBody className="border-t border-hairline">
              {data.application.findings_shared_at ? (
                <Callout title="Findings are with the ministry" tone="sage">
                  Shared {formatDate(data.application.findings_shared_at)}. The
                  ministry can see its findings and this roadmap.
                </Callout>
              ) : (
                <Callout title="Findings are internal" tone="ink">
                  The ministry cannot see its findings or this roadmap yet.
                  Nothing reaches them until a reviewer shares it.
                </Callout>
              )}
              <div className="mt-3.5">
                <ShareFindingsControl
                  applicationId={params.id}
                  sharedAt={data.application.findings_shared_at}
                />
              </div>
            </CardBody>
          </Card>

          {/* ------------------------------------------------------- Decision */}
          <Card id="decision">
            <CardHeader
              description="Moving an application changes what the ministry sees. Publishing to donors is gated separately."
              title="Decision"
            />
            <CardBody className="space-y-5">
              {openFlags.length > 0 ? (
                <Callout
                  title={`${openFlags.length} unresolved risk ${
                    openFlags.length === 1 ? "flag" : "flags"
                  }`}
                  tone="clay"
                >
                  Resolve or record a resolution for each open flag before
                  approving this application.
                </Callout>
              ) : null}

              {data.application.decision ? (
                <Callout title="Recorded decision" tone="ink">
                  {getStatusLabel(data.application.decision)} on{" "}
                  {formatDate(data.application.decision_date)}
                  {data.application.decision_notes
                    ? ` — ${data.application.decision_notes}`
                    : ""}
                </Callout>
              ) : null}

              <StatusForm
                applicationId={params.id}
                current={data.application.status}
                options={STATUS_OPTIONS.map((status) => ({
                  label: getStatusLabel(status),
                  value: status,
                }))}
              />
            </CardBody>
            <CardFooter>
              <span className="text-caption text-ink-400">
                Last updated {formatDate(data.application.updated_at)}
              </span>
              <Btn
                href={`/applications/${params.id}/brief`}
                size="sm"
                variant="secondary"
              >
                {data.brief ? "Open donor brief" : "Create donor brief"}
              </Btn>
            </CardFooter>
          </Card>
        </div>

        {/* ------------------------------------------------------------ Rail */}
        <aside className="space-y-6">
          <Card>
            <CardHeader title="Assignment" />
            <CardBody>
              <div className="flex items-center gap-3.5">
                <Monogram
                  name={data.assignedReviewer ?? "Unassigned"}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">
                    {data.assignedReviewer ?? "Unassigned"}
                  </p>
                  <p className="text-caption text-ink-400">
                    {data.assignedReviewer
                      ? "Assigned reviewer"
                      : "No reviewer carrying this yet"}
                  </p>
                </div>
              </div>
              <Divider className="my-4" />
              <AssignReviewerForm
                applicationId={params.id}
                current={data.assignedReviewer}
                reviewers={data.reviewerOptions}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              action={
                data.notes.length > 0 ? (
                  <Badge tone="neutral">{data.notes.length}</Badge>
                ) : null
              }
              title="Reviewer notes"
            />
            <CardBody>
              <NoteForm applicationId={params.id} />
            </CardBody>
            {data.notes.length > 0 ? (
              <div className="divide-y divide-hairline border-t border-hairline">
                {data.notes.map((note) => (
                  <div className="px-6 py-3.5" key={note.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-caption font-semibold text-ink-900">
                        {note.reviewerEmail ?? "Unknown reviewer"}
                      </p>
                      <span className="save-numeric text-micro text-ink-400">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    {note.section ? (
                      <p className="mt-0.5 text-micro uppercase tracking-[0.08em] text-ink-400">
                        {note.section}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-caption leading-relaxed text-ink-600">
                      {note.note}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="Donor brief" />
            <CardBody>
              {data.brief ? (
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-ink-900">
                    {data.brief.headline ?? "Untitled brief"}
                  </p>
                  <p className="text-caption leading-relaxed text-ink-500">
                    {data.brief.ministry_description ??
                      "No description written yet."}
                  </p>
                  <Badge tone={data.brief.published ? "sage" : "neutral"}>
                    {data.brief.published ? "Published to donors" : "Draft"}
                  </Badge>

                  <div className="pt-1">
                    <BriefApprovalControls
                      applicationId={params.id}
                      approvedAt={data.brief.approved_at}
                      approvedByEmail={data.briefApproverEmail}
                      isAuthor={data.brief.generated_by === viewer.userId}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-caption leading-relaxed text-ink-500">
                  No donor brief has been generated for this application yet.
                </p>
              )}
              <Btn
                className="mt-3.5 w-full"
                href={`/applications/${params.id}/brief`}
                size="sm"
                variant="secondary"
              >
                {data.brief ? "Open brief editor" : "Create brief"}
              </Btn>
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">Organization</p>
            <div className="mt-3">
              <DataList>
                <DataRow
                  label="Entity type"
                  value={data.organization.entity_type ?? "—"}
                />
                <DataRow label="EIN" value={data.organization.ein ?? "—"} />
                <DataRow
                  label="Founded"
                  value={data.organization.year_founded ?? "—"}
                />
                <DataRow
                  label="Website"
                  value={
                    data.organization.website_url ? (
                      <Link
                        className="underline decoration-hairline underline-offset-4"
                        href={data.organization.website_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Visit
                      </Link>
                    ) : (
                      "—"
                    )
                  }
                />
              </DataList>
            </div>
            {isAdmin ? (
              <LibraryVisibilityToggle
                organizationId={data.organization.id}
                visible={data.organization.library_visible}
              />
            ) : null}
          </Card>
        </aside>
      </div>
    </StaffShell>
  );
}
