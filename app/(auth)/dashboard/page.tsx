import Link from "next/link";

import { ViewModeSwitcher } from "@/components/app/view-mode-switcher";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { StaffShell } from "@/components/dashboard/staff-shell";
import {
  Badge,
  Btn,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Monogram,
  PageTitle,
  Stat,
  StatRow,
  Table,
  Td,
  Th,
  formatDate,
} from "@/components/save/primitives";
import { TopBar } from "@/components/save/shell";
import {
  getDashboardData,
  getReviewerOptions,
  getStatusLabel,
} from "@/lib/review";
import type { Applications } from "@/lib/supabase/types";
import { getViewerContext } from "@/lib/view-mode";
import { cn } from "@/lib/utils";

type DashboardPageProps = {
  searchParams?: {
    flagSeverity?: string;
    scoreRange?: string;
    status?: string;
  };
};

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

function statusTone(status: Applications["status"]) {
  if (status === "approved") return "sage" as const;
  if (status === "declined" || status === "hard_stop") return "risk" as const;
  if (status === "under_review" || status === "inquiry_approved")
    return "ink" as const;
  if (status === "more_info_requested") return "brass" as const;
  return "neutral" as const;
}

function daysSince(value: string | null | undefined) {
  if (!value) return null;
  const then = Date.parse(value);
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000));
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const [data, viewer, reviewers] = await Promise.all([
    getDashboardData({
      flagSeverity: searchParams?.flagSeverity,
      scoreRange: searchParams?.scoreRange,
      status: searchParams?.status,
    }),
    getViewerContext(),
    getReviewerOptions(),
  ]);

  const unassigned = data.rows.filter((row) => !row.assignedReviewer);
  const activeStatus = searchParams?.status ?? "";

  const reviewerLoad = reviewers.map((reviewer) => ({
    ...reviewer,
    active: data.rows.filter((row) => row.assignedReviewer === reviewer.email)
      .length,
  }));

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
          breadcrumb={[{ label: "Queue" }]}
          status={
            unassigned.length > 0 ? (
              <Badge tone="clay">{unassigned.length} unassigned</Badge>
            ) : null
          }
        />
      }
    >
      <PageTitle
        description="Every application SAVE is currently carrying, and who is carrying it."
        eyebrow="Operations"
      >
        Application queue
      </PageTitle>

      <div className="mt-8">
        <StatRow>
          <Stat
            caption={`${unassigned.length} awaiting a reviewer`}
            label="In queue"
            value={data.summary.total}
          />
          <Stat label="Under review" value={data.summary.underReview} />
          <Stat label="Pending inquiry" value={data.summary.pendingInquiry} />
          <Stat
            caption="Assessment completed"
            label="Approved"
            value={data.summary.approved}
          />
        </StatRow>
      </div>

      <div className="mt-8 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              action={
                <form className="flex gap-2.5" method="get">
                  <select
                    aria-label="Filter by status"
                    className="save-focus-ring h-9 rounded-md border border-hairline bg-paper-50 px-3 text-caption font-medium text-ink-700"
                    defaultValue={activeStatus}
                    name="status"
                  >
                    <option value="">All statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <Btn size="sm" type="submit" variant="secondary">
                    Filter
                  </Btn>
                </form>
              }
              title="Applications"
            />
            {data.rows.length === 0 ? (
              <CardBody>
                <p className="py-8 text-center text-caption text-ink-400">
                  No applications match this view.
                </p>
              </CardBody>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Ministry</Th>
                    <Th>Status</Th>
                    <Th>Reviewer</Th>
                    <Th align="right">Days</Th>
                    <Th align="right">Flags</Th>
                    <Th align="right">Score</Th>
                    <Th align="right" />
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => {
                    const days = daysSince(row.application.created_at);
                    const score = row.latestScore?.total_score ?? null;
                    return (
                      <tr
                        className="transition hover:bg-paper-100"
                        key={row.application.id}
                      >
                        <Td>
                          <div className="flex items-center gap-3">
                            <Monogram
                              name={row.organization.legal_name}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink-900">
                                {row.organization.dba_name ||
                                  row.organization.legal_name}
                              </p>
                              <p className="save-numeric text-caption text-ink-400">
                                {row.application.id.slice(0, 8)} ·{" "}
                                {formatDate(row.application.created_at)}
                              </p>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <Badge tone={statusTone(row.application.status)}>
                            {getStatusLabel(row.application.status)}
                          </Badge>
                        </Td>
                        <Td>
                          {row.assignedReviewer ? (
                            <span className="text-ink-700">
                              {row.assignedReviewer}
                            </span>
                          ) : (
                            <Badge tone="clay">Unassigned</Badge>
                          )}
                        </Td>
                        <Td align="right" numeric>
                          <span
                            className={cn(
                              days !== null && days > 90 && "text-clay-700",
                            )}
                          >
                            {days ?? "—"}
                          </span>
                        </Td>
                        <Td align="right" numeric>
                          {row.flagCount > 0 ? (
                            <Badge
                              tone={
                                row.highestSeverity === "hard_stop" ||
                                row.highestSeverity === "high"
                                  ? "risk"
                                  : "clay"
                              }
                            >
                              {row.flagCount}
                            </Badge>
                          ) : (
                            <span className="text-ink-300">—</span>
                          )}
                        </Td>
                        <Td align="right" numeric>
                          {score !== null ? (
                            <span className="font-semibold text-ink-900">
                              {score}
                            </span>
                          ) : (
                            <span className="text-ink-300">—</span>
                          )}
                        </Td>
                        <Td align="right">
                          <Btn
                            href={`/applications/${row.application.id}`}
                            size="sm"
                            variant="secondary"
                          >
                            Open
                          </Btn>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
            <CardFooter>
              <span className="save-numeric text-caption text-ink-400">
                {data.rows.length} shown · {unassigned.length} unassigned
              </span>
            </CardFooter>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader
              description="Active assignments per SAVE reviewer."
              title="Reviewers"
            />
            <CardBody className="space-y-4">
              {reviewerLoad.length === 0 ? (
                <p className="text-caption text-ink-400">
                  No reviewers provisioned yet.
                </p>
              ) : (
                reviewerLoad.map((reviewer) => (
                  <div className="flex items-center gap-3" key={reviewer.id}>
                    <Monogram name={reviewer.email} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-caption font-semibold text-ink-900">
                        {reviewer.email}
                      </p>
                      <p className="truncate text-micro uppercase tracking-[0.08em] text-ink-400">
                        {reviewer.role}
                      </p>
                    </div>
                    <span className="save-numeric shrink-0 text-caption font-semibold text-ink-700">
                      {reviewer.active} active
                    </span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card className="p-6" tone="sunken">
            <p className="text-sm font-semibold text-ink-900">Route map</p>
            <p className="mt-2 text-caption leading-relaxed text-ink-500">
              Open an application to review evidence, scoring, external checks,
              voice alignment and the decision.
            </p>
            <Link
              className="save-focus-ring mt-3.5 inline-flex rounded-md text-caption font-semibold text-ink-700 underline decoration-hairline underline-offset-4 hover:text-ink-900"
              href="/map"
            >
              Internal route directory
            </Link>
          </Card>
        </aside>
      </div>
    </StaffShell>
  );
}
