import "server-only";

import { parseReviewerSummary } from "@/lib/ai/reviewerSummary";
import { requireDonorBriefs } from "@/lib/donors";
import { getPublishedBriefBySlug } from "@/lib/brief";
import { getRecommendationLevel, requireReviewerPageAccess } from "@/lib/review";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Applications, ExternalCheck, Organizations, Score } from "@/lib/supabase/types";

export type CompareOption = {
  label: string;
  value: string;
};

export type CompareRecord = {
  categoryAssessments: Array<{
    assessment: string;
    confidence: string;
    label: string;
  }>;
  executiveSummary: string;
  externalSignals: Array<{
    label: string;
    status: string;
    summary: string;
  }>;
  followUpQuestions: string[];
  id: string;
  organizationName: string;
  recommendation: string;
  topRisks: string[];
  topStrengths: string[];
};

export type ComparisonPageData = {
  left: CompareRecord | null;
  leftValue: string | null;
  options: CompareOption[];
  right: CompareRecord | null;
  rightValue: string | null;
};

function getCheckSignal(checks: ExternalCheck[], source: string, label: string) {
  const check = checks.find((item) => item.source === source);

  if (!check) {
    return null;
  }

  const raw =
    check.raw_result &&
    typeof check.raw_result === "object" &&
    !Array.isArray(check.raw_result)
      ? (check.raw_result as Record<string, unknown>)
      : null;

  const status =
    source === "charity_navigator" && typeof raw?.status === "string"
      ? raw.status
      : check.status;
  const summary =
    source === "charity_navigator" && typeof raw?.note === "string"
      ? raw.note
      : (check.summary ?? "No summary available.");

  return {
    label,
    status,
    summary,
  };
}

function buildCompareRecord({
  application,
  checks,
  fallbackRecommendation,
  org,
}: {
  application: Applications;
  checks: ExternalCheck[];
  fallbackRecommendation: string;
  org: Organizations;
}): CompareRecord {
  const summary = parseReviewerSummary(application.ai_summary);

  return {
    categoryAssessments: summary
      ? [
          {
            assessment: summary.leadership_integrity.assessment,
            confidence: summary.leadership_integrity.confidence,
            label: "Leadership Integrity",
          },
          {
            assessment: summary.doctrine.assessment,
            confidence: summary.doctrine.confidence,
            label: "Doctrine",
          },
          {
            assessment: summary.governance.assessment,
            confidence: summary.governance.confidence,
            label: "Governance",
          },
          {
            assessment: summary.financial_stewardship.assessment,
            confidence: summary.financial_stewardship.confidence,
            label: "Financial Stewardship",
          },
          {
            assessment: summary.fruit.assessment,
            confidence: summary.fruit.confidence,
            label: "Fruit",
          },
        ]
      : [],
    executiveSummary:
      summary?.executive_summary ?? "AI summary not available yet.",
    externalSignals: [
      getCheckSignal(checks, "irs_teos", "IRS"),
      getCheckSignal(checks, "charity_navigator", "Charity Navigator"),
      getCheckSignal(checks, "website", "Website"),
      getCheckSignal(checks, "news_search", "Reputation"),
    ].filter((item): item is NonNullable<typeof item> => Boolean(item)),
    followUpQuestions: summary?.follow_up_questions ?? [],
    id: application.id,
    organizationName: org.legal_name,
    recommendation: summary?.recommendation ?? fallbackRecommendation,
    topRisks: summary?.top_risks ?? [],
    topStrengths: summary?.top_strengths ?? [],
  };
}

function normalizeRecommendation(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getReviewerComparisonPageData(
  leftValue?: string,
  rightValue?: string,
): Promise<ComparisonPageData> {
  await requireReviewerPageAccess();

  const admin = createAdminClient();
  const [{ data: applications }, { data: organizations }, { data: scores }] =
    await Promise.all([
      admin.from("applications").select("*").order("created_at", { ascending: false }),
      admin.from("organizations").select("*"),
      admin.from("scores").select("*").order("calculated_at", { ascending: false }),
    ]);

  const applicationRows = (applications ?? []) as Applications[];
  const organizationRows = (organizations ?? []) as Organizations[];
  const scoreRows = (scores ?? []) as Score[];
  const organizationMap = new Map(
    organizationRows.map((organization) => [organization.id, organization]),
  );
  const latestScoreMap = new Map<string, Score>();

  for (const score of scoreRows) {
    if (!latestScoreMap.has(score.application_id)) {
      latestScoreMap.set(score.application_id, score);
    }
  }

  const comparableApplications = applicationRows
    .map((application) => ({
      application,
      organization: organizationMap.get(application.organization_id) ?? null,
    }))
    .filter(
      (
        item,
      ): item is { application: Applications; organization: Organizations } =>
        Boolean(item.organization),
    );

  const options = comparableApplications.map((item) => ({
    label: item.organization.legal_name,
    value: item.application.id,
  }));
  const resolvedLeftValue = leftValue ?? options[0]?.value ?? null;
  const resolvedRightValue =
    rightValue ?? options.find((item) => item.value !== resolvedLeftValue)?.value ?? resolvedLeftValue;

  const selectedIds = [resolvedLeftValue, resolvedRightValue].filter(
    (value): value is string => Boolean(value),
  );

  const { data: externalChecks } = selectedIds.length
    ? await admin
        .from("external_checks")
        .select("*")
        .in("application_id", selectedIds)
        .order("checked_at", { ascending: false })
    : { data: [] as ExternalCheck[] };

  const checksByApplication = ((externalChecks ?? []) as ExternalCheck[]).reduce<
    Map<string, ExternalCheck[]>
  >((map, check) => {
    const current = map.get(check.application_id) ?? [];
    current.push(check);
    map.set(check.application_id, current);
    return map;
  }, new Map());

  function buildSelectedRecord(applicationId: string | null) {
    if (!applicationId) {
      return null;
    }

    const match = comparableApplications.find(
      (item) => item.application.id === applicationId,
    );

    if (!match) {
      return null;
    }

    return buildCompareRecord({
      application: match.application,
      checks: checksByApplication.get(applicationId) ?? [],
      fallbackRecommendation: normalizeRecommendation(
        getRecommendationLevel(latestScoreMap.get(applicationId) ?? null),
      ),
      org: match.organization,
    });
  }

  return {
    left: buildSelectedRecord(resolvedLeftValue),
    leftValue: resolvedLeftValue,
    options,
    right: buildSelectedRecord(resolvedRightValue),
    rightValue: resolvedRightValue,
  };
}

export async function getDonorComparisonPageData(
  leftValue?: string,
  rightValue?: string,
): Promise<ComparisonPageData & { userEmail: string | null }> {
  const { briefs, userEmail } = await requireDonorBriefs();
  const options = briefs.map((brief) => ({
    label: brief.organization.legal_name,
    value: brief.slug ?? brief.id,
  }));
  const resolvedLeftValue = leftValue ?? options[0]?.value ?? null;
  const resolvedRightValue =
    rightValue ?? options.find((item) => item.value !== resolvedLeftValue)?.value ?? resolvedLeftValue;

  async function loadRecord(slug: string | null) {
    if (!slug) {
      return null;
    }

    const data = await getPublishedBriefBySlug(slug);

    if (!data) {
      return null;
    }

    return buildCompareRecord({
      application: data.application,
      checks: data.externalChecks,
      fallbackRecommendation: data.brief.recommendation_level ?? data.scoreRecommendation,
      org: data.org,
    });
  }

  return {
    left: await loadRecord(resolvedLeftValue),
    leftValue: resolvedLeftValue,
    options,
    right: await loadRecord(resolvedRightValue),
    rightValue: resolvedRightValue,
    userEmail,
  };
}
