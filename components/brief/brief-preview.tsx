import {
  DILIGENCE_CHECKLIST,
  getBriefRationale,
  getOrganizationLocation,
  getRecommendationBadgeClass,
  type BriefFormData,
} from "@/lib/brief-shared";
import type { DonorBrief, Organizations } from "@/lib/supabase/types";

type BriefPreviewProps = {
  brief: Pick<
    DonorBrief,
    "generated_at" | "headline" | "recommendation_level"
  > &
    BriefFormData;
  org: Organizations;
  publicView?: boolean;
};

export function BriefPreview({
  brief,
  org,
  publicView = false,
}: BriefPreviewProps) {
  const commendations = brief.commendations.filter((item) => item.trim());
  const cautions = brief.cautions.filter((item) => item.trim());
  const reviewedDate = brief.generated_at
    ? new Date(brief.generated_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <article
      className={`mx-auto w-full max-w-[880px] rounded-[2rem] border p-8 shadow-[0_20px_80px_rgba(3,8,14,0.18)] ${
        publicView
          ? "border-slate-200 bg-white text-slate-900 print:border-0 print:shadow-none"
          : "border-white/10 bg-[linear-gradient(180deg,#ffffff_0%,#f6efe1_22%,#ffffff_100%)] text-slate-900"
      }`}
    >
      <header className="flex flex-col gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="inline-flex items-center gap-3">
            <div className="rounded-full border border-[#C09A45]/30 bg-[#0B1622] px-4 py-2 text-sm font-semibold tracking-[0.4em] text-[#F4E3B2]">
              SAVE
            </div>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getRecommendationBadgeClass(
                brief.recommendation_level,
              )}`}
            >
              {brief.recommendation_level}
            </span>
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-slate-950">
            {brief.headline || org.legal_name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {brief.ministry_description ||
              "A donor-facing summary has not been added yet."}
          </p>
        </div>

        <dl className="grid gap-3 text-sm text-slate-700 md:min-w-[280px]">
          <div className="flex items-start justify-between gap-4">
            <dt className="font-medium text-slate-500">Organization</dt>
            <dd className="text-right font-semibold">{org.legal_name}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-medium text-slate-500">EIN</dt>
            <dd className="text-right">{org.ein ?? "Not provided"}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-medium text-slate-500">Location</dt>
            <dd className="text-right">{getOrganizationLocation(org)}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-medium text-slate-500">Founded</dt>
            <dd className="text-right">{org.year_founded ?? "Not provided"}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-medium text-slate-500">Focus areas</dt>
            <dd className="max-w-[180px] text-right">
              {org.primary_focus.length > 0
                ? org.primary_focus.join(", ")
                : "Not provided"}
            </dd>
          </div>
        </dl>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
        <section className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Ministry Summary
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-slate-700">
              {brief.ministry_description ||
                "This brief is awaiting a final ministry summary."}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              What we found commendable
            </h2>
            <ul className="mt-4 space-y-3 text-[15px] leading-7 text-slate-700">
              {commendations.length > 0 ? (
                commendations.map((item, index) => (
                  <li className="flex gap-3" key={`${item}-${index}`}>
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#C09A45]" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500">
                  Add commendations to complete this section.
                </li>
              )}
            </ul>
          </div>

          {cautions.length > 0 ? (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Areas for donor awareness
              </h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-7 text-slate-700">
                {cautions.map((item, index) => (
                  <li className="flex gap-3" key={`${item}-${index}`}>
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#8A5E3C]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="space-y-8">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Diligence Completed
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-700">
              {DILIGENCE_CHECKLIST.map((item) => (
                <li className="flex items-center gap-3" key={item}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-[#C09A45]/20 bg-[#f9f1dd] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8A6420]">
              Recommendation
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              {brief.recommendation_level}
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-slate-700">
              {getBriefRationale(brief.recommendation_level, cautions)}
            </p>
          </div>
        </section>
      </div>

      <footer className="mt-8 border-t border-slate-200 pt-6 text-sm leading-6 text-slate-500">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>Reviewed date: {reviewedDate}</p>
          <p>SAVE team</p>
        </div>
        <p className="mt-3">
          This brief is a donor guidance summary based on information reviewed
          by SAVE and should be considered alongside a donor&apos;s own
          diligence and prayerful judgment.
        </p>
      </footer>
    </article>
  );
}
