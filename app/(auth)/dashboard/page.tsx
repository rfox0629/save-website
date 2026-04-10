import Link from "next/link";

import { ViewModeSwitcher } from "@/components/app/view-mode-switcher";
import { Button } from "@/components/ui/button";
import {
  getDashboardData,
  getStatusLabel,
} from "@/lib/review";
import type { Applications, RiskFlag } from "@/lib/supabase/types";
import { getViewerContext } from "@/lib/view-mode";

type DashboardPageProps = {
  searchParams?: {
    flagSeverity?: string;
    scoreRange?: string;
    status?: string;
  };
};

function getDashboardStatusPillClass(status: Applications["status"]) {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "under_review" || status === "inquiry_approved") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  if (status === "declined" || status === "hard_stop") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (status === "more_info_requested") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-stone-200 bg-stone-50 text-stone-700";
}

function getDashboardScoreTone(score: number | null) {
  if (score === null) {
    return "text-[#7A867D]";
  }

  if (score >= 80) {
    return "text-emerald-700";
  }

  if (score >= 60) {
    return "text-amber-700";
  }

  return "text-rose-700";
}

function getDashboardSeverityClass(severity: RiskFlag["severity"]) {
  if (severity === "hard_stop") {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (severity === "high") {
    return "border-orange-200 bg-orange-50 text-orange-800";
  }

  if (severity === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-stone-200 bg-stone-50 text-stone-700";
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-[#E5DED0] bg-white p-5 shadow-[0_16px_40px_rgba(27,77,53,0.05)]">
      <p className="text-xs uppercase tracking-[0.28em] text-[#8B7A57]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-[#1B4D35]">{value}</p>
    </div>
  );
}

export default async function InternalDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const [data, viewer] = await Promise.all([
    getDashboardData(searchParams ?? {}),
    getViewerContext(),
  ]);

  return (
    <main className="min-h-screen bg-[#F7F6F2] px-6 py-10 text-[#1B4D35]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-[#E5DED0] bg-[#FFFDF8] p-8 shadow-[0_24px_60px_rgba(27,77,53,0.06)]">
          <p className="text-xs uppercase tracking-[0.35em] text-[#8B7A57]">
            Internal Review
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#1B4D35]">
                Application dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-[#5E6C62]">
                Review applications, triage flags, and move ministries through
                inquiry, vetting, and final decisions.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ViewModeSwitcher
                canPreview={viewer.canPreview}
                currentViewMode={viewer.currentViewMode}
              />
              <Button
                asChild
                className="border border-[#D9C8A4] bg-[#F4EFE4] text-[#6F5D34] hover:bg-[#EEE5D4]"
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

        <section className="rounded-[2rem] border border-[#E5DED0] bg-white p-6 shadow-[0_16px_40px_rgba(27,77,53,0.05)]">
          <form className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm text-[#5E6C62]">Status</label>
              <select
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
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
              <label className="text-sm text-[#5E6C62]">Score range</label>
              <select
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
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
              <label className="text-sm text-[#5E6C62]">Flag severity</label>
              <select
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
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
                className="w-full bg-[#1B4D35] text-white hover:bg-[#236645]"
                type="submit"
              >
                Apply filters
              </Button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-[#E5DED0] bg-white shadow-[0_16px_40px_rgba(27,77,53,0.05)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#ECE4D7] text-left text-sm">
              <thead className="bg-[#FBF8F2] text-[#5E6C62]">
                <tr>
                  <th className="px-5 py-4 font-medium">Organization name</th>
                  <th className="px-5 py-4 font-medium">EIN</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Score</th>
                  <th className="px-5 py-4 font-medium">Flags</th>
                  <th className="px-5 py-4 font-medium">Submitted date</th>
                  <th className="px-5 py-4 font-medium">Assigned reviewer</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE4D7] bg-white">
                {data.rows.map((row) => (
                  <tr
                    key={row.application.id}
                    className="transition-colors hover:bg-[#FBF8F2]"
                  >
                    <td className="px-5 py-4">
                      <Link
                        className="font-medium text-[#1B4D35] transition hover:text-[#2B6B4A]"
                        href={`/applications/${row.application.id}`}
                      >
                        {row.organization.legal_name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[#617367]">
                      {row.organization.ein ?? "Not provided"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getDashboardStatusPillClass(
                          row.application.status,
                        )}`}
                      >
                        {getStatusLabel(row.application.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold ${getDashboardScoreTone(
                          row.latestScore?.total_score ?? null,
                        )}`}
                      >
                        {row.latestScore?.total_score ?? "Not scored"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {row.flagCount > 0 ? (
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getDashboardSeverityClass(
                            row.highestSeverity ?? "low",
                          )}`}
                        >
                          {row.flagCount}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-[#E5DED0] bg-[#FBF8F2] px-3 py-1 text-xs text-[#617367]">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#617367]">
                      {new Date(
                        row.application.created_at,
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-[#617367]">
                      {row.assignedReviewer ?? "Unassigned"}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        asChild
                        size="sm"
                        className="bg-[#1B4D35] text-white hover:bg-[#236645]"
                      >
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
                      className="px-5 py-10 text-center text-[#7A867D]"
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
