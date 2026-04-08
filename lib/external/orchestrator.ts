import "server-only";

import { generateReviewerSummary } from "@/lib/ai/reviewerSummary";
import { checkCharityNavigator } from "@/lib/external/charityNavigator";
import { analyzeDocuments } from "@/lib/external/documentAnalysis";
import { checkIRS } from "@/lib/external/irs";
import { checkReputation } from "@/lib/external/reputationCheck";
import { checkWebsite } from "@/lib/external/websiteCheck";
import { scoreApplication } from "@/lib/scoring/persist";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Applications,
  Organizations,
  VettingResponse,
} from "@/lib/supabase/types";

type LoadedApplication = Applications & {
  organizations: Organizations | null;
  vetting_responses: VettingResponse | null;
};

export async function runFullVetting(applicationId: string) {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: application } = await db
    .from("applications")
    .select("*, organizations(*), vetting_responses(*)")
    .eq("id", applicationId)
    .maybeSingle();

  const loadedApplication = application as LoadedApplication | null;

  if (!loadedApplication?.organizations) {
    throw new Error("Application organization could not be loaded.");
  }

  const org = loadedApplication.organizations;

  const checks: Promise<unknown>[] = [
    analyzeDocuments(applicationId),
    checkReputation(org.legal_name, org.ein ?? "", applicationId),
  ];

  if (org.ein) {
    checks.push(
      checkIRS(org.ein, applicationId),
      checkCharityNavigator(org.ein, applicationId),
    );
  }

  if (org.website_url) {
    checks.push(checkWebsite(org.website_url, applicationId));
  }

  await Promise.allSettled(checks);
  const score = await scoreApplication(applicationId);

  const { data: hardStops } = await db
    .from("risk_flags")
    .select("id")
    .eq("application_id", applicationId)
    .eq("severity", "hard_stop");

  if ((hardStops?.length ?? 0) > 0 || score.is_hard_stop) {
    await db
      .from("applications")
      .update({ status: "hard_stop" })
      .eq("id", applicationId);
  } else {
    await db
      .from("applications")
      .update({ status: "under_review" })
      .eq("id", applicationId);
  }

  try {
    await generateReviewerSummary(applicationId);
  } catch (error) {
    console.error("generateReviewerSummary failed", error);
  }

  return score;
}
