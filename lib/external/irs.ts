import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type OrganizationPayload = {
  asset_amount: number | null;
  data_source: string | null;
  ein: number | null;
  income_amount: number | null;
  name: string | null;
  ntee_code: string | null;
  revenue_amount: number | null;
  ruling_date: string | null;
  state: string | null;
  subsection_code: number | string | null;
};

type FilingPayload = {
  compnsatncurrofcr?: number | null;
  feesforsrvcfundraising?: number | null;
  feesforsrvcmgmnt?: number | null;
  formtype?: number | string | null;
  noemplyeesw3cnt?: number | null;
  othrsalwages?: number | null;
  pdf_url?: string | null;
  tax_prd_yr?: number | null;
  totassetsend?: number | null;
  totfuncexpns?: number | null;
  totliabend?: number | null;
  totrevenue?: number | null;
};

type ProPublicaOrganizationResponse = {
  filings_with_data?: FilingPayload[];
  organization?: OrganizationPayload & {
    out_of_date_of_501c3?: boolean | null;
  };
};

type IRSCheckResult = {
  asset_amount: number | null;
  employee_count: number | null;
  found: boolean;
  income_amount: number | null;
  isHardStop: boolean;
  latestFilingYear: number | null;
  latestFiling?: {
    employee_count: number | null;
    paid_contractor_compensation: number | null;
    program_expense_ratio: number | null;
    total_assets: number | null;
    total_expenses: number | null;
    total_revenue: number | null;
    year: number | null;
  };
  name: string | null;
  ntee_code: string | null;
  out_of_date_of_501c3: boolean;
  paid_contractor_compensation: number | null;
  revenue_amount: number | null;
  ruling_date: string | null;
  subsection_code: number | string | null;
};

function normalizeEin(ein: string) {
  return ein.replace(/\D/g, "");
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "n/a";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRatio(value: number | null) {
  if (value === null) {
    return "n/a";
  }

  return `${Math.round(value * 100)}%`;
}

function getProgramExpenseRatio(filing: FilingPayload) {
  const totalExpenses = asNumber(filing.totfuncexpns);

  if (!totalExpenses || totalExpenses <= 0) {
    return null;
  }

  const managementExpenses = asNumber(filing.feesforsrvcmgmnt) ?? 0;
  const fundraisingExpenses = asNumber(filing.feesforsrvcfundraising) ?? 0;

  return Math.max(
    0,
    Math.min(
      1,
      (totalExpenses - managementExpenses - fundraisingExpenses) /
        totalExpenses,
    ),
  );
}

function getFilingStatus(programExpenseRatio: number | null) {
  if (programExpenseRatio === null) {
    return "flag" as const;
  }

  if (programExpenseRatio >= 0.7) {
    return "pass" as const;
  }

  if (programExpenseRatio >= 0.6) {
    return "flag" as const;
  }

  return "fail" as const;
}

function isNotFoundOrganization(organization: OrganizationPayload | undefined) {
  return (
    !organization ||
    organization.name === "Unknown Organization" ||
    organization.data_source === null
  );
}

export async function checkIRS(
  ein: string,
  applicationId: string,
): Promise<IRSCheckResult> {
  const normalizedEin = normalizeEin(ein);
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any;

  await db
    .from("external_checks")
    .delete()
    .eq("application_id", applicationId)
    .eq("source", "irs_teos");

  await db
    .from("external_checks")
    .delete()
    .eq("application_id", applicationId)
    .like("source", "form_990%");

  const response = await fetch(
    `https://projects.propublica.org/nonprofits/api/v2/organizations/${normalizedEin}.json`,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`IRS lookup failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ProPublicaOrganizationResponse;
  const organization = payload.organization;
  const filings = (payload.filings_with_data ?? [])
    .slice()
    .sort((left, right) => (right.tax_prd_yr ?? 0) - (left.tax_prd_yr ?? 0));

  if (isNotFoundOrganization(organization)) {
    await db.from("external_checks").insert({
      application_id: applicationId,
      source: "irs_teos",
      status: "flag",
      summary: "EIN not found in IRS database",
      raw_result: payload,
      score_impact: null,
    } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

    return {
      asset_amount: null,
      employee_count: null,
      found: false,
      income_amount: null,
      isHardStop: false,
      latestFilingYear: null,
      name: null,
      ntee_code: null,
      out_of_date_of_501c3: false,
      paid_contractor_compensation: null,
      revenue_amount: null,
      ruling_date: null,
      subsection_code: null,
    };
  }

  const subsectionCode =
    organization?.subsection_code ??
    // ProPublica has used multiple key names historically; keep a fallback.
    ((payload.organization as Record<string, unknown> | undefined)?.subseccd as
      | number
      | string
      | null
      | undefined) ??
    null;
  const revocationFlag =
    ((payload.organization as Record<string, unknown> | undefined)
      ?.out_of_date_of_501c3 as boolean | null | undefined) ?? false;
  const irsStatus =
    revocationFlag === true
      ? "fail"
      : String(subsectionCode) === "3"
        ? "pass"
        : "flag";
  const latestFiling = filings[0] ?? null;
  const latestProgramExpenseRatio = latestFiling
    ? getProgramExpenseRatio(latestFiling)
    : null;
  const latestFilingStatus = getFilingStatus(latestProgramExpenseRatio);
  const paidContractorCompensation = latestFiling
    ? (asNumber(latestFiling.feesforsrvcmgmnt) ?? 0) +
      (asNumber(latestFiling.feesforsrvcfundraising) ?? 0)
    : null;

  await db.from("external_checks").insert({
    application_id: applicationId,
    source: "irs_teos",
    status: irsStatus,
    summary:
      irsStatus === "fail"
        ? "Organization appears revoked or out of date as a 501(c)(3)."
        : `IRS record found for ${organization?.name ?? "organization"}${String(subsectionCode) === "3" ? " with 501(c)(3) status." : "."}`,
    raw_result: payload,
    score_impact: revocationFlag ? -100 : null,
  } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);

  if (latestFiling) {
    await db.from("external_checks").insert({
      application_id: applicationId,
      source: "form_990",
      status: latestFilingStatus,
      summary: `Latest Form 990 (${latestFiling.tax_prd_yr ?? "n/a"}): revenue ${formatCurrency(asNumber(latestFiling.totrevenue))}, expenses ${formatCurrency(asNumber(latestFiling.totfuncexpns))}, program ratio ${formatRatio(latestProgramExpenseRatio)}.`,
      raw_result: latestFiling,
      score_impact:
        latestFilingStatus === "pass"
          ? 2
          : latestFilingStatus === "flag"
            ? 0
            : -2,
    } satisfies Database["public"]["Tables"]["external_checks"]["Insert"]);
  }

  if (filings.length > 0) {
    await db.from("external_checks").insert(
      filings.slice(0, 3).map((filing) => ({
        application_id: applicationId,
        source: `form_990_${filing.tax_prd_yr ?? "unknown"}`,
        status: getFilingStatus(getProgramExpenseRatio(filing)),
        summary: `Form 990 ${filing.tax_prd_yr ?? "n/a"}: revenue ${formatCurrency(asNumber(filing.totrevenue))}, expenses ${formatCurrency(asNumber(filing.totfuncexpns))}, assets ${formatCurrency(asNumber(filing.totassetsend))}.`,
        raw_result: filing,
        score_impact: null,
      })),
    );
  }

  return {
    asset_amount: organization?.asset_amount ?? null,
    employee_count: latestFiling
      ? asNumber(latestFiling.noemplyeesw3cnt)
      : null,
    found: true,
    income_amount: organization?.income_amount ?? null,
    isHardStop: revocationFlag === true,
    latestFiling: latestFiling
      ? {
          employee_count: asNumber(latestFiling.noemplyeesw3cnt),
          paid_contractor_compensation: paidContractorCompensation,
          program_expense_ratio: latestProgramExpenseRatio,
          total_assets: asNumber(latestFiling.totassetsend),
          total_expenses: asNumber(latestFiling.totfuncexpns),
          total_revenue: asNumber(latestFiling.totrevenue),
          year: latestFiling.tax_prd_yr ?? null,
        }
      : undefined,
    latestFilingYear: latestFiling?.tax_prd_yr ?? null,
    name: organization?.name ?? null,
    ntee_code: organization?.ntee_code ?? null,
    out_of_date_of_501c3: revocationFlag === true,
    paid_contractor_compensation: paidContractorCompensation,
    revenue_amount: organization?.revenue_amount ?? null,
    ruling_date: organization?.ruling_date ?? null,
    subsection_code: subsectionCode,
  };
}
