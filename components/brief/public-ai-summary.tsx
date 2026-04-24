import { parseReviewerSummary } from "@/lib/ai/reviewerSummary";
import type { PublicVoiceAlignmentData } from "@/lib/brief";
import type { Applications, ExternalCheck, Organizations } from "@/lib/supabase/types";

function getRecommendationBadgeClass(recommendation: string) {
  if (recommendation === "advance") {
    return "border-blue-200 bg-blue-50 text-blue-900";
  }

  if (recommendation === "needs_review") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-rose-200 bg-rose-50 text-rose-900";
}

function formatRecommendation(recommendation: string) {
  return recommendation
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatConfidence(confidence: string) {
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
}

function getCheckSummary(checks: ExternalCheck[], source: string) {
  const check = checks.find((item) => item.source === source);

  if (!check) {
    return null;
  }

  return {
    status: check.status,
    summary: check.summary ?? "No summary available.",
  };
}

function getCharityNavigatorSignal(checks: ExternalCheck[]) {
  const check = checks.find((item) => item.source === "charity_navigator");

  if (!check) {
    return null;
  }

  const raw =
    check.raw_result &&
    typeof check.raw_result === "object" &&
    !Array.isArray(check.raw_result)
      ? (check.raw_result as Record<string, unknown>)
      : null;

  return {
    label: "Charity Navigator",
    status:
      typeof raw?.status === "string"
        ? raw.status
        : check.status === "pass"
          ? "found"
          : check.status,
    summary:
      typeof raw?.note === "string"
        ? raw.note
        : (check.summary ?? "No summary available."),
  };
}

function SignalCard({
  label,
  status,
  summary,
}: {
  label: string;
  status: string;
  summary: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#E3DCCF] bg-[#FCFAF5] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7088A5]">
          {label}
        </h4>
        <span className="rounded-full border border-[#E3DCCF] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#4F6357]">
          {status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-[#475A4F]">{summary}</p>
    </div>
  );
}

function getVoiceAlignmentBadgeClass(status: PublicVoiceAlignmentData["status"]) {
  if (status === "aligned") {
    return "border-blue-200 bg-blue-50 text-blue-900";
  }

  if (status === "partially_aligned") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-rose-200 bg-rose-50 text-rose-900";
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function PublicAiSummary({
  application,
  externalChecks,
  org,
  voiceAlignment,
}: {
  application: Applications;
  externalChecks: ExternalCheck[];
  org: Organizations;
  voiceAlignment?: PublicVoiceAlignmentData | null;
}) {
  const summary = parseReviewerSummary(application.ai_summary);

  if (!summary && !voiceAlignment) {
    return null;
  }

  const signals = [
    (() => {
      const irs = getCheckSummary(externalChecks, "irs_teos");
      return irs
        ? {
            label: "IRS",
            status: irs.status,
            summary: irs.summary,
          }
        : null;
    })(),
    getCharityNavigatorSignal(externalChecks),
    (() => {
      const website = getCheckSummary(externalChecks, "website");
      return website
        ? {
            label: "Website",
            status: website.status,
            summary: website.summary,
          }
        : null;
    })(),
    (() => {
      const reputation = getCheckSummary(externalChecks, "news_search");
      return reputation
        ? {
            label: "Reputation",
            status: reputation.status,
            summary: reputation.summary,
          }
        : null;
    })(),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <article className="mx-auto mt-8 w-full max-w-4xl rounded-[32px] border border-[#E3DCCF] bg-white px-6 py-8 text-[#0E2E5C] shadow-[0_20px_60px_rgba(26,68,128,0.06)] md:px-10 md:py-10 print:mt-0 print:max-w-none print:break-inside-avoid-page print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none">
      <header className="border-b border-[#E8E0D2] pb-8 print:break-inside-avoid-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7088A5]">
              Relational Discernment
            </p>
            <h2 className="text-[30px] leading-tight text-[#1A4480]">
              {org.legal_name}
            </h2>
          </div>
          {summary ? (
            <span
              className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${getRecommendationBadgeClass(
                summary.recommendation,
              )}`}
            >
              {formatRecommendation(summary.recommendation)}
            </span>
          ) : null}
        </div>
      </header>

      <div className="space-y-10 py-10 print:space-y-8">
        {summary ? (
          <>
            <section className="print:break-inside-avoid-page">
              <h3 className="text-xl font-semibold text-[#1A4480]">
                Executive Summary
              </h3>
              <p className="mt-4 text-[15px] leading-8 text-[#475A4F]">
                {summary.executive_summary}
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-2 print:break-inside-avoid-page">
              <div className="rounded-[28px] border border-[#D8E5F6] bg-[#F7FBF8] p-6 print:break-inside-avoid-page">
                <h3 className="text-lg font-semibold text-[#1A4480]">Strengths</h3>
                <ul className="mt-4 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                  {summary.top_strengths.map((item) => (
                    <li className="ml-5 list-disc pl-1" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[28px] border border-[#E8DDCB] bg-[#FDF8EF] p-6 print:break-inside-avoid-page">
                <h3 className="text-lg font-semibold text-[#1A4480]">Risks</h3>
                <ul className="mt-4 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                  {summary.top_risks.map((item) => (
                    <li className="ml-5 list-disc pl-1" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="print:break-inside-avoid-page">
              <h3 className="text-xl font-semibold text-[#1A4480]">
                Category Assessments
              </h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {([
                  ["Leadership Integrity", summary.leadership_integrity],
                  ["Doctrine", summary.doctrine],
                  ["Governance", summary.governance],
                  ["Financial Stewardship", summary.financial_stewardship],
                  ["Fruit", summary.fruit],
                ] as Array<
                  [
                    string,
                    {
                      assessment: string;
                      confidence: "high" | "low" | "medium";
                    },
                  ]
                >).map(([label, value]) => (
                  <div
                    className="rounded-[24px] border border-[#E3DCCF] bg-[#FCFAF5] p-5 print:break-inside-avoid-page"
                    key={label}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-base font-semibold text-[#1A4480]">
                        {label}
                      </h4>
                      <span className="rounded-full bg-[#F1ECE1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#4F6357]">
                        {formatConfidence(value.confidence)}
                      </span>
                    </div>
                    <p className="mt-3 text-[15px] leading-7 text-[#475A4F]">
                      {value.assessment}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="print:break-inside-avoid-page">
              <h3 className="text-xl font-semibold text-[#1A4480]">
                Follow-up Questions
              </h3>
              <ul className="mt-4 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                {summary.follow_up_questions.map((item) => (
                  <li className="ml-5 list-disc pl-1" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}

        {voiceAlignment ? (
          <section className="print:break-inside-avoid-page">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-[#1A4480]">
                  Voice Alignment
                </h3>
                <p className="mt-2 max-w-3xl text-[15px] leading-8 text-[#475A4F]">
                  Internal and external perspectives were gathered to assess
                  alignment between lived culture and public reputation.
                </p>
              </div>
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${getVoiceAlignmentBadgeClass(
                  voiceAlignment.status,
                )}`}
              >
                {formatStatus(voiceAlignment.status)}
              </span>
            </div>

            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div className="rounded-[28px] border border-[#D8E5F6] bg-[#F7FBF8] p-6">
                <h4 className="text-lg font-semibold text-[#1A4480]">
                  Internal Perspective
                </h4>
                <div className="mt-4 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7088A5]">
                      Themes
                    </p>
                    <ul className="mt-3 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                      {voiceAlignment.summary.internal_summary.themes.map((item) => (
                        <li className="ml-5 list-disc pl-1" key={`internal-theme-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7088A5]">
                      Strengths
                    </p>
                    <ul className="mt-3 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                      {voiceAlignment.summary.internal_summary.strengths.map((item) => (
                        <li className="ml-5 list-disc pl-1" key={`internal-strength-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7088A5]">
                      Concerns
                    </p>
                    <ul className="mt-3 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                      {voiceAlignment.summary.internal_summary.concerns.map((item) => (
                        <li className="ml-5 list-disc pl-1" key={`internal-concern-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E8DDCB] bg-[#FDF8EF] p-6">
                <h4 className="text-lg font-semibold text-[#1A4480]">
                  External Perspective
                </h4>
                <div className="mt-4 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7088A5]">
                      Themes
                    </p>
                    <ul className="mt-3 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                      {voiceAlignment.summary.external_summary.themes.map((item) => (
                        <li className="ml-5 list-disc pl-1" key={`external-theme-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7088A5]">
                      Strengths
                    </p>
                    <ul className="mt-3 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                      {voiceAlignment.summary.external_summary.strengths.map((item) => (
                        <li className="ml-5 list-disc pl-1" key={`external-strength-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7088A5]">
                      Concerns
                    </p>
                    <ul className="mt-3 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                      {voiceAlignment.summary.external_summary.concerns.map((item) => (
                        <li className="ml-5 list-disc pl-1" key={`external-concern-${item}`}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6">
              <div className="rounded-[24px] border border-[#E3DCCF] bg-[#FCFAF5] p-5">
                <h4 className="text-base font-semibold text-[#1A4480]">
                  Alignment Insight
                </h4>
                <p className="mt-3 text-[15px] leading-8 text-[#475A4F]">
                  {voiceAlignment.summary.alignment_insight}
                </p>
              </div>

              {voiceAlignment.summary.follow_up_questions.length > 0 ? (
                <div className="rounded-[24px] border border-[#E3DCCF] bg-[#FCFAF5] p-5">
                  <h4 className="text-base font-semibold text-[#1A4480]">
                    Follow-up Questions
                  </h4>
                  <ul className="mt-3 space-y-3 text-[15px] leading-8 text-[#475A4F]">
                    {voiceAlignment.summary.follow_up_questions.map((item) => (
                      <li className="ml-5 list-disc pl-1" key={`follow-up-${item}`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {signals.length > 0 ? (
          <section className="print:break-inside-avoid-page">
            <h3 className="text-xl font-semibold text-[#1A4480]">
              External Signals
            </h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {signals.map((signal) => (
                <SignalCard
                  key={`${signal.label}-${signal.status}`}
                  label={signal.label}
                  status={signal.status}
                  summary={signal.summary}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
