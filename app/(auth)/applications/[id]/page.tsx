import Link from "next/link";

import {
  assignReviewerAction,
  quickActionAndRedirect,
} from "@/app/actions/review";
import {
  DocumentReviewButton,
  ExternalChecksManager,
  NotesManager,
  OverrideScoreDialog,
  ResolveFlagDialog,
} from "@/components/dashboard/review-tools";
import { Button } from "@/components/ui/button";
import {
  getApplicationDetail,
  getRecommendationLevel,
  getScoreTone,
  getSeverityClass,
  getStatusLabel,
  getStatusPillClass,
} from "@/lib/review";

type ApplicationDetailPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    tab?: string;
  };
};

const TABS = [
  "overview",
  "score",
  "flags",
  "documents",
  "external",
  "notes",
  "brief",
] as const;

const CATEGORY_MAX = {
  doctrine: 15,
  external: 10,
  financial: 20,
  fruit: 20,
  governance: 15,
  leadership: 20,
} as const;

function ScoreDonut({
  segments,
  total,
}: {
  segments: { color: string; max: number; score: number }[];
  total: number;
}) {
  const cumulative = segments.reduce<number[]>((acc, segment, index) => {
    const previous = acc[index - 1] ?? 0;
    acc.push(previous + segment.max);
    return acc;
  }, []);

  const gradient = segments
    .map((segment, index) => {
      const start = index === 0 ? 0 : (cumulative[index - 1]! / 100) * 100;
      const end = (cumulative[index]! / 100) * 100;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-[#0B1622]">
      <div
        className="absolute inset-3 rounded-full"
        style={{
          background: `conic-gradient(${gradient})`,
        }}
      />
      <div className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#0B1622]">
        <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Score
        </span>
        <span className="mt-2 text-3xl font-semibold text-white">{total}</span>
      </div>
    </div>
  );
}

function TabLink({
  applicationId,
  currentTab,
  label,
  tab,
}: {
  applicationId: string;
  currentTab: string;
  label: string;
  tab: string;
}) {
  const active = currentTab === tab;

  return (
    <Link
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-[#C09A45]/30 bg-[#C09A45]/15 text-[#F4E3B2]"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white"
      }`}
      href={`/applications/${applicationId}?tab=${tab}`}
    >
      {label}
    </Link>
  );
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: ApplicationDetailPageProps) {
  const activeTab = TABS.includes(
    (searchParams?.tab ?? "overview") as (typeof TABS)[number],
  )
    ? ((searchParams?.tab as (typeof TABS)[number]) ?? "overview")
    : "overview";
  const data = await getApplicationDetail(params.id);
  const scoreByCategory = {
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

  return (
    <main className="min-h-screen bg-[#0B1622] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              className="text-sm text-[#C09A45] hover:text-[#F4E3B2]"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">
              {data.organization.legal_name}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Application {data.application.id.slice(0, 8)} for internal review.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusPillClass(
                data.application.status,
              )}`}
            >
              {getStatusLabel(data.application.status)}
            </span>
          </div>
        </div>

        <nav className="sticky top-4 z-20 flex flex-wrap gap-3 rounded-[2rem] border border-white/10 bg-[#102133]/95 p-3 backdrop-blur">
          <TabLink
            applicationId={params.id}
            currentTab={activeTab}
            label="Overview"
            tab="overview"
          />
          <TabLink
            applicationId={params.id}
            currentTab={activeTab}
            label="Score"
            tab="score"
          />
          <TabLink
            applicationId={params.id}
            currentTab={activeTab}
            label="Flags"
            tab="flags"
          />
          <TabLink
            applicationId={params.id}
            currentTab={activeTab}
            label="Documents"
            tab="documents"
          />
          <TabLink
            applicationId={params.id}
            currentTab={activeTab}
            label="External Checks"
            tab="external"
          />
          <TabLink
            applicationId={params.id}
            currentTab={activeTab}
            label="Notes"
            tab="notes"
          />
          <TabLink
            applicationId={params.id}
            currentTab={activeTab}
            label="Brief"
            tab="brief"
          />
        </nav>

        {activeTab === "overview" ? (
          <section className="grid gap-6 lg:grid-cols-[340px,1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <ScoreDonut
                segments={data.scoreSegments}
                total={data.scoreSummary.total}
              />
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Recommendation</span>
                  <span
                    className={getScoreTone(
                      data.latestScore?.total_score ?? null,
                    )}
                  >
                    {getRecommendationLevel(data.latestScore)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Assigned reviewer</span>
                  <span className="text-white">
                    {data.assignedReviewer ?? "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Entity type</span>
                  <span className="text-white">
                    {data.organization.entity_type ?? "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">EIN</span>
                  <span className="text-white">
                    {data.organization.ein ?? "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#C09A45]">
                    Organization
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {data.organization.legal_name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {data.organization.entity_type ??
                      "Entity type not provided"}
                  </p>
                </div>
                <div className="space-y-2 rounded-3xl border border-white/10 bg-[#0B1622]/70 p-5">
                  <p className="text-sm text-slate-300">Quick actions</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      ["approved", "Approve"],
                      ["declined", "Decline"],
                      ["more_info_requested", "Request More Info"],
                    ].map(([status, label]) => (
                      <form action={quickActionAndRedirect} key={status}>
                        <input
                          name="application_id"
                          type="hidden"
                          value={params.id}
                        />
                        <input name="status" type="hidden" value={status} />
                        <Button
                          className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                          type="submit"
                        >
                          {label}
                        </Button>
                      </form>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold">Assign reviewer</h3>
                <form
                  action={assignReviewerAction}
                  className="mt-4 flex flex-col gap-4 md:flex-row"
                >
                  <input
                    name="application_id"
                    type="hidden"
                    value={params.id}
                  />
                  <select
                    className="flex-1 rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
                    defaultValue=""
                    name="reviewer_id"
                  >
                    <option disabled value="">
                      Select reviewer
                    </option>
                    {data.reviewerOptions.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.email} ({reviewer.role})
                      </option>
                    ))}
                  </select>
                  <Button
                    className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                    type="submit"
                  >
                    Assign Reviewer
                  </Button>
                </form>
              </div>

              {data.application.ai_summary ? (
                <div className="rounded-[2rem] border border-emerald-300/20 bg-[#E7F3EA] p-6 text-[#1B4D35]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-emerald-700/15 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2E6A45]">
                      AI Analyst Summary
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-[#5A7C64]">
                      Generated by AI — requires human review before publishing
                    </span>
                  </div>
                  <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#204B34]">
                    {data.application.ai_summary}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {activeTab === "score" ? (
          <section className="space-y-4">
            {(
              [
                "leadership",
                "doctrine",
                "governance",
                "financial",
                "fruit",
                "external",
              ] as const
            ).map((category) => (
              <details
                key={category}
                className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
                open
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#C09A45]">
                      Category
                    </p>
                    <h3 className="mt-2 text-xl font-semibold capitalize">
                      {category}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-lg font-semibold ${getScoreTone(scoreByCategory[category])}`}
                    >
                      {scoreByCategory[category]} / {CATEGORY_MAX[category]}
                    </span>
                    <OverrideScoreDialog
                      applicationId={params.id}
                      category={category}
                      currentScore={scoreByCategory[category]}
                      maxScore={CATEGORY_MAX[category]}
                    />
                  </div>
                </summary>
                <div className="mt-6 space-y-3">
                  {(componentsByCategory[category] ?? []).map((component) => (
                    <div
                      key={component.id}
                      className="rounded-3xl border border-white/10 bg-[#0B1622]/70 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-white">
                          {component.criterion}
                        </p>
                        <p className="text-sm text-slate-300">
                          {component.awarded_points} / {component.max_points}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {component.rationale ?? "No rationale recorded."}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </section>
        ) : null}

        {activeTab === "flags" ? (
          <section className="space-y-4">
            {data.flags.map((flag) => (
              <article
                key={flag.id}
                className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getSeverityClass(
                          flag.severity,
                        )}`}
                      >
                        {flag.severity}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        {flag.category}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        {flag.flag_code}
                      </span>
                    </div>
                    <p className="text-white">{flag.description}</p>
                    <p className="text-sm text-slate-400">
                      {flag.resolved
                        ? `Resolved ${flag.resolved_at ? new Date(flag.resolved_at).toLocaleDateString() : ""}`
                        : "Open flag"}
                    </p>
                  </div>
                  {!flag.resolved ? (
                    <ResolveFlagDialog
                      applicationId={params.id}
                      flagId={flag.id}
                    />
                  ) : null}
                </div>
              </article>
            ))}
            {data.flags.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center text-slate-300">
                No flags recorded for this application.
              </div>
            ) : null}
          </section>
        ) : null}

        {activeTab === "documents" ? (
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/[0.04] text-slate-300">
                  <tr>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Filename</th>
                    <th className="px-5 py-4">Upload date</th>
                    <th className="px-5 py-4">Reviewed</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.documents.map((document) => (
                    <tr key={document.id} className="bg-[#102133]/50">
                      <td className="px-5 py-4 text-white">
                        {document.document_type}
                      </td>
                      <td className="px-5 py-4">
                        {document.signedUrl ? (
                          <a
                            className="text-[#F4E3B2] hover:text-white"
                            href={document.signedUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {document.file_name}
                          </a>
                        ) : (
                          <span className="text-slate-300">
                            {document.file_name}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {new Date(document.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {document.reviewed ? "Yes" : "No"}
                      </td>
                      <td className="px-5 py-4">
                        <DocumentReviewButton
                          applicationId={params.id}
                          documentId={document.id}
                          reviewed={document.reviewed}
                        />
                      </td>
                    </tr>
                  ))}
                  {data.documents.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-10 text-center text-slate-400"
                        colSpan={5}
                      >
                        No uploaded documents yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "external" ? (
          <section>
            <ExternalChecksManager
              applicationId={params.id}
              checks={data.externalChecks}
            />
          </section>
        ) : null}

        {activeTab === "notes" ? (
          <section className="space-y-6">
            <NotesManager applicationId={params.id} />
            <div className="space-y-4">
              {data.notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium text-white">
                      {note.reviewerEmail ?? "Unknown reviewer"}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                      {note.section ?? "general"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-4 text-slate-200">{note.note}</p>
                </article>
              ))}
              {data.notes.length === 0 ? (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center text-slate-300">
                  No notes yet.
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {activeTab === "brief" ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            {data.brief ? (
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-[#C09A45]">
                  Donor brief
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {data.brief.headline ?? "Untitled brief"}
                </h2>
                <p className="text-slate-300">
                  {data.brief.ministry_description ??
                    "No description provided."}
                </p>
                <Button
                  asChild
                  className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                >
                  <Link href={`/applications/${params.id}/brief`}>
                    Open brief editor
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-slate-300">
                  No donor brief has been generated for this application yet.
                </div>
                <Button
                  asChild
                  className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                >
                  <Link href={`/applications/${params.id}/brief`}>
                    Create brief
                  </Link>
                </Button>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
