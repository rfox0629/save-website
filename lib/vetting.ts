import { z } from "zod";

const yesNoSchema = z.boolean();

export const leadershipCharacterSchema = z.object({
  board_confrontation_willingness: z.coerce.number().int().min(1).max(5),
  compensation_set_by_board: yesNoSchema,
  decision_making_model: z.enum(
    [
      "Lead pastor unilaterally",
      "Lead pastor with staff input",
      "Board approval required",
      "Congregational vote",
      "Elder plurality",
    ],
    { error: "Select a decision-making model." },
  ),
  leader_accountability: z.enum(
    ["Yes, formal structure", "Yes, informal", "No"],
    { error: "Select an accountability structure." },
  ),
  leader_conversion_narrative: z
    .string()
    .min(20, "Describe the lead leader's call to ministry.")
    .max(750, "Keep this under 750 characters."),
  leader_marital_status: z.enum(
    [
      "Married and stable",
      "Single",
      "Widowed",
      "Divorced, prior to ministry",
      "Divorced, during ministry",
    ],
    { error: "Select marital status." },
  ),
  leadership_conflict_notes: z
    .string()
    .min(4, "Describe the leadership conflict history.")
    .max(750, "Keep this under 750 characters."),
});

export const doctrinalDepthSchema = z.object({
  doctrinal_affirmation_required: yesNoSchema,
  doctrinal_clarity_self_score: z.coerce.number().int().min(1).max(5),
  gospel_presentation: z
    .string()
    .min(20, "Describe the gospel presentation.")
    .max(500, "Keep this under 500 characters."),
  marriage_sexuality_public: yesNoSchema,
  marriage_sexuality_url: z.string().trim().optional(),
  syncretism_practice: z.enum(
    [
      "Never",
      "Occasionally for relational purposes",
      "Yes, as part of our model",
    ],
    { error: "Select a syncretism response." },
  ),
});

export const governanceSchema = z.object({
  annual_ed_review: yesNoSchema,
  board_meeting_frequency: z.enum(
    ["Monthly", "Quarterly", "Semi-annually", "Annually", "Irregularly"],
    { error: "Select board meeting frequency." },
  ),
  board_turnover_notes: z
    .string()
    .min(4, "Describe board turnover.")
    .max(500, "Keep this under 500 characters."),
  conflict_of_interest_policy: yesNoSchema,
  family_on_board: yesNoSchema,
  family_on_board_relationship: z.string().trim().optional(),
  independent_board_count: z.coerce.number().int().min(0),
  whistleblower_policy: yesNoSchema,
});

export const financialStewardshipSchema = z.object({
  crypto_policy: yesNoSchema,
  deficit_explanation: z.string().trim().optional(),
  exec_salary_benchmark: z.enum(
    [
      "Significantly below peer benchmark",
      "At benchmark",
      "Above benchmark",
      "Unknown",
    ],
    { error: "Select executive salary benchmarking." },
  ),
  overhead_expense_pct: z.coerce.number().int().min(0).max(100),
  program_expense_pct: z.coerce.number().int().min(0).max(100),
  recent_deficit: yesNoSchema,
  reserve_fund_level: z.enum(
    [
      "No reserve fund",
      "Less than 3 months operating",
      "3–6 months",
      "6–12 months",
      "Over 12 months",
    ],
    { error: "Select reserve fund level." },
  ),
  restricted_funds_misused: yesNoSchema,
  restricted_funds_tracked: yesNoSchema,
});

export const fruitEffectivenessSchema = z.object({
  case_study_1: z
    .string()
    .min(20, "Share one story of changed life or community impact.")
    .max(1000, "Keep this under 1000 characters."),
  fruit_self_score: z.coerce.number().int().min(1).max(5),
  primary_output_count: z.coerce.number().int().min(0),
  primary_output_unit: z.string().min(2, "Describe the primary output unit."),
  spiritual_measurement_method: z
    .string()
    .min(20, "Describe how you measure spiritual transformation.")
    .max(500, "Keep this under 500 characters."),
  theory_of_change: z
    .string()
    .min(20, "Describe your theory of change.")
    .max(750, "Keep this under 750 characters."),
  third_party_evaluation: yesNoSchema,
});

export const externalRelationshipsSchema = z.object({
  ecfa_body: z.string().trim().optional(),
  ecfa_lapsed: yesNoSchema,
  ecfa_member: yesNoSchema,
  negative_press: yesNoSchema,
  negative_press_notes: z.string().trim().optional(),
  partner_1_contact: z.string().trim().optional(),
  partner_1_name: z.string().trim().optional(),
  partner_1_pastor: z.string().trim().optional(),
  partner_2_contact: z.string().trim().optional(),
  partner_2_name: z.string().trim().optional(),
  partner_2_pastor: z.string().trim().optional(),
  ref_1_email: z.string().email("Reference 1 email must be valid."),
  ref_1_name: z.string().min(2, "Reference 1 name is required."),
  ref_1_relationship: z
    .string()
    .min(2, "Reference 1 relationship is required."),
  ref_1_role: z.string().min(2, "Reference 1 role is required."),
  ref_2_email: z.string().email("Reference 2 email must be valid."),
  ref_2_name: z.string().min(2, "Reference 2 name is required."),
  ref_2_relationship: z
    .string()
    .min(2, "Reference 2 relationship is required."),
  ref_2_role: z.string().min(2, "Reference 2 role is required."),
  ref_3_email: z.string().email("Reference 3 email must be valid."),
  ref_3_name: z.string().min(2, "Reference 3 name is required."),
  ref_3_relationship: z
    .string()
    .min(2, "Reference 3 relationship is required."),
  ref_3_role: z.string().min(2, "Reference 3 role is required."),
});

export const strategySchema = z.object({
  funding_impact: z
    .string()
    .min(20, "Describe the funding impact.")
    .max(500, "Keep this under 500 characters."),
  funding_reduction_response: z
    .string()
    .min(20, "Describe the reduced funding response.")
    .max(500, "Keep this under 500 characters."),
  strategic_clarity_self_score: z.coerce.number().int().min(1).max(5),
  strategy_description: z
    .string()
    .min(20, "Describe your strategy.")
    .max(750, "Keep this under 750 characters."),
  three_year_plan: z
    .string()
    .min(20, "Describe your three-year plan.")
    .max(500, "Keep this under 500 characters."),
});

export const documentsAttestationSchema = z.object({
  attestation_complete: z.boolean().refine((value) => value, {
    message: "You must confirm the information is accurate.",
  }),
  attestation_research: z.boolean().refine((value) => value, {
    message:
      "You must authorize SAVE to contact references and conduct research.",
  }),
  signed_at: z.string().min(1, "Signing date is required."),
  signatory_name: z.string().min(2, "Signatory name is required."),
  signatory_title: z.string().min(2, "Signatory title is required."),
});

export const vettingFormSchema = leadershipCharacterSchema
  .merge(doctrinalDepthSchema)
  .merge(governanceSchema)
  .merge(financialStewardshipSchema)
  .merge(fruitEffectivenessSchema)
  .merge(externalRelationshipsSchema)
  .merge(strategySchema)
  .merge(documentsAttestationSchema)
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
        message: "Enter a valid URL.",
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

    if (values.recent_deficit && !values.deficit_explanation?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deficit_explanation"],
        message: "Explain the deficit.",
      });
    }

    if (values.negative_press && !values.negative_press_notes?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["negative_press_notes"],
        message: "Describe the negative press.",
      });
    }

    if (values.ecfa_member && !values.ecfa_body?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ecfa_body"],
        message: "Specify the accountability body.",
      });
    }
  });

export type VettingFormValues = z.infer<typeof vettingFormSchema>;

export const vettingDefaultValues: VettingFormValues = {
  annual_ed_review: false,
  attestation_complete: false,
  attestation_research: false,
  board_confrontation_willingness: 3,
  board_meeting_frequency: "Quarterly",
  board_turnover_notes: "None.",
  case_study_1: "",
  compensation_set_by_board: false,
  conflict_of_interest_policy: false,
  crypto_policy: false,
  decision_making_model: "Board approval required",
  deficit_explanation: "",
  doctrinal_affirmation_required: false,
  doctrinal_clarity_self_score: 3,
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
  leader_accountability: "Yes, formal structure",
  leader_conversion_narrative: "",
  leader_marital_status: "Married and stable",
  leadership_conflict_notes: "None.",
  marriage_sexuality_public: false,
  marriage_sexuality_url: "",
  negative_press: false,
  negative_press_notes: "",
  overhead_expense_pct: 0,
  partner_1_contact: "",
  partner_1_name: "",
  partner_1_pastor: "",
  partner_2_contact: "",
  partner_2_name: "",
  partner_2_pastor: "",
  primary_output_count: 0,
  primary_output_unit: "",
  program_expense_pct: 0,
  recent_deficit: false,
  ref_1_email: "",
  ref_1_name: "",
  ref_1_relationship: "",
  ref_1_role: "",
  ref_2_email: "",
  ref_2_name: "",
  ref_2_relationship: "",
  ref_2_role: "",
  ref_3_email: "",
  ref_3_name: "",
  ref_3_relationship: "",
  ref_3_role: "",
  reserve_fund_level: "No reserve fund",
  restricted_funds_misused: false,
  restricted_funds_tracked: false,
  signed_at: new Date().toISOString().slice(0, 10),
  signatory_name: "",
  signatory_title: "",
  strategic_clarity_self_score: 3,
  strategy_description: "",
  syncretism_practice: "Never",
  spiritual_measurement_method: "",
  theory_of_change: "",
  third_party_evaluation: false,
  three_year_plan: "",
  whistleblower_policy: false,
};

export const vettingStepTitles = [
  "Leadership Character",
  "Doctrinal Depth",
  "Governance",
  "Financial Stewardship",
  "Fruit & Effectiveness",
  "External Relationships",
  "Strategy",
  "Documents & Attestation",
] as const;

export const vettingStepSchemas = [
  leadershipCharacterSchema,
  doctrinalDepthSchema,
  governanceSchema,
  financialStewardshipSchema,
  fruitEffectivenessSchema,
  externalRelationshipsSchema,
  strategySchema,
  documentsAttestationSchema,
] as const;

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
    "doctrinal_affirmation_required",
    "gospel_presentation",
    "syncretism_practice",
    "marriage_sexuality_public",
    "marriage_sexuality_url",
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
    "deficit_explanation",
    "restricted_funds_tracked",
    "restricted_funds_misused",
    "crypto_policy",
  ],
  [
    "primary_output_count",
    "primary_output_unit",
    "theory_of_change",
    "spiritual_measurement_method",
    "case_study_1",
    "third_party_evaluation",
    "fruit_self_score",
  ],
  [
    "ref_1_name",
    "ref_1_role",
    "ref_1_email",
    "ref_1_relationship",
    "ref_2_name",
    "ref_2_role",
    "ref_2_email",
    "ref_2_relationship",
    "ref_3_name",
    "ref_3_role",
    "ref_3_email",
    "ref_3_relationship",
    "partner_1_name",
    "partner_1_pastor",
    "partner_1_contact",
    "partner_2_name",
    "partner_2_pastor",
    "partner_2_contact",
    "negative_press",
    "negative_press_notes",
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
    "attestation_complete",
    "attestation_research",
    "signatory_name",
    "signatory_title",
    "signed_at",
  ],
] as const satisfies readonly (readonly (keyof VettingFormValues)[])[];

export const vettingDocumentTypes = [
  "form_990",
  "audit_review",
  "budget",
  "bylaws",
  "board_minutes",
  "doctrinal_statement",
] as const;

export type VettingDocumentType = (typeof vettingDocumentTypes)[number];
