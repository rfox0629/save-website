"use client";

import Link from "next/link";
import { useState } from "react";

import { getSaveTierClass } from "@/lib/save-tier";
import type { PublishedBriefCard } from "@/lib/donors";

type DonorHomeProps = {
  briefs: PublishedBriefCard[];
};

function getSummarySentences(text: string | null | undefined, maxSentences = 2) {
  if (!text) {
    return "No executive summary available yet.";
  }

  const normalized = text.replace(/\s+/g, " ").trim();
  const sentences = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];

  return sentences
    .slice(0, maxSentences)
    .map((sentence) => sentence.trim())
    .join(" ");
}

function tightenSignal(text: string, maxWords = 8) {
  const compact = text
    .replace(/\([^)]*\)/g, "")
    .replace(/^clear\s+/i, "")
    .replace(/^documented\s+/i, "")
    .replace(/^the organization\s+/i, "")
    .replace(/^there (?:is|are)\s+/i, "")
    .replace(/^reviewer should\s+/i, "")
    .replace(/^no direct evidence of\s+/i, "")
    .replace(/^can the organization provide\s+/i, "")
    .split(/[.;:]/)[0]
    .split(/\s+but\s+/i)[0]
    .replace(/\s+/g, " ")
    .trim();

  const words = compact.split(" ").filter(Boolean).slice(0, maxWords);

  if (words.length === 0) {
    return "No data available";
  }

  const joined = words.join(" ");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

function getFinalRecommendationMessage(brief: PublishedBriefCard) {
  switch (brief.saveTier) {
    case "High Confidence Opportunity":
    case "Strong Opportunity":
      return "Suitable for meaningful capital investment.";
    case "Proceed with Discernment":
      return "Worth considering with focused diligence.";
    default:
      return "Not suited for capital deployment now.";
  }
}

function getAlignmentLabel(brief: PublishedBriefCard) {
  if (!brief.voiceAlignment) {
    return "Not available";
  }

  if (brief.voiceAlignment.status === "aligned") {
    return "Strong";
  }

  if (brief.voiceAlignment.status === "partially_aligned") {
    return "Moderate";
  }

  return "Weak";
}

function getAlignmentSummary(brief: PublishedBriefCard) {
  if (!brief.voiceAlignment) {
    return "No alignment insight is available yet.";
  }

  return getSummarySentences(brief.voiceAlignment.summary.alignment_insight, 1);
}

function formatReviewedDate(date: string | null) {
  if (!date) {
    return "Reviewed recently";
  }

  return `Reviewed ${new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })}`;
}

function getRecommendationClass(level: string | null) {
  if (
    level === "Strongly Recommended" ||
    level === "Recommended" ||
    level === "Recommend"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (
    level === "Recommended with Conditions" ||
    level === "Proceed with caution"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-rose-200 bg-rose-50 text-rose-900";
}

function getRiskFlagClass(severity: PublishedBriefCard["highestRiskSeverity"]) {
  if (severity === "hard_stop" || severity === "high") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  if (severity === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  if (severity === "low") {
    return "border-stone-200 bg-stone-50 text-stone-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-900";
}

function getAlignmentClass(status: NonNullable<PublishedBriefCard["voiceAlignment"]>["status"]) {
  if (status === "aligned") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (status === "partially_aligned") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-rose-200 bg-rose-50 text-rose-900";
}

export function DonorHome({ briefs }: DonorHomeProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    briefs[0]?.id ?? null,
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)] md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
          Donor Access
        </p>
        <h1
          className="mt-4 text-4xl leading-tight text-[#1B4D35] md:text-5xl"
          style={{ fontFamily: "var(--font-auth-serif)" }}
        >
          Verified Ministries
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[#4F6357]">
          Review each ministry in a clean decision-ready format. Start with the
          highest-signal summary, then expand only where deeper diligence is
          needed.
        </p>
      </section>

      {briefs.length === 0 ? (
        <section className="rounded-[32px] border border-dashed border-[#D8D1C3] bg-[#FFFDF8] px-8 py-14 text-center shadow-[0_20px_60px_rgba(27,77,53,0.05)]">
          <p
            className="text-3xl text-[#1B4D35]"
            style={{ fontFamily: "var(--font-auth-serif)" }}
          >
            The first verified ministries will be listed here soon.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-[32px] border border-[#D8D1C3] bg-white shadow-[0_20px_60px_rgba(27,77,53,0.07)]">
          <div className="border-b border-[#E5DED1] bg-[#FFFDF8] px-6 py-5 md:px-8">
            <div className="grid gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#7A867D] md:grid-cols-[minmax(0,2.2fr)_140px_220px_minmax(0,1.5fr)_130px_120px]">
              <span>Ministry</span>
              <span>SAVE Score</span>
              <span>Recommendation</span>
              <span>Category Summary</span>
              <span>Risk Flags</span>
              <span className="text-right">Action</span>
            </div>
          </div>

          <div className="divide-y divide-[#EDE6DA]">
            {briefs.map((brief) => {
              const isExpanded = expandedId === brief.id;
              const scoreValue =
                typeof brief.score?.total_score === "number"
                  ? brief.score.total_score
                  : null;
              const strengths =
                brief.aiSummary?.top_strengths.filter((item) => item.trim()) ??
                brief.commendations.filter((item) => item.trim());
              const risks =
                brief.aiSummary?.top_risks.filter((item) => item.trim()) ??
                brief.cautions.filter((item) => item.trim());
              const executiveSummary = getSummarySentences(
                brief.aiSummary?.executive_summary || brief.ministry_description,
              );
              const keyStrengths = strengths.slice(0, 2).map((item) => tightenSignal(item));
              const keyRisks = risks.slice(0, 2).map((item) => tightenSignal(item));

              return (
                <article key={brief.id} className="bg-white">
                  <button
                    type="button"
                    className="grid w-full gap-4 px-6 py-5 text-left transition hover:bg-[#FBF8F2] md:grid-cols-[minmax(0,2.2fr)_140px_220px_minmax(0,1.5fr)_130px_120px] md:px-8"
                    onClick={() =>
                      setExpandedId((current) =>
                        current === brief.id ? null : brief.id,
                      )
                    }
                  >
                    <div>
                      <h2
                        className="text-[20px] leading-7 text-[#1B4D35]"
                        style={{ fontFamily: "var(--font-auth-serif)" }}
                      >
                        {brief.organization.legal_name}
                      </h2>
                      <p className="mt-1 text-sm text-[#6B8570]">
                        {brief.headline ||
                          (brief.organization.primary_focus ?? []).join(", ") ||
                          "Verified ministry"}
                      </p>
                    </div>

                    <div>
                      <p className="text-2xl font-semibold text-[#1B4D35]">
                        {scoreValue ?? "—"}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8B7A57]">
                        {brief.saveTier}
                      </p>
                    </div>

                    <div className="flex items-start">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRecommendationClass(
                          brief.recommendationLabel,
                        )}`}
                      >
                        {brief.recommendationLabel}
                      </span>
                    </div>

                    <p className="text-sm leading-7 text-[#4F6357]">
                      {brief.categorySummary}
                    </p>

                    <div className="flex items-start">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRiskFlagClass(
                          brief.highestRiskSeverity,
                        )}`}
                      >
                        {brief.riskFlagCount > 0
                          ? `${brief.riskFlagCount} flagged`
                          : "No flags"}
                      </span>
                    </div>

                    <div className="flex items-start justify-end">
                      <span className="inline-flex items-center rounded-full border border-[#1B4D35] px-4 py-2 text-sm font-semibold text-[#1B4D35] transition group-hover:bg-[#F4EFE4]">
                        View Brief
                      </span>
                    </div>
                  </button>

                  {isExpanded ? (
                    <div className="border-t border-[#F0EBE0] bg-[#FFFDF8] px-6 py-6 md:px-8">
                      <div className="space-y-5">
                        <section className="rounded-[28px] border border-[#E7E0D4] bg-white p-6">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="grid gap-5 sm:grid-cols-[150px_minmax(0,1fr)]">
                              <div className="rounded-[24px] bg-[#F6F1E7] px-5 py-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B7A57]">
                                  SAVE Score
                                </p>
                                <p className="mt-3 text-5xl font-semibold leading-none text-[#1B4D35]">
                                  {scoreValue ?? "—"}
                                </p>
                              </div>

                              <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSaveTierClass(
                                      brief.saveTier,
                                    )}`}
                                  >
                                    {brief.saveTier}
                                  </span>
                                  <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRecommendationClass(
                                      brief.recommendationLabel,
                                    )}`}
                                  >
                                    {brief.recommendationLabel}
                                  </span>
                                  <span className="text-sm text-[#7A867D]">
                                    {formatReviewedDate(
                                      brief.published_at ?? brief.generated_at,
                                    )}
                                  </span>
                                </div>

                                <div>
                                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B7A57]">
                                    Final Recommendation
                                  </p>
                                  <p className="mt-2 text-[28px] leading-tight text-[#1B4D35]">
                                    {scoreValue ?? "—"} — {brief.recommendationLabel}
                                  </p>
                                  <p className="mt-2 text-sm text-[#4F6357]">
                                    {getFinalRecommendationMessage(brief)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <Link
                                className="inline-flex items-center rounded-full bg-[#1B4D35] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#236645]"
                                href={`/donors/${brief.slug}`}
                              >
                                View Brief
                              </Link>
                            </div>
                          </div>

                          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
                            <div className="space-y-5">
                              <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B7A57]">
                                  Executive Summary
                                </p>
                                <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#4F6357]">
                                  {executiveSummary}
                                </p>
                              </div>

                              <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B7A57]">
                                  Key Signals
                                </p>
                                <div className="mt-3 grid gap-2 md:grid-cols-2">
                                  {keyStrengths.slice(0, 2).map((item) => (
                                    <p
                                      key={`strength-${item}`}
                                      className="text-sm font-medium text-[#1B4D35]"
                                    >
                                      <span className="mr-2 text-[#2F7A53]">✔</span>
                                      {item}
                                    </p>
                                  ))}
                                  {keyRisks.slice(0, 2).map((item) => (
                                    <p
                                      key={`risk-${item}`}
                                      className="text-sm font-medium text-[#1B4D35]"
                                    >
                                      <span className="mr-2 text-[#B7791F]">⚠</span>
                                      {item}
                                    </p>
                                  ))}
                                  {keyStrengths.length === 0 && keyRisks.length === 0 ? (
                                    <p className="text-sm text-[#7A867D]">
                                      No key signals available.
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-[24px] bg-[#FBF8F2] p-5">
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8B7A57]">
                                  Voice Alignment
                                </p>
                                {brief.voiceAlignment ? (
                                  <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getAlignmentClass(
                                      brief.voiceAlignment.status,
                                    )}`}
                                  >
                                    Leadership Alignment: {getAlignmentLabel(brief)}
                                  </span>
                                ) : null}
                              </div>

                              <p className="mt-3 text-sm leading-7 text-[#4F6357]">
                                {getAlignmentSummary(brief)}
                              </p>

                              {brief.voiceAlignment ? (
                                <details className="mt-4 rounded-2xl border border-[#ECE4D7] bg-white p-4">
                                  <summary className="cursor-pointer list-none text-sm font-semibold text-[#1B4D35]">
                                    Expand alignment detail
                                  </summary>
                                  <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1fr]">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B7A57]">
                                        Internal Perspective
                                      </p>
                                      <ul className="mt-3 space-y-2 text-sm text-[#4F6357]">
                                        {brief.voiceAlignment.summary.internal_summary.themes.length > 0 ? (
                                          brief.voiceAlignment.summary.internal_summary.themes.map(
                                            (item) => (
                                              <li key={item}>
                                                {tightenSignal(item, 10)}
                                              </li>
                                            ),
                                          )
                                        ) : (
                                          <li>No data available</li>
                                        )}
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B7A57]">
                                        External Perspective
                                      </p>
                                      <ul className="mt-3 space-y-2 text-sm text-[#4F6357]">
                                        {brief.voiceAlignment.summary.external_summary.themes.length > 0 ? (
                                          brief.voiceAlignment.summary.external_summary.themes.map(
                                            (item) => (
                                              <li key={item}>
                                                {tightenSignal(item, 10)}
                                              </li>
                                            ),
                                          )
                                        ) : (
                                          <li>No data available</li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </details>
                              ) : null}
                            </div>
                          </div>
                        </section>

                        <section className="grid gap-4 xl:grid-cols-3">
                          <details className="rounded-[24px] border border-[#E5DED0] bg-white p-5">
                            <summary className="cursor-pointer list-none text-base font-semibold text-[#1B4D35]">
                              Commendations
                            </summary>
                            <ul className="mt-4 space-y-2 text-sm text-[#4F6357]">
                              {strengths.length > 0 ? (
                                strengths.map((item) => (
                                  <li key={item}>{tightenSignal(item, 10)}</li>
                                ))
                              ) : (
                                <li className="text-[#7A867D]">No data available</li>
                              )}
                            </ul>
                          </details>

                          <details className="rounded-[24px] border border-[#E5DED0] bg-white p-5">
                            <summary className="cursor-pointer list-none text-base font-semibold text-[#1B4D35]">
                              Cautions
                            </summary>
                            <ul className="mt-4 space-y-2 text-sm text-[#4F6357]">
                              {risks.length > 0 ? (
                                risks.map((item) => (
                                  <li key={item}>{tightenSignal(item, 10)}</li>
                                ))
                              ) : (
                                <li className="text-[#7A867D]">No data available</li>
                              )}
                            </ul>
                          </details>

                          <details className="rounded-[24px] border border-[#E5DED0] bg-white p-5">
                            <summary className="cursor-pointer list-none text-base font-semibold text-[#1B4D35]">
                              See how this was evaluated
                            </summary>
                            <div className="mt-4 grid gap-3">
                              {[
                                ["Leadership", brief.score?.leadership_score ?? 0],
                                ["Doctrine", brief.score?.doctrine_score ?? 0],
                                ["Governance", brief.score?.governance_score ?? 0],
                                ["Financial Stewardship", brief.score?.financial_score ?? 0],
                                ["Fruit", brief.score?.fruit_score ?? 0],
                                ["External Signals", brief.score?.external_trust_score ?? 0],
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  className="flex items-center justify-between rounded-2xl bg-[#FBF8F2] px-4 py-3"
                                >
                                  <p className="text-sm text-[#5E6C62]">{label}</p>
                                  <p className="text-lg font-semibold text-[#1B4D35]">
                                    {value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </details>
                        </section>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
