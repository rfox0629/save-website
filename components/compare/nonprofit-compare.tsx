"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { CompareOption, CompareRecord } from "@/lib/compare";
import { getSaveTierClass, type SaveTier } from "@/lib/save-tier";

function formatRecommendation(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getFollowUpQuestions(item: CompareRecord | null) {
  if (!item) {
    return [];
  }

  return item.followUpQuestions ?? [];
}

function getCategoryAssessment(
  item: CompareRecord | null,
  label: string,
): { assessment: string; confidence: string } | null {
  if (!item) {
    return null;
  }

  const match = item.categoryAssessments.find((entry) => entry.label === label);
  return match
    ? { assessment: match.assessment, confidence: match.confidence }
    : null;
}

function getExternalSignal(
  item: CompareRecord | null,
  label: string,
): { status: string; summary: string } | null {
  if (!item) {
    return null;
  }

  const match = item.externalSignals.find((entry) => entry.label === label);
  return match ? { status: match.status, summary: match.summary } : null;
}

function CompareCell({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: "dark" | "light";
}) {
  return (
    <div
      className={`rounded-[1.5rem] border p-5 ${
        theme === "light"
          ? "border-[#D8D1C3] bg-[#FFFDF8] text-[#1A4480]"
          : "border-white/10 bg-[#0B1622]/70 text-white"
      }`}
    >
      {children}
    </div>
  );
}

function CompareRow({
  label,
  left,
  right,
  theme,
}: {
  label: string;
  left: React.ReactNode;
  right: React.ReactNode;
  theme: "dark" | "light";
}) {
  const labelClass =
    theme === "light" ? "text-[#7088A5]" : "text-[#C09A45]";

  return (
    <section className="space-y-3">
      <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${labelClass}`}>
        {label}
      </p>
      <div className="grid gap-4 xl:grid-cols-2">
        <CompareCell theme={theme}>{left}</CompareCell>
        <CompareCell theme={theme}>{right}</CompareCell>
      </div>
    </section>
  );
}

export function NonprofitCompare({
  basePath,
  left,
  leftValue,
  options,
  right,
  rightValue,
  theme = "dark",
}: {
  basePath: string;
  left: CompareRecord | null;
  leftValue: string | null;
  options: CompareOption[];
  right: CompareRecord | null;
  rightValue: string | null;
  theme?: "dark" | "light";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageShellClass =
    theme === "light"
      ? "rounded-[2rem] border border-[#D8D1C3] bg-white p-6 shadow-[0_20px_60px_rgba(26,68,128,0.07)]"
      : "rounded-[2rem] border border-white/10 bg-white/[0.03] p-6";
  const labelClass = theme === "light" ? "text-[#1A4480]" : "text-slate-300";
  const inputClass =
    theme === "light"
      ? "w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1A4480]"
      : "w-full rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white";
  const bodyTextClass = theme === "light" ? "text-[#4F6357]" : "text-slate-200";
  const mutedTextClass = theme === "light" ? "text-[#7088A5]" : "text-slate-400";
  const pillClass =
    theme === "light"
      ? "border-[#D8D1C3] bg-white text-[#1A4480]"
      : "border-[#C09A45]/25 bg-[#C09A45]/10 text-[#F4E3B2]";

  function updateSelection(key: "left" | "right", value: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set(key, value);
    router.push(`${basePath}?${next.toString()}`);
  }

  function renderEmptyState(message = "No data available") {
    return <p className={`text-sm ${mutedTextClass}`}>{message}</p>;
  }

  return (
    <div className="space-y-6">
      <section className={pageShellClass}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={`space-y-2 text-sm font-medium ${labelClass}`}>
            <span>Left nonprofit</span>
            <select
              className={inputClass}
              onChange={(event) => updateSelection("left", event.target.value)}
              value={leftValue ?? ""}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={`space-y-2 text-sm font-medium ${labelClass}`}>
            <span>Right nonprofit</span>
            <select
              className={inputClass}
              onChange={(event) => updateSelection("right", event.target.value)}
              value={rightValue ?? ""}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-6">
        <CompareRow
          label="Overview"
          left={
            left ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h2 className="text-2xl font-semibold">{left.organizationName}</h2>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getSaveTierClass(
                        left.saveTier as SaveTier,
                        theme,
                      )}`}
                    >
                      {left.saveTier}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${pillClass}`}>
                      {formatRecommendation(left.recommendation)}
                    </span>
                  </div>
                </div>
                <p className={`text-sm leading-7 ${bodyTextClass}`}>
                  {left.executiveSummary}
                </p>
              </div>
            ) : (
              renderEmptyState("No nonprofit selected.")
            )
          }
          right={
            right ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h2 className="text-2xl font-semibold">{right.organizationName}</h2>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getSaveTierClass(
                        right.saveTier as SaveTier,
                        theme,
                      )}`}
                    >
                      {right.saveTier}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${pillClass}`}>
                      {formatRecommendation(right.recommendation)}
                    </span>
                  </div>
                </div>
                <p className={`text-sm leading-7 ${bodyTextClass}`}>
                  {right.executiveSummary}
                </p>
              </div>
            ) : (
              renderEmptyState("No nonprofit selected.")
            )
          }
          theme={theme}
        />

        <CompareRow
          label="Strengths"
          left={
            left && left.topStrengths.length > 0 ? (
              <ul className={`space-y-2 text-sm leading-7 ${bodyTextClass}`}>
                {left.topStrengths.map((entry) => (
                  <li className="ml-5 list-disc pl-1" key={entry}>
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              renderEmptyState()
            )
          }
          right={
            right && right.topStrengths.length > 0 ? (
              <ul className={`space-y-2 text-sm leading-7 ${bodyTextClass}`}>
                {right.topStrengths.map((entry) => (
                  <li className="ml-5 list-disc pl-1" key={entry}>
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              renderEmptyState()
            )
          }
          theme={theme}
        />

        <CompareRow
          label="Risks"
          left={
            left && left.topRisks.length > 0 ? (
              <ul className={`space-y-2 text-sm leading-7 ${bodyTextClass}`}>
                {left.topRisks.map((entry) => (
                  <li className="ml-5 list-disc pl-1" key={entry}>
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              renderEmptyState()
            )
          }
          right={
            right && right.topRisks.length > 0 ? (
              <ul className={`space-y-2 text-sm leading-7 ${bodyTextClass}`}>
                {right.topRisks.map((entry) => (
                  <li className="ml-5 list-disc pl-1" key={entry}>
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              renderEmptyState()
            )
          }
          theme={theme}
        />

        <CompareRow
          label="Follow-up Questions"
          left={
            getFollowUpQuestions(left).length > 0 ? (
              <ul className={`space-y-2 text-sm leading-7 ${bodyTextClass}`}>
                {getFollowUpQuestions(left).map((entry) => (
                  <li className="ml-5 list-disc pl-1" key={entry}>
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              renderEmptyState()
            )
          }
          right={
            getFollowUpQuestions(right).length > 0 ? (
              <ul className={`space-y-2 text-sm leading-7 ${bodyTextClass}`}>
                {getFollowUpQuestions(right).map((entry) => (
                  <li className="ml-5 list-disc pl-1" key={entry}>
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              renderEmptyState()
            )
          }
          theme={theme}
        />

        {[
          "Leadership Integrity",
          "Doctrine",
          "Governance",
          "Financial Stewardship",
          "Fruit",
        ].map((label) => {
          const leftAssessment = getCategoryAssessment(left, label);
          const rightAssessment = getCategoryAssessment(right, label);

          return (
            <CompareRow
              key={label}
              label={label}
              left={
                leftAssessment ? (
                  <div className="space-y-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                        theme === "light"
                          ? "border-[#D8D1C3] bg-white text-[#4F6357]"
                          : "border-white/10 bg-white/5 text-slate-300"
                      }`}
                    >
                      {leftAssessment.confidence}
                    </span>
                    <p className={`text-sm leading-7 ${bodyTextClass}`}>
                      {leftAssessment.assessment}
                    </p>
                  </div>
                ) : (
                  renderEmptyState()
                )
              }
              right={
                rightAssessment ? (
                  <div className="space-y-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                        theme === "light"
                          ? "border-[#D8D1C3] bg-white text-[#4F6357]"
                          : "border-white/10 bg-white/5 text-slate-300"
                      }`}
                    >
                      {rightAssessment.confidence}
                    </span>
                    <p className={`text-sm leading-7 ${bodyTextClass}`}>
                      {rightAssessment.assessment}
                    </p>
                  </div>
                ) : (
                  renderEmptyState()
                )
              }
              theme={theme}
            />
          );
        })}

        <CompareRow
          label="External Signals"
          left={
            <div className="space-y-3">
              {["IRS", "Charity Navigator", "Website", "Reputation"].map(
                (signalLabel) => {
                  const signal = getExternalSignal(left, signalLabel);
                  return (
                    <div
                      className={`rounded-[1rem] border p-4 ${
                        theme === "light"
                          ? "border-[#E3DCCF] bg-[#FCFAF5]"
                          : "border-white/10 bg-[#09131d]"
                      }`}
                      key={signalLabel}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{signalLabel}</p>
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            theme === "light"
                              ? "border-[#D8D1C3] bg-white text-[#4F6357]"
                              : "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {signal?.status ?? "n/a"}
                        </span>
                      </div>
                      <p className={`mt-2 text-sm leading-7 ${bodyTextClass}`}>
                        {signal?.summary ?? "No data available"}
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          }
          right={
            <div className="space-y-3">
              {["IRS", "Charity Navigator", "Website", "Reputation"].map(
                (signalLabel) => {
                  const signal = getExternalSignal(right, signalLabel);
                  return (
                    <div
                      className={`rounded-[1rem] border p-4 ${
                        theme === "light"
                          ? "border-[#E3DCCF] bg-[#FCFAF5]"
                          : "border-white/10 bg-[#09131d]"
                      }`}
                      key={signalLabel}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{signalLabel}</p>
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                            theme === "light"
                              ? "border-[#D8D1C3] bg-white text-[#4F6357]"
                              : "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {signal?.status ?? "n/a"}
                        </span>
                      </div>
                      <p className={`mt-2 text-sm leading-7 ${bodyTextClass}`}>
                        {signal?.summary ?? "No data available"}
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          }
          theme={theme}
        />
      </section>
    </div>
  );
}
