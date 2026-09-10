import type { PublicVoiceAlignmentData } from "@/lib/brief";

export type SaveTier =
  | "Ready for partnership"
  | "Strong and worth knowing"
  | "Worth a conversation"
  | "Not ready";

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
    return "Not ready";
  }

  if (
    recommendationState === "positive" &&
    lowRisk &&
    voiceStatus === "aligned"
  ) {
    return "Ready for partnership";
  }

  if (
    recommendationState === "positive" &&
    moderateRisk &&
    voiceStatus !== "misaligned"
  ) {
    return "Strong and worth knowing";
  }

  if (
    recommendationState === "mixed" &&
    strengthsCount > risksCount &&
    moderateRisk &&
    voiceStatus === "aligned"
  ) {
    return "Strong and worth knowing";
  }

  return "Worth a conversation";
}

export function getSaveTierClass(
  tier: SaveTier,
  theme: "dark" | "light" = "light",
) {
  if (theme === "dark") {
    switch (tier) {
      case "Ready for partnership":
        return "border-blue-400/20 bg-blue-400/10 text-blue-200";
      case "Strong and worth knowing":
        return "border-sky-400/20 bg-sky-400/10 text-sky-200";
      case "Worth a conversation":
        return "border-amber-400/20 bg-amber-400/10 text-amber-200";
      default:
        return "border-rose-400/20 bg-rose-400/10 text-rose-200";
    }
  }

  switch (tier) {
    case "Ready for partnership":
      return "border-blue-200 bg-blue-50 text-blue-900";
    case "Strong and worth knowing":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "Worth a conversation":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-rose-200 bg-rose-50 text-rose-900";
  }
}
