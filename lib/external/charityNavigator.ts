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
  integration_status: "found" | "manual_review" | "not_configured" | "not_found";
  note: string | null;
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
  const normalizedEin = normalizeEin(ein);
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const apiKey = process.env.CHARITY_NAVIGATOR_API_KEY;

  await db
    .from("external_checks")
    .delete()
    .eq("application_id", applicationId)
    .eq("source", "charity_navigator");

  if (!apiKey) {
    const note =
      "Charity Navigator API not connected yet. Manual reviewer check required.";

    await db.from("external_checks").insert({
      application_id: applicationId,
      raw_result: {
        note,
        source: "charity_navigator",
        status: "not_configured",
      },
      score_impact: null,
      source: "charity_navigator",
      status: "not_applicable",
      summary: note,
    } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

    return {
      accountability_score: null,
      cn_subject: null,
      financial_score: null,
      found: false,
      integration_status: "not_configured",
      note,
      overall_rating: null,
      overall_score: null,
      score_impact: null,
      status: "not_applicable",
      transparency_score: null,
    };
  }

  try {
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
      const note = "Not listed on Charity Navigator";

      await db.from("external_checks").insert({
        application_id: applicationId,
        raw_result: {
          note,
          source: "charity_navigator",
          status: "not_found",
        },
        score_impact: null,
        source: "charity_navigator",
        status: "not_applicable",
        summary: note,
      } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

      return {
        accountability_score: null,
        cn_subject: null,
        financial_score: null,
        found: false,
        integration_status: "not_found",
        note,
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
    const note =
      overallRating === null
        ? "Not rated on Charity Navigator"
        : `${overallRating} stars — Financial: ${financialScore ?? "n/a"}, Accountability: ${accountabilityScore ?? "n/a"}`;

    await db.from("external_checks").insert({
      application_id: applicationId,
      raw_result: {
        ...payload,
        note,
        source: "charity_navigator",
        status: "found",
      },
      score_impact,
      source: "charity_navigator",
      status,
      summary: note,
    } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

    return {
      accountability_score: accountabilityScore,
      cn_subject: cnSubject,
      financial_score: financialScore,
      found: true,
      integration_status: "found",
      note,
      overall_rating: overallRating,
      overall_score: overallScore,
      score_impact,
      status,
      transparency_score: transparencyScore,
    };
  } catch (error) {
    const note =
      error instanceof Error
        ? error.message
        : "Charity Navigator lookup failed. Manual reviewer check required.";

    await db.from("external_checks").insert({
      application_id: applicationId,
      raw_result: {
        note,
        source: "charity_navigator",
        status: "manual_review",
      },
      score_impact: null,
      source: "charity_navigator",
      status: "flag",
      summary: "Charity Navigator lookup failed. Manual reviewer check required.",
    } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

    return {
      accountability_score: null,
      cn_subject: null,
      financial_score: null,
      found: false,
      integration_status: "manual_review",
      note,
      overall_rating: null,
      overall_score: null,
      score_impact: null,
      status: "flag",
      transparency_score: null,
    };
  }
}
