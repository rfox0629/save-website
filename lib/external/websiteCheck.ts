import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

const DOCTRINAL_TERMS = [
  "statement of faith",
  "what we believe",
  "doctrine",
  "beliefs",
] as const;
const GOSPEL_TERMS = ["gospel", "jesus", "salvation", "christ"] as const;
const FINANCIAL_TERMS = [
  "annual report",
  "financials",
  "form 990",
  "audited",
] as const;
const STAFF_TERMS = ["staff", "team", "leadership", "board"] as const;

type WebsiteCheckResult = {
  doctrinal_found: boolean;
  financial_found: boolean;
  gospel_found: boolean;
  staff_found: boolean;
  status: "fail" | "flag" | "pass";
  summary: string;
};

function normalizeUrl(websiteUrl: string) {
  if (/^https?:\/\//i.test(websiteUrl)) {
    return websiteUrl;
  }

  return `https://${websiteUrl}`;
}

function containsAnyTerm(haystack: string, terms: readonly string[]) {
  return terms.some((term) => haystack.includes(term));
}

function buildSummary(result: Omit<WebsiteCheckResult, "status" | "summary">) {
  const found: string[] = [];
  const missing: string[] = [];

  if (result.doctrinal_found) found.push("doctrinal language");
  else missing.push("doctrinal language");

  if (result.gospel_found) found.push("gospel language");
  else missing.push("gospel language");

  if (result.financial_found) found.push("financial transparency terms");
  else missing.push("financial transparency terms");

  if (result.staff_found) found.push("staff/leadership information");
  else missing.push("staff/leadership information");

  return `Found: ${found.join(", ") || "none"}. Missing: ${missing.join(", ") || "none"}.`;
}

export async function checkWebsite(
  websiteUrl: string,
  applicationId: string,
): Promise<WebsiteCheckResult> {
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;
  const normalizedUrl = normalizeUrl(websiteUrl);

  await db
    .from("external_checks")
    .delete()
    .eq("application_id", applicationId)
    .eq("source", "website");

  try {
    const headController = new AbortController();
    const headTimeout = setTimeout(() => headController.abort(), 8000);

    const headResponse = await fetch(normalizedUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: headController.signal,
    }).finally(() => clearTimeout(headTimeout));

    if (!headResponse.ok) {
      const summary = "Website returned error or is unreachable";
      await db.from("external_checks").insert({
        application_id: applicationId,
        raw_result: {
          status: headResponse.status,
          url: normalizedUrl,
        },
        score_impact: null,
        source: "website",
        status: "flag",
        summary,
      } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

      return {
        doctrinal_found: false,
        financial_found: false,
        gospel_found: false,
        staff_found: false,
        status: "flag",
        summary,
      };
    }

    const htmlController = new AbortController();
    const htmlTimeout = setTimeout(() => htmlController.abort(), 8000);

    const html = await fetch(normalizedUrl, {
      method: "GET",
      redirect: "follow",
      signal: htmlController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Website fetch failed with status ${response.status}`,
          );
        }

        return response.text();
      })
      .finally(() => clearTimeout(htmlTimeout));

    const lowerHtml = html.toLowerCase();
    const doctrinal_found = containsAnyTerm(lowerHtml, DOCTRINAL_TERMS);
    const gospel_found = containsAnyTerm(lowerHtml, GOSPEL_TERMS);
    const financial_found = containsAnyTerm(lowerHtml, FINANCIAL_TERMS);
    const staff_found = containsAnyTerm(lowerHtml, STAFF_TERMS);

    const status = !gospel_found
      ? "fail"
      : gospel_found && doctrinal_found && staff_found
        ? "pass"
        : "flag";
    const summary = buildSummary({
      doctrinal_found,
      financial_found,
      gospel_found,
      staff_found,
    });

    await db.from("external_checks").insert({
      application_id: applicationId,
      raw_result: {
        checks: {
          doctrinal_found,
          financial_found,
          gospel_found,
          staff_found,
        },
        url: normalizedUrl,
      },
      score_impact: null,
      source: "website",
      status,
      summary,
    } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

    return {
      doctrinal_found,
      financial_found,
      gospel_found,
      staff_found,
      status,
      summary,
    };
  } catch {
    const summary = "Website returned error or is unreachable";

    await db.from("external_checks").insert({
      application_id: applicationId,
      raw_result: {
        url: normalizedUrl,
      },
      score_impact: null,
      source: "website",
      status: "flag",
      summary,
    } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

    return {
      doctrinal_found: false,
      financial_found: false,
      gospel_found: false,
      staff_found: false,
      status: "flag",
      summary,
    };
  }
}
