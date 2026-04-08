import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type CharityNavigatorResponse = {
  category?: {
    name?: string | null;
  } | null;
  cn_subject?: string | null;
  encompassRating?: {
    rating?: number | null;
    score?: number | null;
  } | null;
  overallRating?: {
    rating?: number | null;
    score?: number | null;
  } | null;
  scores?: {
    accountabilityFinance?: {
      score?: number | null;
    } | null;
    cultureAndCommunity?: {
      score?: number | null;
    } | null;
    impactAndMeasurement?: {
      score?: number | null;
    } | null;
    leadershipAndAdaptability?: {
      score?: number | null;
    } | null;
  } | null;
};

type CharityNavigatorCheckResult = {
  accountability_score: number | null;
  cn_subject: string | null;
  financial_score: number | null;
  found: boolean;
  overall_rating: number | null;
  overall_score: number | null;
  score_impact: number | null;
  status: "fail" | "flag" | "not_applicable" | "pass";
  transparency_score: number | null;
};

function normalizeEin(ein: string) {
  return ein.replace(/\D/g, "");
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getStatusForRating(rating: number | null) {
  if (rating === 4) {
    return {
      score_impact: 2,
      status: "pass" as const,
    };
  }

  if (rating === 3) {
    return {
      score_impact: 1,
      status: "pass" as const,
    };
  }

  if (rating === 2) {
    return {
      score_impact: 0,
      status: "flag" as const,
    };
  }

  if (rating === 1) {
    return {
      score_impact: -2,
      status: "fail" as const,
    };
  }

  return {
    score_impact: null,
    status: "not_applicable" as const,
  };
}

export async function checkCharityNavigator(
  ein: string,
  applicationId: string,
): Promise<CharityNavigatorCheckResult> {
  const apiKey = process.env.CHARITY_NAVIGATOR_API_KEY;

  if (!apiKey) {
    throw new Error(
      "CHARITY_NAVIGATOR_API_KEY is not set. Add it to your environment before running Charity Navigator checks.",
    );
  }

  const normalizedEin = normalizeEin(ein);
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  await db
    .from("external_checks")
    .delete()
    .eq("application_id", applicationId)
    .eq("source", "charity_navigator");

  const response = await fetch(
    `https://api.charitynavigator.org/v4/Organizations/${normalizedEin}?app_key=${encodeURIComponent(
      apiKey,
    )}`,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    await db.from("external_checks").insert({
      application_id: applicationId,
      raw_result: {},
      score_impact: null,
      source: "charity_navigator",
      status: "not_applicable",
      summary: "Not listed on Charity Navigator",
    } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

    return {
      accountability_score: null,
      cn_subject: null,
      financial_score: null,
      found: false,
      overall_rating: null,
      overall_score: null,
      score_impact: null,
      status: "not_applicable",
      transparency_score: null,
    };
  }

  if (!response.ok) {
    throw new Error(
      `Charity Navigator lookup failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as CharityNavigatorResponse;
  const overallScore =
    asNumber(payload.overallRating?.score) ??
    asNumber(payload.encompassRating?.score);
  const overallRating =
    asNumber(payload.overallRating?.rating) ??
    asNumber(payload.encompassRating?.rating);
  const accountabilityScore =
    asNumber(payload.scores?.accountabilityFinance?.score) ?? null;
  const financialScore =
    asNumber(payload.scores?.impactAndMeasurement?.score) ?? null;
  const transparencyScore =
    asNumber(payload.scores?.leadershipAndAdaptability?.score) ??
    asNumber(payload.scores?.cultureAndCommunity?.score) ??
    null;
  const cnSubject = payload.cn_subject ?? payload.category?.name ?? null;
  const { score_impact, status } = getStatusForRating(overallRating);

  await db.from("external_checks").insert({
    application_id: applicationId,
    raw_result: payload,
    score_impact,
    source: "charity_navigator",
    status,
    summary:
      overallRating === null
        ? "Not rated on Charity Navigator"
        : `${overallRating} stars — Financial: ${financialScore ?? "n/a"}, Accountability: ${accountabilityScore ?? "n/a"}`,
  } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

  return {
    accountability_score: accountabilityScore,
    cn_subject: cnSubject,
    financial_score: financialScore,
    found: true,
    overall_rating: overallRating,
    overall_score: overallScore,
    score_impact,
    status,
    transparency_score: transparencyScore,
  };
}
