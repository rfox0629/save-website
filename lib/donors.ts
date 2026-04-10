import { redirect } from "next/navigation";

import { parseReviewerSummary, type ReviewerSummary } from "@/lib/ai/reviewerSummary";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPathForRole } from "@/lib/auth";
import { getSaveTier, type SaveTier } from "@/lib/save-tier";
import { getViewerContext } from "@/lib/view-mode";
import { parseVoiceAlignmentInsight, type VoiceAlignmentInsight } from "@/lib/voice-alignment";
import type {
  Applications,
  DonorBrief,
  Organizations,
  RiskFlag,
  Score,
  VoiceAlignmentSummaryRecord,
} from "@/lib/supabase/types";

export type PublishedBriefCard = DonorBrief & {
  aiSummary: ReviewerSummary | null;
  application: Pick<Applications, "id" | "status" | "updated_at">;
  categorySummary: string;
  highestRiskSeverity: RiskFlag["severity"] | null;
  organization: Organizations;
  recommendationLabel: string;
  riskFlagCount: number;
  saveTier: SaveTier;
  score: Score | null;
  voiceAlignment: {
    status: VoiceAlignmentInsight["alignment_status"];
    summary: VoiceAlignmentInsight;
  } | null;
};

function getScoreRecommendation(score: Score | null) {
  if (!score) {
    return "Not scored";
  }

  if (score.is_hard_stop) {
    return "Hard stop";
  }

  if ((score.total_score ?? 0) >= 80) {
    return "Recommend";
  }

  if ((score.total_score ?? 0) >= 65) {
    return "Proceed with caution";
  }

  return "Decline";
}

function severityRank(severity: RiskFlag["severity"]) {
  switch (severity) {
    case "hard_stop":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function getHighestSeverity(flags: RiskFlag[]) {
  if (flags.length === 0) {
    return null;
  }

  return [...flags].sort(
    (left, right) => severityRank(right.severity) - severityRank(left.severity),
  )[0]?.severity ?? null;
}

function buildCategorySummary(summary: ReviewerSummary | null) {
  if (!summary) {
    return "Structured summary not available yet.";
  }

  const categories = [
    [
      "Leadership",
      summary.leadership_integrity.confidence,
      summary.leadership_integrity.confidence === "high"
        ? "strong"
        : "solid",
    ],
    [
      "Doctrine",
      summary.doctrine.confidence,
      summary.doctrine.confidence === "high" ? "clear" : "steady",
    ],
    [
      "Governance",
      summary.governance.confidence,
      summary.governance.confidence === "high" ? "strong" : "solid",
    ],
    [
      "Financials",
      summary.financial_stewardship.confidence,
      summary.financial_stewardship.confidence === "high" ? "clean" : "stable",
    ],
    [
      "Fruit",
      summary.fruit.confidence,
      summary.fruit.confidence === "high" ? "evident" : "visible",
    ],
  ] as const;

  const highSignals = categories
    .filter(([, confidence]) => confidence === "high")
    .map(([label, , descriptor]) => `${label} ${descriptor}`);

  if (highSignals.length > 0) {
    return highSignals.slice(0, 3).join(" • ");
  }

  const moderateSignals = categories
    .filter(([, confidence]) => confidence === "medium")
    .map(([label, , descriptor]) => `${label} ${descriptor}`);

  if (moderateSignals.length > 0) {
    return moderateSignals.slice(0, 3).join(" • ");
  }

  return "Mixed signals • Further diligence needed";
}

export async function requireDonorBriefs() {
  const viewer = await getViewerContext();

  if (!viewer.userId) {
    redirect("/login");
  }

  if (!viewer.realRole) {
    redirect("/login");
  }

  if (
    viewer.realRole !== "donor" &&
    !(viewer.canPreview && viewer.currentViewMode === "donor")
  ) {
    redirect(getPathForRole(viewer.realRole));
  }

  const admin = createAdminClient();
  const { data: briefs } = await admin
    .from("donor_briefs")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const resolvedBriefs = ((briefs ?? []) as DonorBrief[]).filter((brief) =>
    Boolean(brief.slug),
  );
  const organizationIds = Array.from(
    new Set(resolvedBriefs.map((brief) => brief.application_id)),
  );

  if (organizationIds.length === 0) {
    return {
      briefs: [] as PublishedBriefCard[],
      canPreview: viewer.canPreview,
      currentViewMode: viewer.currentViewMode,
      userEmail: viewer.userEmail,
    };
  }

  const { data: applications } = await admin
    .from("applications")
    .select("id, organization_id, status, updated_at, ai_summary")
    .in("id", organizationIds);
  const resolvedApplications = (applications ?? []) as Array<
    Pick<
      Applications,
      "ai_summary" | "id" | "organization_id" | "status" | "updated_at"
    >
  >;

  const applicationMap = new Map(
    resolvedApplications.map((application) => [application.id, application]),
  );
  const orgIds = Array.from(
    new Set(
      resolvedBriefs
        .map((brief) => applicationMap.get(brief.application_id)?.organization_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const { data: organizations } = await admin
    .from("organizations")
    .select("*")
    .in("id", orgIds);

  const organizationMap = new Map(
    ((organizations ?? []) as Organizations[]).map((organization) => [
      organization.id,
      organization,
    ]),
  );

  const [scoresResult, flagsResult, voiceAlignmentResult] = await Promise.all([
    admin
      .from("scores")
      .select("*")
      .in("application_id", organizationIds)
      .order("calculated_at", { ascending: false }),
    admin
      .from("risk_flags")
      .select("*")
      .in("application_id", organizationIds),
    admin
      .from("voice_alignment_summaries")
      .select("*")
      .in("application_id", organizationIds),
  ]);

  const latestScoreMap = new Map<string, Score>();
  for (const score of (scoresResult.data ?? []) as Score[]) {
    if (!latestScoreMap.has(score.application_id)) {
      latestScoreMap.set(score.application_id, score);
    }
  }

  const flagsByApplication = new Map<string, RiskFlag[]>();
  for (const flag of (flagsResult.data ?? []) as RiskFlag[]) {
    const current = flagsByApplication.get(flag.application_id) ?? [];
    current.push(flag);
    flagsByApplication.set(flag.application_id, current);
  }

  const voiceAlignmentMap = new Map(
    ((voiceAlignmentResult.data ?? []) as VoiceAlignmentSummaryRecord[]).map(
      (record) => [record.application_id, record],
    ),
  );

  return {
    canPreview: viewer.canPreview,
    currentViewMode: viewer.currentViewMode,
    userEmail: viewer.userEmail,
    briefs: resolvedBriefs
      .map((brief) => {
        const application = applicationMap.get(brief.application_id);
        const organization = application
          ? organizationMap.get(application.organization_id)
          : undefined;

        if (!organization || !application) {
          return null;
        }

        const aiSummary = parseReviewerSummary(application.ai_summary);
        const score = latestScoreMap.get(application.id) ?? null;
        const flags = flagsByApplication.get(application.id) ?? [];
        const highestRiskSeverity = getHighestSeverity(flags);
        const voiceAlignmentRecord = voiceAlignmentMap.get(application.id) ?? null;
        const voiceAlignmentSummary = parseVoiceAlignmentInsight(
          voiceAlignmentRecord?.summary ?? null,
        );
        const voiceAlignment =
          voiceAlignmentSummary &&
          voiceAlignmentRecord &&
          voiceAlignmentRecord.status !== "insufficient_data"
            ? {
                status: voiceAlignmentSummary.alignment_status,
                summary: voiceAlignmentSummary,
              }
            : null;
        const recommendationLabel =
          brief.recommendation_level ?? getScoreRecommendation(score);
        const saveTier = getSaveTier({
          categoryConfidences: aiSummary
            ? [
                aiSummary.leadership_integrity.confidence,
                aiSummary.doctrine.confidence,
                aiSummary.governance.confidence,
                aiSummary.financial_stewardship.confidence,
                aiSummary.fruit.confidence,
              ]
            : [],
          recommendation: recommendationLabel,
          risks: aiSummary?.top_risks ?? brief.cautions ?? [],
          strengths: aiSummary?.top_strengths ?? brief.commendations ?? [],
          voiceAlignmentStatus: voiceAlignment?.status ?? null,
        });

        return {
          ...brief,
          aiSummary,
          application: {
            id: application.id,
            status: application.status,
            updated_at: application.updated_at,
          },
          categorySummary: buildCategorySummary(aiSummary),
          highestRiskSeverity,
          organization,
          recommendationLabel,
          riskFlagCount: flags.length,
          saveTier,
          score,
          voiceAlignment,
        };
      })
      .filter((brief): brief is PublishedBriefCard => brief !== null),
  };
}
