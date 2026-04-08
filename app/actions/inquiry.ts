"use server";

import { redirect } from "next/navigation";

import { inquiryFormSchema, type InquiryFormValues } from "@/lib/inquiry";
import { createClient } from "@/lib/supabase/server";
import type {
  Applications,
  InquiryResponse,
  Organizations,
  Profile,
} from "@/lib/supabase/types";

type InquiryLoadResult = {
  applicationId: string | null;
  applicationStatus: string | null;
  initialValues: Partial<InquiryFormValues>;
  readOnly: boolean;
  submittedAt: string | null;
};

type InquiryDraftResult = {
  applicationId?: string;
  error?: string;
};

async function getMinistryContext() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();
  const resolvedProfile = profile as Pick<
    Profile,
    "organization_id" | "role"
  > | null;

  if (
    profileError ||
    !resolvedProfile ||
    resolvedProfile.role !== "ministry" ||
    !resolvedProfile.organization_id
  ) {
    redirect("/dashboard");
  }

  return {
    organizationId: resolvedProfile.organization_id,
    supabase,
    user,
  };
}

function asFormValue<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

function normalizeLoadedValues(rawData: Record<string, unknown> | null) {
  return {
    attestation_complete:
      typeof rawData?.attestation_complete === "boolean"
        ? rawData.attestation_complete
        : undefined,
    attestation_research:
      typeof rawData?.attestation_research === "boolean"
        ? rawData.attestation_research
        : undefined,
    board_compensated:
      typeof rawData?.board_compensated === "string"
        ? rawData.board_compensated
        : undefined,
    countries: Array.isArray(rawData?.countries)
      ? rawData.countries.filter(
          (value): value is string => typeof value === "string",
        )
      : undefined,
    doctrinal_statement_public:
      typeof rawData?.doctrinal_statement_public === "boolean"
        ? rawData.doctrinal_statement_public
        : undefined,
    files_990:
      typeof rawData?.files_990 === "string" ? rawData.files_990 : undefined,
    media_presence_url:
      typeof rawData?.media_presence_url === "string"
        ? rawData.media_presence_url
        : undefined,
    ordaining_body:
      typeof rawData?.ordaining_body === "string"
        ? rawData.ordaining_body
        : undefined,
  };
}

function mapDraftToPersistence(values: InquiryFormValues) {
  return {
    inquiryResponse: {
      annual_reach: values.annual_reach,
      annual_revenue_range: values.annual_revenue_range,
      audit_level: values.audit_level,
      baptism_position: values.baptism_position,
      board_approved_budget: values.board_approved_budget,
      board_compensated: values.board_compensated !== "None compensated",
      board_size: values.board_size,
      denomination: values.denomination,
      doctrinal_statement_url: values.doctrinal_statement_public
        ? values.doctrinal_statement_url
        : null,
      files_990:
        values.files_990 === "Exempt" ? null : values.files_990 === "Yes",
      financial_investigation: values.financial_investigation,
      funding_rationale: values.funding_rationale,
      funding_sources: values.funding_sources,
      gospel_clarity: values.gospel_clarity,
      has_references: values.has_references,
      key_metric: values.key_metric,
      lead_name: values.lead_name,
      legal_action: values.legal_action,
      moral_failure: values.moral_failure,
      ordination_status: values.ordination_status,
      raw_data: {
        attestation_complete: values.attestation_complete,
        attestation_research: values.attestation_research,
        board_compensated: values.board_compensated,
        countries: values.countries,
        doctrinal_statement_public: values.doctrinal_statement_public,
        files_990: values.files_990,
        media_presence_url: values.media_presence_url,
        ordaining_body: values.ordaining_body,
      },
      referral_source: values.referral_source,
      scripture_position: values.scripture_position,
      theological_education: values.theological_education,
      years_in_role: values.years_in_role,
    },
    organization: {
      dba_name: values.dba_name || null,
      ein: values.ein,
      entity_type:
        values.entity_type === "501(c)(3)"
          ? "501c3"
          : values.entity_type === "501(c)(4)"
            ? "501c4"
            : values.entity_type,
      geographic_scope: [values.geographic_scope],
      countries:
        values.geographic_scope === "International" ||
        values.geographic_scope === "Multi-national"
          ? values.countries
          : [],
      legal_name: values.legal_name,
      primary_focus: values.primary_focus.map((focus) =>
        focus === "Relief & development"
          ? "Relief/development"
          : focus === "Media & publishing"
            ? "Media/publishing"
            : focus,
      ),
      state_of_incorporation: values.state_of_incorporation,
      website_url: values.website_url || null,
      year_founded: values.year_founded,
    },
  };
}

function isReadOnlyStatus(status: string | null, submittedAt: string | null) {
  if (submittedAt) {
    return true;
  }

  return [
    "inquiry_approved",
    "inquiry_rejected",
    "vetting_submitted",
    "under_review",
    "approved",
    "declined",
    "hard_stop",
    "decided",
  ].includes(status ?? "");
}

export async function loadInquiryDraft(): Promise<InquiryLoadResult> {
  const { organizationId, supabase } = await getMinistryContext();

  const { data: application } = await supabase
    .from("applications")
    .select("id, status")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const resolvedApplication = application as Pick<
    Applications,
    "id" | "status"
  > | null;

  const [{ data: organization }, { data: inquiry }] = await Promise.all([
    supabase
      .from("organizations")
      .select(
        "legal_name, dba_name, ein, year_founded, state_of_incorporation, entity_type, primary_focus, countries, geographic_scope, website_url",
      )
      .eq("id", organizationId)
      .maybeSingle(),
    resolvedApplication
      ? supabase
          .from("inquiry_responses")
          .select(
            "lead_name, years_in_role, theological_education, ordination_status, board_size, board_compensated, denomination, doctrinal_statement_url, scripture_position, gospel_clarity, baptism_position, annual_revenue_range, funding_sources, files_990, audit_level, board_approved_budget, annual_reach, key_metric, has_references, legal_action, moral_failure, financial_investigation, funding_rationale, referral_source, raw_data, submitted_at",
          )
          .eq("application_id", resolvedApplication.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const resolvedOrganization = organization as Pick<
    Organizations,
    | "countries"
    | "dba_name"
    | "ein"
    | "entity_type"
    | "geographic_scope"
    | "legal_name"
    | "primary_focus"
    | "state_of_incorporation"
    | "website_url"
    | "year_founded"
  > | null;
  const resolvedInquiry = inquiry as Pick<
    InquiryResponse,
    | "annual_reach"
    | "annual_revenue_range"
    | "audit_level"
    | "baptism_position"
    | "board_approved_budget"
    | "board_compensated"
    | "board_size"
    | "denomination"
    | "doctrinal_statement_url"
    | "files_990"
    | "financial_investigation"
    | "funding_rationale"
    | "funding_sources"
    | "gospel_clarity"
    | "has_references"
    | "key_metric"
    | "lead_name"
    | "legal_action"
    | "moral_failure"
    | "ordination_status"
    | "raw_data"
    | "referral_source"
    | "scripture_position"
    | "submitted_at"
    | "theological_education"
    | "years_in_role"
  > | null;

  const rawData =
    resolvedInquiry?.raw_data &&
    typeof resolvedInquiry.raw_data === "object" &&
    !Array.isArray(resolvedInquiry.raw_data)
      ? (resolvedInquiry.raw_data as Record<string, unknown>)
      : null;
  const normalized = normalizeLoadedValues(rawData);

  return {
    applicationId: resolvedApplication?.id ?? null,
    applicationStatus: resolvedApplication?.status ?? null,
    initialValues: {
      annual_reach: resolvedInquiry?.annual_reach ?? undefined,
      annual_revenue_range: asFormValue(
        resolvedInquiry?.annual_revenue_range as
          | InquiryFormValues["annual_revenue_range"]
          | null
          | undefined,
      ),
      attestation_complete: normalized.attestation_complete,
      attestation_research: normalized.attestation_research,
      audit_level: asFormValue(
        resolvedInquiry?.audit_level as
          | InquiryFormValues["audit_level"]
          | null
          | undefined,
      ),
      baptism_position: asFormValue(
        resolvedInquiry?.baptism_position as
          | InquiryFormValues["baptism_position"]
          | null
          | undefined,
      ),
      board_approved_budget:
        resolvedInquiry?.board_approved_budget ?? undefined,
      board_compensated: asFormValue(
        normalized.board_compensated as
          | InquiryFormValues["board_compensated"]
          | undefined,
      ),
      board_size: resolvedInquiry?.board_size ?? undefined,
      countries: (normalized.countries ??
        resolvedOrganization?.countries ??
        undefined) as InquiryFormValues["countries"] | undefined,
      dba_name: resolvedOrganization?.dba_name ?? undefined,
      denomination: asFormValue(
        resolvedInquiry?.denomination as
          | InquiryFormValues["denomination"]
          | null
          | undefined,
      ),
      doctrinal_statement_public: normalized.doctrinal_statement_public,
      doctrinal_statement_url:
        resolvedInquiry?.doctrinal_statement_url ?? undefined,
      ein: resolvedOrganization?.ein ?? undefined,
      entity_type: asFormValue(
        (resolvedOrganization?.entity_type === "501c3"
          ? "501(c)(3)"
          : resolvedOrganization?.entity_type === "501c4"
            ? "501(c)(4)"
            : resolvedOrganization?.entity_type) as
          | InquiryFormValues["entity_type"]
          | null
          | undefined,
      ),
      files_990: asFormValue(
        (normalized.files_990 ??
          (resolvedInquiry?.files_990 === null
            ? "Exempt"
            : resolvedInquiry?.files_990
              ? "Yes"
              : "No")) as InquiryFormValues["files_990"] | undefined,
      ),
      financial_investigation:
        resolvedInquiry?.financial_investigation ?? undefined,
      funding_rationale: resolvedInquiry?.funding_rationale ?? undefined,
      funding_sources: resolvedInquiry?.funding_sources as
        | InquiryFormValues["funding_sources"]
        | undefined,
      geographic_scope: asFormValue(
        resolvedOrganization?.geographic_scope?.[0] as
          | InquiryFormValues["geographic_scope"]
          | null
          | undefined,
      ),
      gospel_clarity: asFormValue(
        resolvedInquiry?.gospel_clarity as
          | InquiryFormValues["gospel_clarity"]
          | null
          | undefined,
      ),
      has_references: resolvedInquiry?.has_references ?? undefined,
      key_metric: resolvedInquiry?.key_metric ?? undefined,
      lead_name: resolvedInquiry?.lead_name ?? undefined,
      legal_action: resolvedInquiry?.legal_action ?? undefined,
      legal_name: resolvedOrganization?.legal_name ?? undefined,
      media_presence_url: normalized.media_presence_url,
      moral_failure: resolvedInquiry?.moral_failure ?? undefined,
      ordaining_body: normalized.ordaining_body,
      ordination_status: asFormValue(
        resolvedInquiry?.ordination_status as
          | InquiryFormValues["ordination_status"]
          | null
          | undefined,
      ),
      primary_focus: resolvedOrganization?.primary_focus?.map((focus) =>
        focus === "Relief/development"
          ? "Relief & development"
          : focus === "Media/publishing"
            ? "Media & publishing"
            : focus,
      ) as InquiryFormValues["primary_focus"] | undefined,
      referral_source: asFormValue(
        resolvedInquiry?.referral_source as
          | InquiryFormValues["referral_source"]
          | null
          | undefined,
      ),
      scripture_position: asFormValue(
        resolvedInquiry?.scripture_position as
          | InquiryFormValues["scripture_position"]
          | null
          | undefined,
      ),
      state_of_incorporation: asFormValue(
        resolvedOrganization?.state_of_incorporation as
          | InquiryFormValues["state_of_incorporation"]
          | null
          | undefined,
      ),
      theological_education: asFormValue(
        resolvedInquiry?.theological_education as
          | InquiryFormValues["theological_education"]
          | null
          | undefined,
      ),
      website_url: resolvedOrganization?.website_url ?? undefined,
      year_founded: resolvedOrganization?.year_founded ?? undefined,
      years_in_role: resolvedInquiry?.years_in_role ?? undefined,
    },
    readOnly: isReadOnlyStatus(
      resolvedApplication?.status ?? null,
      resolvedInquiry?.submitted_at ?? null,
    ),
    submittedAt: resolvedInquiry?.submitted_at ?? null,
  };
}

export async function saveInquiryDraft(
  values: InquiryFormValues,
  applicationId?: string | null,
): Promise<InquiryDraftResult> {
  const { organizationId, supabase } = await getMinistryContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const payload = mapDraftToPersistence(values);

  let resolvedApplicationId = applicationId ?? null;

  if (!resolvedApplicationId) {
    const { data: application, error: applicationError } = await db
      .from("applications")
      .insert({
        organization_id: organizationId,
        status: "draft",
      })
      .select("id")
      .single();

    if (applicationError || !application) {
      return {
        error:
          applicationError?.message ??
          "We could not create your draft application.",
      };
    }

    resolvedApplicationId = application.id;
  }

  const { error: organizationError } = await db
    .from("organizations")
    .update(payload.organization)
    .eq("id", organizationId);

  if (organizationError) {
    return { error: organizationError.message };
  }

  const { error: inquiryError } = await db.from("inquiry_responses").upsert(
    {
      application_id: resolvedApplicationId,
      ...payload.inquiryResponse,
      submitted_at: null,
    },
    {
      onConflict: "application_id",
    },
  );

  if (inquiryError) {
    return { error: inquiryError.message };
  }

  return { applicationId: resolvedApplicationId ?? undefined };
}

export async function submitInquiry(
  values: InquiryFormValues,
  applicationId?: string | null,
): Promise<InquiryDraftResult> {
  const parsed = inquiryFormSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  if (parsed.data.moral_failure || parsed.data.financial_investigation) {
    return {
      error:
        "Based on your response, we are unable to proceed with this application at this time.",
    };
  }

  const draftResult = await saveInquiryDraft(parsed.data, applicationId);

  if (draftResult.error || !draftResult.applicationId) {
    return draftResult;
  }

  const { organizationId, supabase } = await getMinistryContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error: inquiryError } = await db
    .from("inquiry_responses")
    .update({ submitted_at: new Date().toISOString() })
    .eq("application_id", draftResult.applicationId);

  if (inquiryError) {
    return { error: inquiryError.message };
  }

  const { error: applicationError } = await db
    .from("applications")
    .update({ status: "inquiry_submitted" })
    .eq("id", draftResult.applicationId)
    .eq("organization_id", organizationId);

  if (applicationError) {
    return { error: applicationError.message };
  }

  const { error: organizationError } = await db
    .from("organizations")
    .update({ status: "inquiry_submitted" })
    .eq("id", organizationId);

  if (organizationError) {
    return { error: organizationError.message };
  }

  return { applicationId: draftResult.applicationId };
}
