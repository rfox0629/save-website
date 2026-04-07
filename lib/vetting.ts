import { z } from "zod";

const yesNoSchema = z.boolean();

export const leadershipCharacterSchema = z.object({
  leader_conversion_narrative: z
    .string()
    .min(20, "Share the leader's conversion narrative.")
    .max(750, "Keep this under 750 characters."),
  leader_marital_status: z.enum(
    [
      "Married and stable",
      "Single",
      "Widowed",
      "Divorced prior to ministry",
      "Divorced during ministry",
    ],
    { error: "Select marital status." },
  ),
  leader_accountability: z.enum(["Yes formal", "Yes informal", "No"], {
    error: "Select accountability.",
  }),
  decision_making_model: z.enum(
    [
      "Lead pastor unilaterally",
      "Lead pastor with staff",
      "Board approval required",
      "Congregational vote",
      "Elder plurality",
    ],
    { error: "Select a decision-making model." },
  ),
  compensation_set_by_board: yesNoSchema,
  leadership_conflict_notes: z
    .string()
    .max(750, "Keep this under 750 characters."),
  board_confrontation_willingness: z.coerce.number().int().min(1).max(5),
});

export const doctrinalDepthSchema = z.object({
  doctrinal_statement_text: z.string().optional(),
  staff_doctrinal_affirmation: yesNoSchema,
  gospel_presentation: z
    .string()
    .min(20, "Describe your gospel presentation.")
    .max(500, "Keep this under 500 characters."),
  syncretism_practice: z.enum(
    [
      "Never",
      "Occasionally for relational purposes",
      "Yes as part of our model",
    ],
    { error: "Select syncretism practice." },
  ),
  marriage_sexuality_public: yesNoSchema,
  marriage_sexuality_url: z.string().optional(),
  doctrinal_conflict_handling: z
    .string()
    .min(20, "Explain doctrinal conflict handling.")
    .max(500, "Keep this under 500 characters."),
  doctrinal_clarity_self_score: z.coerce.number().int().min(1).max(5),
});

export const governanceSchema = z.object({
  independent_board_count: z.coerce.number().int().min(0),
  board_meeting_frequency: z.enum(
    ["Monthly", "Quarterly", "Semi-annually", "Annually", "Irregularly"],
    { error: "Select board meeting frequency." },
  ),
  conflict_of_interest_policy: yesNoSchema,
  whistleblower_policy: yesNoSchema,
  annual_ed_review: yesNoSchema,
  family_on_board: yesNoSchema,
  family_on_board_relationship: z.string().optional(),
  board_turnover_notes: z.string().max(500, "Keep this under 500 characters."),
});

export const financialStewardshipSchema = z.object({
  program_expense_pct: z.coerce.number().int().min(0).max(100),
  overhead_expense_pct: z.coerce.number().int().min(0).max(100),
  reserve_fund_level: z.enum(
    [
      "No reserve",
      "Less than 3 months",
      "3–6 months",
      "6–12 months",
      "Over 12 months",
    ],
    { error: "Select reserve fund level." },
  ),
  exec_salary_benchmark: z.enum(
    ["Significantly below", "At benchmark", "Above benchmark", "Unknown"],
    { error: "Select executive salary benchmark." },
  ),
  recent_deficit: yesNoSchema,
  recent_deficit_explanation: z.string().optional(),
  restricted_funds_tracked: yesNoSchema,
  restricted_funds_misused: yesNoSchema,
  crypto_policy: yesNoSchema,
  crypto_policy_description: z.string().optional(),
});

export const fruitEffectivenessSchema = z.object({
  primary_output_count: z.coerce.number().int().min(0),
  primary_output_unit: z.string().min(2, "Describe the primary output unit."),
  theory_of_change: z
    .string()
    .min(20, "Explain your theory of change.")
    .max(750, "Keep this under 750 characters."),
  spiritual_measurement_method: z
    .string()
    .min(20, "Explain your spiritual measurement method.")
    .max(500, "Keep this under 500 characters."),
  case_study_1: z
    .string()
    .min(20, "Add the first case study.")
    .max(1000, "Keep this under 1000 characters."),
  case_study_2: z
    .string()
    .min(20, "Add the second case study.")
    .max(1000, "Keep this under 1000 characters."),
  third_party_evaluation: yesNoSchema,
  fruit_self_score: z.coerce.number().int().min(1).max(5),
});

export const externalRelationshipsSchema = z.object({
  reference_1_name: z.string().min(2, "Reference 1 name is required."),
  reference_1_role: z.string().min(2, "Reference 1 role is required."),
  reference_1_email: z.string().email("Reference 1 email must be valid."),
  reference_1_relationship: z
    .string()
    .min(2, "Reference 1 relationship is required."),
  reference_2_name: z.string().min(2, "Reference 2 name is required."),
  reference_2_role: z.string().min(2, "Reference 2 role is required."),
  reference_2_email: z.string().email("Reference 2 email must be valid."),
  reference_2_relationship: z
    .string()
    .min(2, "Reference 2 relationship is required."),
  reference_3_name: z.string().min(2, "Reference 3 name is required."),
  reference_3_role: z.string().min(2, "Reference 3 role is required."),
  reference_3_email: z.string().email("Reference 3 email must be valid."),
  reference_3_relationship: z
    .string()
    .min(2, "Reference 3 relationship is required."),
  church_partner_1_name: z.string().optional(),
  church_partner_1_pastor: z.string().optional(),
  church_partner_1_contact: z.string().optional(),
  church_partner_2_name: z.string().optional(),
  church_partner_2_pastor: z.string().optional(),
  church_partner_2_contact: z.string().optional(),
  negative_press: yesNoSchema,
  negative_press_description: z.string().optional(),
  negative_press_url: z.string().optional(),
  ecfa_member: yesNoSchema,
  ecfa_body: z.string().optional(),
  ecfa_lapsed: yesNoSchema,
});

export const strategySchema = z.object({
  strategy_description: z
    .string()
    .min(20, "Describe your strategy.")
    .max(750, "Keep this under 750 characters."),
  three_year_plan: z
    .string()
    .min(20, "Describe your three-year plan.")
    .max(500, "Keep this under 500 characters."),
  funding_impact: z
    .string()
    .min(20, "Describe funding impact.")
    .max(500, "Keep this under 500 characters."),
  funding_reduction_response: z
    .string()
    .min(20, "Describe your reduction response.")
    .max(500, "Keep this under 500 characters."),
  strategic_clarity_self_score: z.coerce.number().int().min(1).max(5),
});

export const attestationSchema = z.object({
  attestation_truthful: z.boolean().refine((value) => value, {
    message: "You must confirm the information is accurate.",
  }),
  attestation_authorized: z.boolean().refine((value) => value, {
    message: "You must confirm you are authorized to sign.",
  }),
  signatory_name: z.string().min(2, "Signatory name is required."),
  signatory_title: z.string().min(2, "Signatory title is required."),
  signed_at: z.string().min(1, "Signing date is required."),
});

export const vettingFormSchema = leadershipCharacterSchema
  .merge(doctrinalDepthSchema)
  .merge(governanceSchema)
  .merge(financialStewardshipSchema)
  .merge(fruitEffectivenessSchema)
  .merge(externalRelationshipsSchema)
  .merge(strategySchema)
  .merge(attestationSchema)
  .superRefine((values, context) => {
    if (values.program_expense_pct + values.overhead_expense_pct > 100) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["overhead_expense_pct"],
        message: "Program and overhead percentages must sum to 100 or less.",
      });
    }

    if (
      values.marriage_sexuality_public &&
      (!values.marriage_sexuality_url ||
        !z.string().url().safeParse(values.marriage_sexuality_url).success)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["marriage_sexuality_url"],
        message: "Enter a valid public URL.",
      });
    }

    if (
      values.family_on_board &&
      !values.family_on_board_relationship?.trim()
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["family_on_board_relationship"],
        message: "Describe the family relationship on the board.",
      });
    }

    if (values.recent_deficit && !values.recent_deficit_explanation?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recent_deficit_explanation"],
        message: "Explain the recent deficit.",
      });
    }

    if (values.crypto_policy && !values.crypto_policy_description?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["crypto_policy_description"],
        message: "Describe the crypto policy.",
      });
    }

    if (values.third_party_evaluation === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["third_party_evaluation"],
        message: "Select whether there is a third-party evaluation.",
      });
    }

    if (values.negative_press) {
      if (!values.negative_press_description?.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["negative_press_description"],
          message: "Describe the negative press.",
        });
      }

      if (
        !values.negative_press_url ||
        !z.string().url().safeParse(values.negative_press_url).success
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["negative_press_url"],
          message: "Enter a valid URL for the negative press item.",
        });
      }
    }

    if (values.ecfa_member && !values.ecfa_body?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ecfa_body"],
        message: "Specify the accrediting or accountability body.",
      });
    }
  });

export type VettingFormValues = z.infer<typeof vettingFormSchema>;

export const vettingDefaultValues: VettingFormValues = {
  annual_ed_review: false,
  attestation_authorized: false,
  attestation_truthful: false,
  board_confrontation_willingness: 3,
  board_meeting_frequency: "Quarterly",
  board_turnover_notes: "",
  church_partner_1_contact: "",
  church_partner_1_name: "",
  church_partner_1_pastor: "",
  church_partner_2_contact: "",
  church_partner_2_name: "",
  church_partner_2_pastor: "",
  compensation_set_by_board: false,
  conflict_of_interest_policy: false,
  crypto_policy: false,
  crypto_policy_description: "",
  decision_making_model: "Board approval required",
  doctrinal_clarity_self_score: 3,
  doctrinal_conflict_handling: "",
  doctrinal_statement_text: "",
  ecfa_body: "",
  ecfa_lapsed: false,
  ecfa_member: false,
  exec_salary_benchmark: "Unknown",
  family_on_board: false,
  family_on_board_relationship: "",
  fruit_self_score: 3,
  funding_impact: "",
  funding_reduction_response: "",
  gospel_presentation: "",
  independent_board_count: 0,
  leader_accountability: "Yes formal",
  leader_conversion_narrative: "",
  leader_marital_status: "Married and stable",
  leadership_conflict_notes: "",
  marriage_sexuality_public: false,
  marriage_sexuality_url: "",
  negative_press: false,
  negative_press_description: "",
  negative_press_url: "",
  overhead_expense_pct: 0,
  primary_output_count: 0,
  primary_output_unit: "",
  program_expense_pct: 0,
  recent_deficit: false,
  recent_deficit_explanation: "",
  reference_1_email: "",
  reference_1_name: "",
  reference_1_relationship: "",
  reference_1_role: "",
  reference_2_email: "",
  reference_2_name: "",
  reference_2_relationship: "",
  reference_2_role: "",
  reference_3_email: "",
  reference_3_name: "",
  reference_3_relationship: "",
  reference_3_role: "",
  reserve_fund_level: "No reserve",
  restricted_funds_misused: false,
  restricted_funds_tracked: false,
  signatory_name: "",
  signatory_title: "",
  signed_at: new Date().toISOString().slice(0, 10),
  staff_doctrinal_affirmation: false,
  strategic_clarity_self_score: 3,
  strategy_description: "",
  syncretism_practice: "Never",
  theory_of_change: "",
  third_party_evaluation: false,
  three_year_plan: "",
  whistleblower_policy: false,
  spiritual_measurement_method: "",
  case_study_1: "",
  case_study_2: "",
};

export const vettingStepFields = [
  [
    "leader_conversion_narrative",
    "leader_marital_status",
    "leader_accountability",
    "decision_making_model",
    "compensation_set_by_board",
    "leadership_conflict_notes",
    "board_confrontation_willingness",
  ],
  [
    "doctrinal_statement_text",
    "staff_doctrinal_affirmation",
    "gospel_presentation",
    "syncretism_practice",
    "marriage_sexuality_public",
    "marriage_sexuality_url",
    "doctrinal_conflict_handling",
    "doctrinal_clarity_self_score",
  ],
  [
    "independent_board_count",
    "board_meeting_frequency",
    "conflict_of_interest_policy",
    "whistleblower_policy",
    "annual_ed_review",
    "family_on_board",
    "family_on_board_relationship",
    "board_turnover_notes",
  ],
  [
    "program_expense_pct",
    "overhead_expense_pct",
    "reserve_fund_level",
    "exec_salary_benchmark",
    "recent_deficit",
    "recent_deficit_explanation",
    "restricted_funds_tracked",
    "restricted_funds_misused",
    "crypto_policy",
    "crypto_policy_description",
  ],
  [
    "primary_output_count",
    "primary_output_unit",
    "theory_of_change",
    "spiritual_measurement_method",
    "case_study_1",
    "case_study_2",
    "third_party_evaluation",
    "fruit_self_score",
  ],
  [
    "reference_1_name",
    "reference_1_role",
    "reference_1_email",
    "reference_1_relationship",
    "reference_2_name",
    "reference_2_role",
    "reference_2_email",
    "reference_2_relationship",
    "reference_3_name",
    "reference_3_role",
    "reference_3_email",
    "reference_3_relationship",
    "church_partner_1_name",
    "church_partner_1_pastor",
    "church_partner_1_contact",
    "church_partner_2_name",
    "church_partner_2_pastor",
    "church_partner_2_contact",
    "negative_press",
    "negative_press_description",
    "negative_press_url",
    "ecfa_member",
    "ecfa_body",
    "ecfa_lapsed",
  ],
  [
    "strategy_description",
    "three_year_plan",
    "funding_impact",
    "funding_reduction_response",
    "strategic_clarity_self_score",
  ],
  [
    "attestation_truthful",
    "attestation_authorized",
    "signatory_name",
    "signatory_title",
    "signed_at",
  ],
] as const satisfies readonly (readonly (keyof VettingFormValues)[])[];

export const vettingStepTitles = [
  "Leadership Character",
  "Doctrinal Depth",
  "Governance",
  "Financial Stewardship",
  "Fruit and Effectiveness",
  "External Relationships",
  "Strategy",
  "Attestation",
] as const;

export const vettingDocumentTypes = [
  "doctrinal_statement",
  "bylaws",
  "board_minutes",
  "form_990",
  "audit",
  "budget",
  "third_party_evaluation",
] as const;

export type VettingDocumentType = (typeof vettingDocumentTypes)[number];
