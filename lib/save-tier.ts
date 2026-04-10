import type { PublicVoiceAlignmentData } from "@/lib/brief";

export type SaveTier =
  | "High Confidence Opportunity"
  | "Strong Opportunity"
  | "Proceed with Discernment"
  | "Not Recommended";

type SaveTierInput = {
  categoryConfidences?: Array<string | null | undefined>;
  recommendation?: string | null;
  strengths?: string[] | null;
  risks?: string[] | null;
  voiceAlignmentStatus?: PublicVoiceAlignmentData["status"] | "insufficient_data" | null;
};

function normalizeRecommendation(recommendation: string | null | undefined) {
  if (!recommendation) {
    return "mixed";
  }

  const normalized = recommendation.trim().toLowerCase();

  if (
    normalized === "advance" ||
    normalized === "strongly recommended" ||
    normalized === "recommended"
  ) {
    return "positive";
  }

  if (
    normalized === "hold" ||
    normalized === "not recommended" ||
    normalized === "decline" ||
    normalized === "hard stop"
  ) {
    return "negative";
  }

  return "mixed";
}

export function getSaveTier(input: SaveTierInput): SaveTier {
  const recommendationState = normalizeRecommendation(input.recommendation);
  const risksCount = input.risks?.filter((item) => item.trim()).length ?? 0;
  const strengthsCount = input.strengths?.filter((item) => item.trim()).length ?? 0;
  const lowConfidenceCount =
    input.categoryConfidences?.filter((value) => value === "low").length ?? 0;
  const voiceStatus = input.voiceAlignmentStatus ?? null;

  const heavyNegative =
    recommendationState === "negative" ||
    risksCount >= 4 ||
    lowConfidenceCount >= 3;
  const lowRisk = risksCount <= 1 && lowConfidenceCount <= 1;
  const moderateRisk = risksCount <= 3 && lowConfidenceCount <= 2;

  if (heavyNegative) {
    return "Not Recommended";
  }

  if (
    recommendationState === "positive" &&
    lowRisk &&
    voiceStatus === "aligned"
  ) {
    return "High Confidence Opportunity";
  }

  if (
    recommendationState === "positive" &&
    moderateRisk &&
    voiceStatus !== "misaligned"
  ) {
    return "Strong Opportunity";
  }

  if (
    recommendationState === "mixed" &&
    strengthsCount > risksCount &&
    moderateRisk &&
    voiceStatus === "aligned"
  ) {
    return "Strong Opportunity";
  }

  return "Proceed with Discernment";
}

export function getSaveTierClass(
  tier: SaveTier,
  theme: "dark" | "light" = "light",
) {
  if (theme === "dark") {
    switch (tier) {
      case "High Confidence Opportunity":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
      case "Strong Opportunity":
        return "border-sky-400/20 bg-sky-400/10 text-sky-200";
      case "Proceed with Discernment":
        return "border-amber-400/20 bg-amber-400/10 text-amber-200";
      default:
        return "border-rose-400/20 bg-rose-400/10 text-rose-200";
    }
  }

  switch (tier) {
    case "High Confidence Opportunity":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "Strong Opportunity":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "Proceed with Discernment":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-rose-200 bg-rose-50 text-rose-900";
  }
}
