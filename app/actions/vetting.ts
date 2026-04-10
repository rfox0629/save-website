"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PREVIEW_APPLICATION_ID,
  PREVIEW_ORGANIZATION_ID,
} from "@/lib/ministry";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type {
  Applications,
  Document as DocumentRow,
  VettingResponse,
} from "@/lib/supabase/types";
import { getViewerContext } from "@/lib/view-mode";
import type { ViewMode } from "@/lib/view-mode-shared";
import { vettingFormSchema, type VettingFormValues } from "@/lib/vetting";

type VettingLoadResult = {
  applicationId: string | null;
  applicationStatus: string | null;
  canPreview: boolean;
  currentViewMode: ViewMode;
  initialValues: Partial<VettingFormValues>;
  organizationId: string | null;
  readOnly: boolean;
  submittedAt: string | null;
  uploadedDocuments: Partial<
    Record<string, { fileName: string; storagePath: string }>
  >;
};

type VettingDraftResult = {
  applicationId?: string;
  error?: string;
};

function getBaseUrl() {
  const headerList = headers();
  const origin = headerList.get("origin");

  if (origin) {
    return origin;
  }

  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

async function getMinistryApplicationContext() {
  const viewer = await getViewerContext();

  if (!viewer.userId) {
    redirect("/login");
  }

  const isPreviewMinistry =
    viewer.canPreview && viewer.currentViewMode === "ministry";

  if (!isPreviewMinistry && (!viewer.organizationId || viewer.realRole !== "ministry")) {
    redirect("/portal");
  }

  const supabase = isPreviewMinistry ? createAdminClient() : createClient();
  const { data: application } = isPreviewMinistry
    ? await supabase
        .from("applications")
        .select("id, status")
        .eq("id", PREVIEW_APPLICATION_ID)
        .maybeSingle()
    : await supabase
        .from("applications")
        .select("id, status")
        .eq("organization_id", viewer.organizationId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
  const resolvedApplication = application as Pick<
    Applications,
    "id" | "status"
  > | null;

  return {
    applicationId: resolvedApplication?.id ?? null,
    applicationStatus: resolvedApplication?.status ?? null,
    canPreview: viewer.canPreview,
    currentViewMode: viewer.currentViewMode,
    organizationId: isPreviewMinistry
      ? PREVIEW_ORGANIZATION_ID
      : viewer.organizationId!,
    supabase,
    userId: viewer.userId,
  };
}

function asFormValue<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

function isReadOnlyStatus(status: string | null, submittedAt: string | null) {
  if (submittedAt) {
    return true;
  }

  return [
    "vetting_submitted",
    "under_review",
    "approved",
    "declined",
    "hard_stop",
    "decided",
  ].includes(status ?? "");
}

export async function loadVettingDraft(): Promise<VettingLoadResult> {
  const {
    applicationId,
    applicationStatus,
    canPreview,
    currentViewMode,
    organizationId,
    supabase,
  } = await getMinistryApplicationContext();

  if (!applicationId) {
    return {
      applicationId: null,
      applicationStatus,
      canPreview,
      currentViewMode,
      initialValues: {},
      organizationId,
      readOnly: false,
      submittedAt: null,
      uploadedDocuments: {},
    };
  }

  const [{ data: vetting }, { data: documents }] = await Promise.all([
    supabase
      .from("vetting_responses")
      .select("*")
      .eq("application_id", applicationId)
      .maybeSingle(),
    supabase
      .from("documents")
      .select("document_type, file_name, storage_path")
      .eq("application_id", applicationId),
  ]);

  const resolvedVetting = vetting as VettingResponse | null;
  const rawData =
    resolvedVetting?.raw_data &&
    typeof resolvedVetting.raw_data === "object" &&
    !Array.isArray(resolvedVetting.raw_data)
      ? (resolvedVetting.raw_data as Record<string, unknown>)
      : {};

  const uploadedDocuments = (
    (documents ?? []) as Pick<
      DocumentRow,
      "document_type" | "file_name" | "storage_path"
    >[]
  ).reduce<VettingLoadResult["uploadedDocuments"]>((acc, document) => {
    acc[document.document_type] = {
      fileName: document.file_name,
      storagePath: document.storage_path,
    };
    return acc;
  }, {});

  return {
    applicationId,
    applicationStatus,
    canPreview,
    currentViewMode,
    initialValues: {
      annual_ed_review: resolvedVetting?.annual_ed_review ?? undefined,
      attestation_complete: asFormValue(
        rawData.attestation_complete as boolean | undefined,
      ),
      attestation_research: asFormValue(
        rawData.attestation_research as boolean | undefined,
      ),
      board_confrontation_willingness:
        resolvedVetting?.board_confrontation_willingness ?? undefined,
      board_meeting_frequency: asFormValue(
        resolvedVetting?.board_meeting_frequency as
          | VettingFormValues["board_meeting_frequency"]
          | null
          | undefined,
      ),
      board_turnover_notes: asFormValue(
        rawData.board_turnover_notes as string | undefined,
      ),
      case_study_1: asFormValue(rawData.case_study_1 as string | undefined),
      compensation_set_by_board:
        resolvedVetting?.compensation_set_by_board ?? undefined,
      conflict_of_interest_policy:
        resolvedVetting?.conflict_of_interest_policy ?? undefined,
      crypto_policy: asFormValue(rawData.crypto_policy as boolean | undefined),
      decision_making_model: asFormValue(
        resolvedVetting?.decision_making_model === "Lead pastor with staff"
          ? ("Lead pastor with staff input" as VettingFormValues["decision_making_model"])
          : (resolvedVetting?.decision_making_model as
              | VettingFormValues["decision_making_model"]
              | null
              | undefined),
      ),
      deficit_explanation: asFormValue(
        rawData.deficit_explanation as string | undefined,
      ),
      doctrinal_affirmation_required: asFormValue(
        rawData.doctrinal_affirmation_required as boolean | undefined,
      ),
      doctrinal_clarity_self_score: asFormValue(
        rawData.doctrinal_clarity_self_score as number | undefined,
      ),
      ecfa_body: asFormValue(rawData.ecfa_body as string | undefined),
      ecfa_lapsed: asFormValue(rawData.ecfa_lapsed as boolean | undefined),
      ecfa_member: asFormValue(rawData.ecfa_member as boolean | undefined),
      exec_salary_benchmark: asFormValue(
        (resolvedVetting?.exec_salary_benchmark === "Significantly below"
          ? "Significantly below peer benchmark"
          : resolvedVetting?.exec_salary_benchmark) as
          | VettingFormValues["exec_salary_benchmark"]
          | null
          | undefined,
      ),
      family_on_board: resolvedVetting?.family_on_board ?? undefined,
      family_on_board_relationship: asFormValue(
        rawData.family_on_board_relationship as string | undefined,
      ),
      fruit_self_score: asFormValue(
        rawData.fruit_self_score as number | undefined,
      ),
      funding_impact: asFormValue(rawData.funding_impact as string | undefined),
      funding_reduction_response: asFormValue(
        rawData.funding_reduction_response as string | undefined,
      ),
      gospel_presentation: asFormValue(
        rawData.gospel_presentation as string | undefined,
      ),
      independent_board_count:
        resolvedVetting?.independent_board_count ?? undefined,
      leader_accountability: asFormValue(
        (resolvedVetting?.leader_accountability === "Yes formal"
          ? "Yes, formal structure"
          : resolvedVetting?.leader_accountability === "Yes informal"
            ? "Yes, informal"
            : resolvedVetting?.leader_accountability) as
          | VettingFormValues["leader_accountability"]
          | null
          | undefined,
      ),
      leader_conversion_narrative: asFormValue(
        resolvedVetting?.leader_conversion_narrative,
      ),
      leader_marital_status: asFormValue(
        (resolvedVetting?.leader_marital_status === "Divorced prior to ministry"
          ? "Divorced, prior to ministry"
          : resolvedVetting?.leader_marital_status ===
              "Divorced during ministry"
            ? "Divorced, during ministry"
            : resolvedVetting?.leader_marital_status) as
          | VettingFormValues["leader_marital_status"]
          | null
          | undefined,
      ),
      leadership_conflict_notes: asFormValue(
        resolvedVetting?.leadership_conflict_notes,
      ),
      marriage_sexuality_public: asFormValue(
        rawData.marriage_sexuality_public as boolean | undefined,
      ),
      marriage_sexuality_url: asFormValue(
        rawData.marriage_sexuality_url as string | undefined,
      ),
      negative_press: asFormValue(
        rawData.negative_press as boolean | undefined,
      ),
      negative_press_notes: asFormValue(
        rawData.negative_press_notes as string | undefined,
      ),
      overhead_expense_pct: resolvedVetting?.overhead_expense_pct ?? undefined,
      partner_1_contact: asFormValue(
        rawData.partner_1_contact as string | undefined,
      ),
      partner_1_name: asFormValue(rawData.partner_1_name as string | undefined),
      partner_1_pastor: asFormValue(
        rawData.partner_1_pastor as string | undefined,
      ),
      partner_2_contact: asFormValue(
        rawData.partner_2_contact as string | undefined,
      ),
      partner_2_name: asFormValue(rawData.partner_2_name as string | undefined),
      partner_2_pastor: asFormValue(
        rawData.partner_2_pastor as string | undefined,
      ),
      primary_output_count: asFormValue(
        rawData.primary_output_count as number | undefined,
      ),
      primary_output_unit: asFormValue(
        rawData.primary_output_unit as string | undefined,
      ),
      program_expense_pct: resolvedVetting?.program_expense_pct ?? undefined,
      recent_deficit: resolvedVetting?.recent_deficit ?? undefined,
      ref_1_email: asFormValue(rawData.ref_1_email as string | undefined),
      ref_1_name: asFormValue(rawData.ref_1_name as string | undefined),
      ref_1_relationship: asFormValue(
        rawData.ref_1_relationship as string | undefined,
      ),
      ref_1_role: asFormValue(rawData.ref_1_role as string | undefined),
      ref_2_email: asFormValue(rawData.ref_2_email as string | undefined),
      ref_2_name: asFormValue(rawData.ref_2_name as string | undefined),
      ref_2_relationship: asFormValue(
        rawData.ref_2_relationship as string | undefined,
      ),
      ref_2_role: asFormValue(rawData.ref_2_role as string | undefined),
      ref_3_email: asFormValue(rawData.ref_3_email as string | undefined),
      ref_3_name: asFormValue(rawData.ref_3_name as string | undefined),
      ref_3_relationship: asFormValue(
        rawData.ref_3_relationship as string | undefined,
      ),
      ref_3_role: asFormValue(rawData.ref_3_role as string | undefined),
      reserve_fund_level: asFormValue(
        (resolvedVetting?.reserve_fund_level === "No reserve"
          ? "No reserve fund"
          : resolvedVetting?.reserve_fund_level === "Less than 3 months"
            ? "Less than 3 months operating"
            : resolvedVetting?.reserve_fund_level) as
          | VettingFormValues["reserve_fund_level"]
          | null
          | undefined,
      ),
      restricted_funds_misused:
        resolvedVetting?.restricted_funds_misused ?? undefined,
      restricted_funds_tracked:
        resolvedVetting?.restricted_funds_tracked ?? undefined,
      signed_at:
        asFormValue(rawData.signed_at as string | undefined) ??
        new Date().toISOString().slice(0, 10),
      signatory_name: asFormValue(rawData.signatory_name as string | undefined),
      signatory_title: asFormValue(
        rawData.signatory_title as string | undefined,
      ),
      strategic_clarity_self_score: asFormValue(
        rawData.strategic_clarity_self_score as number | undefined,
      ),
      strategy_description: asFormValue(
        rawData.strategy_description as string | undefined,
      ),
      syncretism_practice: asFormValue(
        rawData.syncretism_practice as
          | VettingFormValues["syncretism_practice"]
          | undefined,
      ),
      theory_of_change: asFormValue(
        rawData.theory_of_change as string | undefined,
      ),
      third_party_evaluation: asFormValue(
        rawData.third_party_evaluation as boolean | undefined,
      ),
      three_year_plan: asFormValue(
        rawData.three_year_plan as string | undefined,
      ),
      spiritual_measurement_method: asFormValue(
        rawData.spiritual_measurement_method as string | undefined,
      ),
      whistleblower_policy: resolvedVetting?.whistleblower_policy ?? undefined,
    },
    organizationId,
    readOnly:
      currentViewMode === "ministry" && canPreview
        ? true
        : isReadOnlyStatus(applicationStatus, resolvedVetting?.submitted_at ?? null),
    submittedAt: resolvedVetting?.submitted_at ?? null,
    uploadedDocuments,
  };
}

function mapVettingToPersistence(values: VettingFormValues) {
  return {
    direct: {
      annual_ed_review: values.annual_ed_review,
      application_id: "",
      board_confrontation_willingness: values.board_confrontation_willingness,
      board_meeting_frequency: values.board_meeting_frequency,
      compensation_set_by_board: values.compensation_set_by_board,
      conflict_of_interest_policy: values.conflict_of_interest_policy,
      decision_making_model:
        values.decision_making_model === "Lead pastor with staff input"
          ? "Lead pastor with staff"
          : values.decision_making_model,
      exec_salary_benchmark:
        values.exec_salary_benchmark === "Significantly below peer benchmark"
          ? "Significantly below"
          : values.exec_salary_benchmark,
      family_on_board: values.family_on_board,
      independent_board_count: values.independent_board_count,
      leader_accountability:
        values.leader_accountability === "Yes, formal structure"
          ? "Yes formal"
          : values.leader_accountability === "Yes, informal"
            ? "Yes informal"
            : values.leader_accountability,
      leader_conversion_narrative: values.leader_conversion_narrative,
      leader_marital_status:
        values.leader_marital_status === "Divorced, prior to ministry"
          ? "Divorced prior to ministry"
          : values.leader_marital_status === "Divorced, during ministry"
            ? "Divorced during ministry"
            : values.leader_marital_status,
      leadership_conflict_notes: values.leadership_conflict_notes,
      overhead_expense_pct: values.overhead_expense_pct,
      program_expense_pct: values.program_expense_pct,
      raw_data: {},
      recent_deficit: values.recent_deficit,
      reserve_fund_level:
        values.reserve_fund_level === "No reserve fund"
          ? "No reserve"
          : values.reserve_fund_level === "Less than 3 months operating"
            ? "Less than 3 months"
            : values.reserve_fund_level,
      restricted_funds_misused: values.restricted_funds_misused,
      restricted_funds_tracked: values.restricted_funds_tracked,
      whistleblower_policy: values.whistleblower_policy,
    },
    rawData: {
      attestation_complete: values.attestation_complete,
      attestation_research: values.attestation_research,
      board_turnover_notes: values.board_turnover_notes,
      case_study_1: values.case_study_1,
      crypto_policy: values.crypto_policy,
      deficit_explanation: values.deficit_explanation,
      doctrinal_affirmation_required: values.doctrinal_affirmation_required,
      doctrinal_clarity_self_score: values.doctrinal_clarity_self_score,
      ecfa_body: values.ecfa_body,
      ecfa_lapsed: values.ecfa_lapsed,
      ecfa_member: values.ecfa_member,
      family_on_board_relationship: values.family_on_board_relationship,
      fruit_self_score: values.fruit_self_score,
      funding_impact: values.funding_impact,
      funding_reduction_response: values.funding_reduction_response,
      gospel_presentation: values.gospel_presentation,
      marriage_sexuality_public: values.marriage_sexuality_public,
      marriage_sexuality_url: values.marriage_sexuality_url,
      negative_press: values.negative_press,
      negative_press_notes: values.negative_press_notes,
      partner_1_contact: values.partner_1_contact,
      partner_1_name: values.partner_1_name,
      partner_1_pastor: values.partner_1_pastor,
      partner_2_contact: values.partner_2_contact,
      partner_2_name: values.partner_2_name,
      partner_2_pastor: values.partner_2_pastor,
      primary_output_count: values.primary_output_count,
      primary_output_unit: values.primary_output_unit,
      ref_1_email: values.ref_1_email,
      ref_1_name: values.ref_1_name,
      ref_1_relationship: values.ref_1_relationship,
      ref_1_role: values.ref_1_role,
      ref_2_email: values.ref_2_email,
      ref_2_name: values.ref_2_name,
      ref_2_relationship: values.ref_2_relationship,
      ref_2_role: values.ref_2_role,
      ref_3_email: values.ref_3_email,
      ref_3_name: values.ref_3_name,
      ref_3_relationship: values.ref_3_relationship,
      ref_3_role: values.ref_3_role,
      signed_at: values.signed_at,
      signatory_name: values.signatory_name,
      signatory_title: values.signatory_title,
      strategic_clarity_self_score: values.strategic_clarity_self_score,
      strategy_description: values.strategy_description,
      syncretism_practice: values.syncretism_practice,
      theory_of_change: values.theory_of_change,
      third_party_evaluation: values.third_party_evaluation,
      three_year_plan: values.three_year_plan,
      spiritual_measurement_method: values.spiritual_measurement_method,
    },
  };
}

export async function saveVettingDraft(
  values: VettingFormValues,
  applicationId?: string | null,
): Promise<VettingDraftResult> {
  const context = await getMinistryApplicationContext();

  if (
    context.applicationStatus !== "inquiry_approved" &&
    context.applicationStatus !== "vetting_submitted" &&
    context.applicationStatus !== "under_review" &&
    context.applicationStatus !== "approved" &&
    context.applicationStatus !== "declined"
  ) {
    return {
      error: "This form will be unlocked once your inquiry has been approved.",
    };
  }

  const resolvedApplicationId = applicationId ?? context.applicationId;

  if (!resolvedApplicationId) {
    return { error: "No application is available for the SAVE Standard." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = context.supabase as any;
  const payload = mapVettingToPersistence(values);

  const { error } = await db.from("vetting_responses").upsert(
    {
      ...payload.direct,
      application_id: resolvedApplicationId,
      raw_data: payload.rawData,
      submitted_at: null,
    },
    {
      onConflict: "application_id",
    },
  );

  if (error) {
    return { error: error.message };
  }

  return { applicationId: resolvedApplicationId };
}

export async function submitVetting(
  values: VettingFormValues,
  applicationId?: string | null,
): Promise<VettingDraftResult> {
  const parsed = vettingFormSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const draft = await saveVettingDraft(parsed.data, applicationId);

  if (draft.error || !draft.applicationId) {
    return draft;
  }

  const { applicationId: contextApplicationId, organizationId, supabase } =
    await getMinistryApplicationContext();
  const resolvedApplicationId = draft.applicationId ?? contextApplicationId;

  if (!resolvedApplicationId) {
    return { error: "No application is available for submission." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error: vettingError } = await db
    .from("vetting_responses")
    .update({ submitted_at: new Date().toISOString() })
    .eq("application_id", resolvedApplicationId);

  if (vettingError) {
    return { error: vettingError.message };
  }

  const { error } = await db
    .from("applications")
    .update({ status: "vetting_submitted" })
    .eq("id", resolvedApplicationId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  const response = await fetch(
    `${getBaseUrl()}/api/vetting/${resolvedApplicationId}/run`,
    {
      headers: {
        "Content-Type": "application/json",
        "x-save-background-token":
          process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    return {
      error: body?.error ?? "Unable to start background evaluation checks.",
    };
  }

  return { applicationId: resolvedApplicationId };
}
