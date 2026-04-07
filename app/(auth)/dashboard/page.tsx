import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  getDashboardData,
  getScoreTone,
  getSeverityClass,
  getStatusLabel,
  getStatusPillClass,
} from "@/lib/review";

type DashboardPageProps = {
  searchParams?: {
    flagSeverity?: string;
    scoreRange?: string;
    status?: string;
  };
};

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-[#C09A45]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default async function InternalDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const data = await getDashboardData(searchParams ?? {});

  return (
    <main className="min-h-screen bg-[#0B1622] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(192,154,69,0.18),rgba(11,22,34,0.2)_35%,rgba(76,125,155,0.16))] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-[#C09A45]">
            Internal Review
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Application dashboard</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-300">
                Review applications, triage flags, and move ministries through
                inquiry, vetting, and final decisions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
              >
                <Link href="/dashboard">Reset filters</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard label="Total Applications" value={data.summary.total} />
          <SummaryCard label="Under Review" value={data.summary.underReview} />
          <SummaryCard label="Approved" value={data.summary.approved} />
          <SummaryCard
            label="Pending Inquiry"
            value={data.summary.pendingInquiry}
          />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
          <form className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Status</label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
                defaultValue={data.filters.status ?? "all"}
                name="status"
              >
                {[
                  ["all", "All statuses"],
                  ["inquiry_submitted", "Pending inquiry"],
                  ["inquiry_approved", "Inquiry approved"],
                  ["vetting_submitted", "Vetting submitted"],
                  ["under_review", "Under review"],
                  ["approved", "Approved"],
                  ["declined", "Declined"],
                  ["hard_stop", "Hard stop"],
                  ["more_info_requested", "More info requested"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Score range</label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
                defaultValue={data.filters.scoreRange ?? "all"}
                name="scoreRange"
              >
                {[
                  ["all", "All scores"],
                  ["80_plus", "80 and above"],
                  ["60_79", "60 to 79"],
                  ["below_60", "Below 60"],
                  ["unscored", "Unscored"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Flag severity</label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
                defaultValue={data.filters.flagSeverity ?? "all"}
                name="flagSeverity"
              >
                {[
                  ["all", "All flags"],
                  ["any", "Any flag"],
                  ["hard_stop", "Hard stop"],
                  ["high", "High"],
                  ["medium", "Medium"],
                  ["low", "Low"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                className="w-full bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
                type="submit"
              >
                Apply filters
              </Button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.04] text-slate-300">
                <tr>
                  <th className="px-5 py-4">Organization name</th>
                  <th className="px-5 py-4">EIN</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Flags</th>
                  <th className="px-5 py-4">Submitted date</th>
                  <th className="px-5 py-4">Assigned reviewer</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data.rows.map((row) => (
                  <tr key={row.application.id} className="bg-[#102133]/50">
                    <td className="px-5 py-4">
                      <Link
                        className="font-medium text-white transition hover:text-[#F4E3B2]"
                        href={`/applications/${row.application.id}`}
                      >
                        {row.organization.legal_name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {row.organization.ein ?? "Not provided"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusPillClass(
                          row.application.status,
                        )}`}
                      >
                        {getStatusLabel(row.application.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold ${getScoreTone(
                          row.latestScore?.total_score ?? null,
                        )}`}
                      >
                        {row.latestScore?.total_score ?? "Not scored"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {row.flagCount > 0 ? (
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityClass(
                            row.highestSeverity ?? "low",
                          )}`}
                        >
                          {row.flagCount}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {new Date(
                        row.application.created_at,
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      {row.assignedReviewer ?? "Unassigned"}
                    </td>
                    <td className="px-5 py-4">
                      <Button asChild size="sm">
                        <Link href={`/applications/${row.application.id}`}>
                          Open
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {data.rows.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-10 text-center text-slate-400"
                      colSpan={8}
                    >
                      No applications matched the current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
