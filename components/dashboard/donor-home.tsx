"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { PublishedBriefCard } from "@/lib/donors";

type DonorHomeProps = {
  briefs: PublishedBriefCard[];
};

const RECOMMENDATION_OPTIONS = [
  "All",
  "Strongly Recommended",
  "Recommended",
  "Recommended with Conditions",
] as const;

const GEOGRAPHIC_OPTIONS = [
  "All",
  "Local",
  "National",
  "International",
] as const;

function getRecommendationClass(level: string | null) {
  if (level === "Strongly Recommended") {
    return "bg-[#EAF5EE] text-[#1B4D35]";
  }

  if (level === "Recommended") {
    return "bg-[#EDF6EF] text-[#2F7A53]";
  }

  return "bg-[#FFF4DA] text-[#8A6720]";
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

export function DonorHome({ briefs }: DonorHomeProps) {
  const [search, setSearch] = useState("");
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [recommendationLevel, setRecommendationLevel] =
    useState<(typeof RECOMMENDATION_OPTIONS)[number]>("All");
  const [geographicScope, setGeographicScope] =
    useState<(typeof GEOGRAPHIC_OPTIONS)[number]>("All");

  const focusAreaOptions = useMemo(() => {
    return Array.from(
      new Set(briefs.flatMap((brief) => brief.organization.primary_focus)),
    ).sort((a, b) => a.localeCompare(b));
  }, [briefs]);

  const filteredBriefs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return briefs.filter((brief) => {
      const organization = brief.organization;
      const focusAreas = organization.primary_focus ?? [];
      const geography = organization.geographic_scope ?? [];

      const matchesSearch =
        normalizedSearch.length === 0 ||
        organization.legal_name.toLowerCase().includes(normalizedSearch) ||
        focusAreas.some((focus) =>
          focus.toLowerCase().includes(normalizedSearch),
        );

      const matchesFocus =
        selectedFocusAreas.length === 0 ||
        selectedFocusAreas.some((focus) => focusAreas.includes(focus));

      const matchesRecommendation =
        recommendationLevel === "All" ||
        brief.recommendation_level === recommendationLevel;

      const matchesGeography =
        geographicScope === "All" || geography.includes(geographicScope);

      return (
        matchesSearch &&
        matchesFocus &&
        matchesRecommendation &&
        matchesGeography
      );
    });
  }, [
    briefs,
    geographicScope,
    recommendationLevel,
    search,
    selectedFocusAreas,
  ]);

  function toggleFocusArea(value: string) {
    setSelectedFocusAreas((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

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
          Every ministry listed has completed the full SAVE Standard.
        </p>
      </section>

      <section className="rounded-[32px] border border-[#D8D1C3] bg-white p-6 shadow-[0_20px_60px_rgba(27,77,53,0.07)] md:p-8">
        <div className="grid gap-5">
          <label className="space-y-2 text-sm font-medium text-[#1B4D35]">
            <span>Search ministries</span>
            <input
              className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/20"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ministry name or focus area"
              type="search"
              value={search}
            />
          </label>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#1B4D35]">Focus area</p>
              <div className="flex flex-wrap gap-2">
                {focusAreaOptions.map((focus) => {
                  const active = selectedFocusAreas.includes(focus);

                  return (
                    <button
                      className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "border-[#1B4D35] bg-[#1B4D35] text-white"
                          : "border-[#D8D1C3] bg-[#FFFDF8] text-[#4F6357] hover:border-[#1B4D35] hover:text-[#1B4D35]"
                      }`}
                      key={focus}
                      onClick={() => toggleFocusArea(focus)}
                      type="button"
                    >
                      {focus}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="space-y-2 text-sm font-medium text-[#1B4D35]">
              <span>Recommendation level</span>
              <select
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/20"
                onChange={(event) =>
                  setRecommendationLevel(
                    event.target
                      .value as (typeof RECOMMENDATION_OPTIONS)[number],
                  )
                }
                value={recommendationLevel}
              >
                {RECOMMENDATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-[#1B4D35]">
              <span>Geographic scope</span>
              <select
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/20"
                onChange={(event) =>
                  setGeographicScope(
                    event.target.value as (typeof GEOGRAPHIC_OPTIONS)[number],
                  )
                }
                value={geographicScope}
              >
                {GEOGRAPHIC_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {filteredBriefs.length === 0 ? (
        <section className="rounded-[32px] border border-dashed border-[#D8D1C3] bg-[#FFFDF8] px-8 py-14 text-center shadow-[0_20px_60px_rgba(27,77,53,0.05)]">
          <p
            className="text-3xl text-[#1B4D35]"
            style={{ fontFamily: "var(--font-auth-serif)" }}
          >
            The first verified ministries will be listed here soon.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBriefs.map((brief) => (
            <article
              className="flex h-full flex-col rounded-2xl border border-t-[4px] border-[#D8D1C3] border-t-[#1B4D35] bg-white p-6 shadow-[0_18px_40px_rgba(27,77,53,0.06)]"
              key={brief.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className="text-[18px] leading-7 text-[#1B4D35]"
                    style={{ fontFamily: "var(--font-auth-serif)" }}
                  >
                    {brief.organization.legal_name}
                  </h2>
                  <p className="mt-1 text-sm text-[#6B8570]">
                    {(brief.organization.geographic_scope ?? []).join(", ") ||
                      "Scope not provided"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getRecommendationClass(
                    brief.recommendation_level,
                  )}`}
                >
                  {brief.recommendation_level ?? "Recommendation pending"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {brief.organization.primary_focus.map((focus) => (
                  <span
                    className="rounded-full bg-[#FFF4DA] px-3 py-1 text-xs font-medium text-[#8A6720]"
                    key={focus}
                  >
                    {focus}
                  </span>
                ))}
              </div>

              <p className="mt-5 min-h-[56px] text-sm leading-7 text-[#4F6357]">
                {brief.ministry_description ||
                  brief.headline ||
                  "No summary available yet."}
              </p>

              <div className="mt-6">
                <Link
                  className="inline-flex items-center rounded-full border border-[#1B4D35] px-4 py-2 text-sm font-semibold text-[#1B4D35] transition hover:bg-[#F4EFE4]"
                  href={`/donors/${brief.slug}`}
                >
                  View Brief →
                </Link>
              </div>

              <p className="mt-auto pt-6 text-xs text-[#8A968F]">
                {formatReviewedDate(brief.published_at ?? brief.generated_at)}
              </p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
