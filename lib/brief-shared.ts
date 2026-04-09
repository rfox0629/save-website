import type { DonorBrief, Organizations } from "@/lib/supabase/types";

export const RECOMMENDATION_LEVELS = [
  "Strongly Recommended",
  "Recommended",
  "Recommended with Conditions",
  "Not Recommended",
] as const;

export type RecommendationLevel = (typeof RECOMMENDATION_LEVELS)[number];

export type BriefFormData = {
  cautions: string[];
  commendations: string[];
  headline: string;
  include_voice_alignment: boolean;
  ministry_description: string;
  published: boolean;
  recommendation_level: RecommendationLevel;
};

export const DILIGENCE_CHECKLIST = [
  "Inquiry form reviewed",
  "Deep vetting form reviewed",
  "Score generated and reviewed",
  "Risk flags assessed",
  "Document uploads verified",
  "External checks completed",
  "Reviewer notes logged",
  "Recommendation finalized",
] as const;

export function getOrganizationLocation(org: Organizations) {
  if (org.countries.length > 0) {
    return org.countries.join(", ");
  }

  if (org.state_of_incorporation) {
    return org.state_of_incorporation;
  }

  return "Location not provided";
}

export function getBriefRationale(
  level: RecommendationLevel | string | null,
  cautions: string[],
) {
  switch (level) {
    case "Strongly Recommended":
      return "This ministry presents strong mission alignment, credible leadership, and a donor-ready level of organizational diligence. We believe it can be recommended with confidence based on the information reviewed.";
    case "Recommended":
      return "This ministry demonstrates meaningful alignment and a solid overall diligence profile. We believe it is a reasonable giving opportunity with normal donor discretion.";
    case "Recommended with Conditions":
      return cautions.length > 0
        ? `This ministry may be support-worthy, but donors should weigh a few important considerations before giving, especially around ${cautions[0]}. Additional monitoring or clarification is advisable.`
        : "This ministry may be support-worthy, but donors should weigh a few important considerations before giving. Additional monitoring or clarification is advisable.";
    case "Not Recommended":
      return "Based on the diligence completed, we are not comfortable recommending this ministry for donor support at this time. Material concerns remain unresolved or outside our acceptable risk threshold.";
    default:
      return "SAVE completed a structured diligence review to help donors understand the ministry, its strengths, and any areas that may warrant added discernment.";
  }
}

export function getRecommendationBadgeClass(level: string | null) {
  if (level === "Strongly Recommended") {
    return "border-emerald-500/30 bg-emerald-500/12 text-emerald-200";
  }

  if (level === "Recommended") {
    return "border-sky-500/30 bg-sky-500/12 text-sky-200";
  }

  if (level === "Recommended with Conditions") {
    return "border-amber-500/30 bg-amber-500/12 text-amber-200";
  }

  if (level === "Not Recommended") {
    return "border-rose-500/30 bg-rose-500/12 text-rose-200";
  }

  return "border-slate-400/20 bg-slate-400/10 text-slate-200";
}

export function toBriefFormData(brief: DonorBrief | null): BriefFormData {
  return {
    cautions:
      brief?.cautions && brief.cautions.length > 0 ? brief.cautions : ["", ""],
    commendations:
      brief?.commendations && brief.commendations.length > 0
        ? [...brief.commendations, "", ""].slice(0, 3)
        : ["", "", ""],
    headline: brief?.headline ?? "",
    include_voice_alignment: brief?.include_voice_alignment ?? false,
    ministry_description: brief?.ministry_description ?? "",
    published: brief?.published ?? false,
    recommendation_level:
      (brief?.recommendation_level as RecommendationLevel | null) ??
      "Recommended",
  };
}
