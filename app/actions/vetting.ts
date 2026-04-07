"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type {
  Applications,
  Document as DocumentRow,
  VettingResponse,
} from "@/lib/supabase/types";
import { vettingFormSchema, type VettingFormValues } from "@/lib/vetting";

type VettingLoadResult = {
  applicationId: string;
  initialValues: Partial<VettingFormValues>;
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

async function getApprovedApplicationContext() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single();
  const resolvedProfile = profile as {
    organization_id: string | null;
    role: string;
  } | null;

  if (
    !resolvedProfile ||
    resolvedProfile.role !== "ministry" ||
    !resolvedProfile.organization_id
  ) {
    redirect("/portal");
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id, status")
    .eq("organization_id", resolvedProfile.organization_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  const resolvedApplication = application as Pick<
    Applications,
    "id" | "status"
  > | null;

  if (
    !resolvedApplication ||
    resolvedApplication.status !== "inquiry_approved"
  ) {
    redirect("/portal");
  }

  return {
    applicationId: resolvedApplication.id,
    organizationId: resolvedProfile.organization_id,
    supabase,
    user,
  };
}

function asFormValue<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

export async function loadVettingDraft(): Promise<VettingLoadResult> {
  const { applicationId, supabase } = await getApprovedApplicationContext();

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
    initialValues: {
      annual_ed_review: resolvedVetting?.annual_ed_review ?? undefined,
      attestation_authorized: asFormValue(
        rawData.attestation_authorized as boolean | undefined,
      ),
      attestation_truthful: asFormValue(
        rawData.attestation_truthful as boolean | undefined,
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
      case_study_2: asFormValue(rawData.case_study_2 as string | undefined),
      church_partner_1_contact: asFormValue(
        rawData.church_partner_1_contact as string | undefined,
      ),
      church_partner_1_name: asFormValue(
        rawData.church_partner_1_name as string | undefined,
      ),
      church_partner_1_pastor: asFormValue(
        rawData.church_partner_1_pastor as string | undefined,
      ),
      church_partner_2_contact: asFormValue(
        rawData.church_partner_2_contact as string | undefined,
      ),
      church_partner_2_name: asFormValue(
        rawData.church_partner_2_name as string | undefined,
      ),
      church_partner_2_pastor: asFormValue(
        rawData.church_partner_2_pastor as string | undefined,
      ),
      compensation_set_by_board:
        resolvedVetting?.compensation_set_by_board ?? undefined,
      conflict_of_interest_policy:
        resolvedVetting?.conflict_of_interest_policy ?? undefined,
      crypto_policy: asFormValue(rawData.crypto_policy as boolean | undefined),
      crypto_policy_description: asFormValue(
        rawData.crypto_policy_description as string | undefined,
      ),
      decision_making_model: asFormValue(
        resolvedVetting?.decision_making_model as
          | VettingFormValues["decision_making_model"]
          | null
          | undefined,
      ),
      doctrinal_clarity_self_score: asFormValue(
        rawData.doctrinal_clarity_self_score as number | undefined,
      ),
      doctrinal_conflict_handling: asFormValue(
        rawData.doctrinal_conflict_handling as string | undefined,
      ),
      doctrinal_statement_text: asFormValue(
        rawData.doctrinal_statement_text as string | undefined,
      ),
      ecfa_body: asFormValue(rawData.ecfa_body as string | undefined),
      ecfa_lapsed: asFormValue(rawData.ecfa_lapsed as boolean | undefined),
      ecfa_member: asFormValue(rawData.ecfa_member as boolean | undefined),
      exec_salary_benchmark: asFormValue(
        resolvedVetting?.exec_salary_benchmark as
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
        resolvedVetting?.leader_accountability as
          | VettingFormValues["leader_accountability"]
          | null
          | undefined,
      ),
      leader_conversion_narrative: asFormValue(
        resolvedVetting?.leader_conversion_narrative,
      ),
      leader_marital_status: asFormValue(
        resolvedVetting?.leader_marital_status as
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
      negative_press_description: asFormValue(
        rawData.negative_press_description as string | undefined,
      ),
      negative_press_url: asFormValue(
        rawData.negative_press_url as string | undefined,
      ),
      overhead_expense_pct: resolvedVetting?.overhead_expense_pct ?? undefined,
      primary_output_count: asFormValue(
        rawData.primary_output_count as number | undefined,
      ),
      primary_output_unit: asFormValue(
        rawData.primary_output_unit as string | undefined,
      ),
      program_expense_pct: resolvedVetting?.program_expense_pct ?? undefined,
      recent_deficit: resolvedVetting?.recent_deficit ?? undefined,
      recent_deficit_explanation: asFormValue(
        rawData.recent_deficit_explanation as string | undefined,
      ),
      reference_1_email: asFormValue(
        rawData.reference_1_email as string | undefined,
      ),
      reference_1_name: asFormValue(
        rawData.reference_1_name as string | undefined,
      ),
      reference_1_relationship: asFormValue(
        rawData.reference_1_relationship as string | undefined,
      ),
      reference_1_role: asFormValue(
        rawData.reference_1_role as string | undefined,
      ),
      reference_2_email: asFormValue(
        rawData.reference_2_email as string | undefined,
      ),
      reference_2_name: asFormValue(
        rawData.reference_2_name as string | undefined,
      ),
      reference_2_relationship: asFormValue(
        rawData.reference_2_relationship as string | undefined,
      ),
      reference_2_role: asFormValue(
        rawData.reference_2_role as string | undefined,
      ),
      reference_3_email: asFormValue(
        rawData.reference_3_email as string | undefined,
      ),
      reference_3_name: asFormValue(
        rawData.reference_3_name as string | undefined,
      ),
      reference_3_relationship: asFormValue(
        rawData.reference_3_relationship as string | undefined,
      ),
      reference_3_role: asFormValue(
        rawData.reference_3_role as string | undefined,
      ),
      reserve_fund_level: asFormValue(
        resolvedVetting?.reserve_fund_level as
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
      staff_doctrinal_affirmation: asFormValue(
        rawData.staff_doctrinal_affirmation as boolean | undefined,
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
      whistleblower_policy: resolvedVetting?.whistleblower_policy ?? undefined,
      spiritual_measurement_method: asFormValue(
        rawData.spiritual_measurement_method as string | undefined,
      ),
    },
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
      decision_making_model: values.decision_making_model,
      exec_salary_benchmark: values.exec_salary_benchmark,
      family_on_board: values.family_on_board,
      independent_board_count: values.independent_board_count,
      leader_accountability: values.leader_accountability,
      leader_conversion_narrative: values.leader_conversion_narrative,
      leader_marital_status: values.leader_marital_status,
      leadership_conflict_notes: values.leadership_conflict_notes,
      overhead_expense_pct: values.overhead_expense_pct,
      program_expense_pct: values.program_expense_pct,
      recent_deficit: values.recent_deficit,
      reserve_fund_level: values.reserve_fund_level,
      restricted_funds_misused: values.restricted_funds_misused,
      restricted_funds_tracked: values.restricted_funds_tracked,
      whistleblower_policy: values.whistleblower_policy,
    },
    rawData: {
      attestation_authorized: values.attestation_authorized,
      attestation_truthful: values.attestation_truthful,
      board_turnover_notes: values.board_turnover_notes,
      case_study_1: values.case_study_1,
      case_study_2: values.case_study_2,
      church_partner_1_contact: values.church_partner_1_contact,
      church_partner_1_name: values.church_partner_1_name,
      church_partner_1_pastor: values.church_partner_1_pastor,
      church_partner_2_contact: values.church_partner_2_contact,
      church_partner_2_name: values.church_partner_2_name,
      church_partner_2_pastor: values.church_partner_2_pastor,
      crypto_policy: values.crypto_policy,
      crypto_policy_description: values.crypto_policy_description,
      doctrinal_clarity_self_score: values.doctrinal_clarity_self_score,
      doctrinal_conflict_handling: values.doctrinal_conflict_handling,
      doctrinal_statement_text: values.doctrinal_statement_text,
      ecfa_body: values.ecfa_body,
      ecfa_lapsed: values.ecfa_lapsed,
      ecfa_member: values.ecfa_member,
      fruit_self_score: values.fruit_self_score,
      funding_impact: values.funding_impact,
      funding_reduction_response: values.funding_reduction_response,
      gospel_presentation: values.gospel_presentation,
      marriage_sexuality_public: values.marriage_sexuality_public,
      marriage_sexuality_url: values.marriage_sexuality_url,
      negative_press: values.negative_press,
      negative_press_description: values.negative_press_description,
      negative_press_url: values.negative_press_url,
      primary_output_count: values.primary_output_count,
      primary_output_unit: values.primary_output_unit,
      recent_deficit_explanation: values.recent_deficit_explanation,
      reference_1_email: values.reference_1_email,
      reference_1_name: values.reference_1_name,
      reference_1_relationship: values.reference_1_relationship,
      reference_1_role: values.reference_1_role,
      reference_2_email: values.reference_2_email,
      reference_2_name: values.reference_2_name,
      reference_2_relationship: values.reference_2_relationship,
      reference_2_role: values.reference_2_role,
      reference_3_email: values.reference_3_email,
      reference_3_name: values.reference_3_name,
      reference_3_relationship: values.reference_3_relationship,
      reference_3_role: values.reference_3_role,
      signatory_name: values.signatory_name,
      signatory_title: values.signatory_title,
      signed_at: values.signed_at,
      staff_doctrinal_affirmation: values.staff_doctrinal_affirmation,
      strategic_clarity_self_score: values.strategic_clarity_self_score,
      strategy_description: values.strategy_description,
      syncretism_practice: values.syncretism_practice,
      theory_of_change: values.theory_of_change,
      third_party_evaluation: values.third_party_evaluation,
      three_year_plan: values.three_year_plan,
      spiritual_measurement_method: values.spiritual_measurement_method,
      family_on_board_relationship: values.family_on_board_relationship,
    },
  };
}

export async function saveVettingDraft(
  values: VettingFormValues,
): Promise<VettingDraftResult> {
  const { applicationId, supabase } = await getApprovedApplicationContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const payload = mapVettingToPersistence(values);

  const { error } = await db.from("vetting_responses").upsert(
    {
      ...payload.direct,
      application_id: applicationId,
      raw_data: payload.rawData,
    },
    {
      onConflict: "application_id",
    },
  );

  if (error) {
    return { error: error.message };
  }

  return { applicationId };
}

export async function submitVetting(
  values: VettingFormValues,
): Promise<VettingDraftResult> {
  const parsed = vettingFormSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  if (parsed.data.restricted_funds_misused) {
    return {
      error:
        "This application cannot be submitted because restricted funds were reported as misused.",
    };
  }

  const draft = await saveVettingDraft(parsed.data);

  if (draft.error || !draft.applicationId) {
    return draft;
  }

  const { applicationId, organizationId, supabase } =
    await getApprovedApplicationContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("applications")
    .update({ status: "vetting_submitted" })
    .eq("id", applicationId)
    .eq("organization_id", organizationId);

  if (error) {
    return { error: error.message };
  }

  await fetch(`${getBaseUrl()}/api/score`, {
    body: JSON.stringify({ application_id: applicationId }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return { applicationId };
}
