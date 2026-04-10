import { parseReviewerSummary } from "@/lib/ai/reviewerSummary";
import {
  getBriefRationale,
  type RecommendationLevel,
} from "@/lib/brief-shared";
import type { PublicVoiceAlignmentData } from "@/lib/brief";
import { getSaveTier, getSaveTierClass } from "@/lib/save-tier";
import type {
  Applications,
  DonorBrief,
  ExternalCheck,
  Organizations,
} from "@/lib/supabase/types";

function SaveMark() {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4D35] text-sm font-bold tracking-[0.22em] text-[#F9F6F0]">
        S
      </div>
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.3em] text-[#1B4D35]">
          SAVE
        </div>
        <div className="text-xs text-[#6B8570]">Ministry Vetting</div>
      </div>
    </div>
  );
}

function getExternalSignal(checks: ExternalCheck[], source: string, label: string) {
  const check = checks.find((item) => item.source === source);

  if (!check) {
    return null;
  }

  return {
    label,
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

function formatConfidence(confidence: string) {
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
}

function formatVoiceAlignmentStatus(status: PublicVoiceAlignmentData["status"]) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getVoiceAlignmentBadgeClass(status: PublicVoiceAlignmentData["status"]) {
  if (status === "aligned") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (status === "partially_aligned") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-rose-200 bg-rose-50 text-rose-900";
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-[#1B4D35]">{children}</h2>;
}

function BulletList({
  items,
  tone = "default",
}: {
  items: string[];
  tone?: "default" | "warm";
}) {
  if (items.length === 0) {
    return <p className="text-[15px] leading-8 text-[#617367]">No data available.</p>;
  }

  return (
    <ul className="space-y-3 text-[15px] leading-8 text-[#475A4F]">
      {items.map((item, index) => (
        <li className="ml-5 list-disc pl-1" key={`${item}-${index}`}>
          <span className={tone === "warm" ? "text-[#6C5A2F]" : undefined}>{item}</span>
        </li>
      ))}
    </ul>
  );
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
        <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6B8570]">
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

export function SaveBriefV1({
  application,
  brief,
  externalChecks,
  org,
  titleClassName,
  voiceAlignment,
}: {
  application: Applications;
  brief: DonorBrief;
  externalChecks: ExternalCheck[];
  org: Organizations;
  titleClassName?: string;
  voiceAlignment: PublicVoiceAlignmentData | null;
}) {
  const summary = parseReviewerSummary(application.ai_summary);
  const metadata = [
    org.ein ? `EIN ${org.ein}` : null,
    org.year_founded ? `Founded ${org.year_founded}` : null,
    org.state_of_incorporation ?? null,
    org.entity_type ?? null,
  ].filter(Boolean);
  const rationale =
    brief.rationale ??
    getBriefRationale(
      brief.recommendation_level as RecommendationLevel | string | null,
      brief.cautions.filter((item) => item.trim()),
    );
  const executiveSummary =
    summary?.executive_summary ??
    brief.ministry_description ??
    "No executive summary is available yet.";
  const strengths =
    summary?.top_strengths.filter((item) => item.trim()) ??
    brief.commendations.filter((item) => item.trim());
  const risks =
    summary?.top_risks.filter((item) => item.trim()) ??
    brief.cautions.filter((item) => item.trim());
  const followUpQuestions = summary?.follow_up_questions.filter((item) =>
    item.trim(),
  ) ?? [];
  const saveTier = getSaveTier({
    categoryConfidences: summary
      ? [
          summary.leadership_integrity.confidence,
          summary.doctrine.confidence,
          summary.governance.confidence,
          summary.financial_stewardship.confidence,
          summary.fruit.confidence,
        ]
      : [],
    recommendation: summary?.recommendation ?? brief.recommendation_level,
    risks,
    strengths,
    voiceAlignmentStatus: voiceAlignment?.status ?? null,
  });
  const signals = [
    getExternalSignal(externalChecks, "irs_teos", "IRS"),
    getCharityNavigatorSignal(externalChecks),
    getExternalSignal(externalChecks, "website", "Website"),
    getExternalSignal(externalChecks, "news_search", "Reputation"),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <article className="mx-auto w-full max-w-5xl rounded-[32px] border border-[#E3DCCF] bg-white px-6 py-8 text-[#23372B] shadow-[0_20px_60px_rgba(27,77,53,0.06)] md:px-10 md:py-10 print:max-w-none print:rounded-none print:border-0 print:px-0 print:py-0 print:shadow-none">
      <header className="border-b border-[#E8E0D2] pb-8 print:break-inside-avoid-page">
        <div className="flex items-start justify-between gap-6">
          <SaveMark />
          <span
            className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${getSaveTierClass(
              saveTier,
            )}`}
          >
            {saveTier}
          </span>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
            SAVE Brief V1
          </p>
          <h1 className={`${titleClassName ?? ""} text-[34px] text-[#1B4D35]`}>
            {org.legal_name}
          </h1>
          {metadata.length > 0 ? (
            <p className="text-sm text-[#617367]">{metadata.join(" · ")}</p>
          ) : null}
        </div>
      </header>

      <div className="space-y-10 py-10 print:space-y-8">
        <section className="print:break-inside-avoid-page">
          <SectionTitle>Executive Summary</SectionTitle>
          <p className="mt-4 max-w-4xl text-[15px] leading-8 text-[#475A4F]">
            {executiveSummary}
          </p>
        </section>

        <section className="print:break-inside-avoid-page">
          <SectionTitle>Recommendation</SectionTitle>
          <div className="mt-4 rounded-[28px] bg-[#F4EFE4] px-6 py-6">
            <p className="text-2xl font-semibold text-[#1B4D35]">
              {brief.recommendation_level ?? "Recommendation pending"}
            </p>
            <p className="mt-3 text-[15px] leading-8 text-[#475A4F]">
              {rationale}
            </p>
            <p className="mt-3 text-sm font-medium text-[#6B8570]">
              SAVE Tier: {saveTier}
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 print:break-inside-avoid-page">
          <div className="rounded-[28px] border border-[#DCE8DF] bg-[#F7FBF8] p-6">
            <SectionTitle>Strengths</SectionTitle>
            <div className="mt-4">
              <BulletList items={strengths} />
            </div>
          </div>
          <div className="rounded-[28px] border border-[#E8DDCB] bg-[#FDF8EF] p-6">
            <SectionTitle>Risks &amp; Considerations</SectionTitle>
            <div className="mt-4">
              <BulletList items={risks} tone="warm" />
            </div>
          </div>
        </section>

        {summary ? (
          <section className="print:break-inside-avoid-page">
            <SectionTitle>Key Areas of Assessment</SectionTitle>
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
                    <h3 className="text-base font-semibold text-[#1B4D35]">
                      {label}
                    </h3>
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
        ) : null}

        {voiceAlignment ? (
          <section className="print:break-inside-avoid-page">
            <SectionTitle>Relational Discernment</SectionTitle>
            <p className="mt-4 max-w-4xl text-[15px] leading-8 text-[#475A4F]">
              Internal and external perspectives were gathered to assess
              alignment between lived culture and public reputation.
            </p>
            <p className="mt-4 max-w-4xl text-[15px] leading-8 text-[#475A4F]">
              This includes in-person time with leadership, often around the
              table, where culture and character become clear.
            </p>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr,1fr,1.15fr]">
              <div className="rounded-[28px] border border-[#DCE8DF] bg-[#F7FBF8] p-6">
                <h3 className="text-lg font-semibold text-[#1B4D35]">
                  Internal Perspective
                </h3>
                <div className="mt-4 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8570]">
                      Themes
                    </p>
                    <div className="mt-3">
                      <BulletList items={voiceAlignment.summary.internal_summary.themes} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8570]">
                      Strengths
                    </p>
                    <div className="mt-3">
                      <BulletList items={voiceAlignment.summary.internal_summary.strengths} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8570]">
                      Concerns
                    </p>
                    <div className="mt-3">
                      <BulletList items={voiceAlignment.summary.internal_summary.concerns} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#E8DDCB] bg-[#FDF8EF] p-6">
                <h3 className="text-lg font-semibold text-[#1B4D35]">
                  External Perspective
                </h3>
                <div className="mt-4 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8570]">
                      Themes
                    </p>
                    <div className="mt-3">
                      <BulletList items={voiceAlignment.summary.external_summary.themes} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8570]">
                      Strengths
                    </p>
                    <div className="mt-3">
                      <BulletList items={voiceAlignment.summary.external_summary.strengths} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B8570]">
                      Concerns
                    </p>
                    <div className="mt-3">
                      <BulletList items={voiceAlignment.summary.external_summary.concerns} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[28px] border border-[#E3DCCF] bg-[#FCFAF5] p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-[#1B4D35]">
                      Alignment Insight
                    </h3>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getVoiceAlignmentBadgeClass(
                        voiceAlignment.status,
                      )}`}
                    >
                      {formatVoiceAlignmentStatus(voiceAlignment.status)}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] leading-8 text-[#475A4F]">
                    {voiceAlignment.summary.alignment_insight}
                  </p>
                </div>

                {voiceAlignment.summary.follow_up_questions.length > 0 ? (
                  <div className="rounded-[28px] border border-[#E3DCCF] bg-[#FCFAF5] p-6">
                    <h3 className="text-lg font-semibold text-[#1B4D35]">
                      Follow-Up Considerations
                    </h3>
                    <div className="mt-4">
                      <BulletList items={voiceAlignment.summary.follow_up_questions} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {signals.length > 0 ? (
          <section className="print:break-inside-avoid-page">
            <SectionTitle>External Signals</SectionTitle>
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

        {followUpQuestions.length > 0 ? (
          <section className="print:break-inside-avoid-page">
            <SectionTitle>Follow-Up Considerations</SectionTitle>
            <div className="mt-4">
              <BulletList items={followUpQuestions} />
            </div>
          </section>
        ) : null}
      </div>

      <footer className="border-t border-[#E8E0D2] pt-6 text-sm leading-7 text-[#6B8570] print:break-inside-avoid-page">
        This brief is for informational purposes only. SAVE does not guarantee
        outcomes. Donors are encouraged to conduct their own additional due
        diligence.
      </footer>
    </article>
  );
}
