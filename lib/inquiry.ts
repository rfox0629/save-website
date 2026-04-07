import { z } from "zod";

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
] as const;

export const COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "Mexico",
  "Brazil",
  "United Kingdom",
  "Ireland",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Switzerland",
  "Nigeria",
  "Kenya",
  "South Africa",
  "India",
  "Pakistan",
  "Philippines",
  "Singapore",
  "Australia",
  "New Zealand",
  "South Korea",
  "Japan",
  "Thailand",
  "Indonesia",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "Ukraine",
] as const;

export const ENTITY_TYPES = [
  "501c3",
  "501c4",
  "Church",
  "Fiscal sponsee",
  "Other",
] as const;

export const PRIMARY_FOCUS_OPTIONS = [
  "Church planting",
  "Discipleship",
  "Evangelism",
  "Education",
  "Relief/development",
  "Theological training",
  "Media/publishing",
  "Other",
] as const;

export const GEOGRAPHIC_SCOPE_OPTIONS = [
  "Local",
  "Regional",
  "National",
  "International",
  "Multi-national",
] as const;

export const THEOLOGICAL_EDUCATION_OPTIONS = [
  "No formal training",
  "Certificate",
  "Bachelor's",
  "Master's non-div",
  "MDiv",
  "ThM",
  "DMin",
  "PhD",
] as const;

export const ORDINATION_STATUS_OPTIONS = [
  "Ordained",
  "Not ordained",
  "N/A",
] as const;

export const BOARD_COMPENSATED_OPTIONS = [
  "None",
  "Chair only",
  "All members",
  "Some members",
] as const;

export const DENOMINATION_OPTIONS = [
  "Non-denominational",
  "Southern Baptist",
  "PCA",
  "Acts 29",
  "EFCA",
  "Anglican",
  "Methodist",
  "Pentecostal",
  "Catholic",
  "Other",
  "None",
] as const;

export const SCRIPTURE_POSITION_OPTIONS = [
  "Inerrant",
  "Infallible",
  "Authoritative but not inerrant",
  "Other",
] as const;

export const GOSPEL_CLARITY_OPTIONS = [
  "Faith alone in Christ alone",
  "Faith plus works",
  "Unclear in our materials",
  "Other",
] as const;

export const BAPTISM_POSITION_OPTIONS = [
  "Believer baptism only",
  "Infant baptism",
  "Dual practice",
  "Not a focus",
] as const;

export const ANNUAL_REVENUE_RANGE_OPTIONS = [
  "Under $100K",
  "$100K–$500K",
  "$500K–$1M",
  "$1M–$5M",
  "Over $5M",
] as const;

export const FUNDING_SOURCE_OPTIONS = [
  "Individual donors",
  "Church partners",
  "Foundations",
  "Government grants",
  "Earned revenue",
] as const;

export const FILES_990_OPTIONS = ["Yes", "No", "Exempt"] as const;

export const AUDIT_LEVEL_OPTIONS = [
  "CPA audit",
  "Review only",
  "Compilation only",
  "No audit",
] as const;

export const REFERRAL_SOURCE_OPTIONS = [
  "Past donor",
  "Board member",
  "Past grantee",
  "Conference",
  "Church network",
  "Friend or advisor",
  "Web search",
  "Other",
] as const;

const yesNoSchema = z.boolean();

export const organizationIdentitySchema = z.object({
  legal_name: z.string().min(2, "Legal name is required."),
  dba_name: z.string().optional(),
  ein: z.string().regex(/^\d{2}-\d{7}$/, "Use EIN format XX-XXXXXXX."),
  year_founded: z.coerce
    .number({ error: "Enter a year." })
    .int()
    .min(1700, "Enter a valid year.")
    .max(new Date().getFullYear(), "Year cannot be in the future."),
  state_of_incorporation: z.enum(US_STATES, {
    error: "Select a state of incorporation.",
  }),
  entity_type: z.enum(ENTITY_TYPES, {
    error: "Select an entity type.",
  }),
  primary_focus: z
    .array(z.enum(PRIMARY_FOCUS_OPTIONS))
    .min(1, "Select at least one primary focus."),
  geographic_scope: z.enum(GEOGRAPHIC_SCOPE_OPTIONS, {
    error: "Select a geographic scope.",
  }),
  countries: z.array(z.enum(COUNTRY_OPTIONS)).default([]),
});

export const leadershipSchema = z.object({
  lead_name: z.string().min(2, "Lead name is required."),
  years_in_role: z.coerce
    .number({ error: "Enter years in role." })
    .int()
    .min(0, "Years in role cannot be negative."),
  theological_education: z.enum(THEOLOGICAL_EDUCATION_OPTIONS, {
    error: "Select theological education.",
  }),
  ordination_status: z.enum(ORDINATION_STATUS_OPTIONS, {
    error: "Select ordination status.",
  }),
  ordaining_body: z.string().optional(),
  founder_still_in_leadership: yesNoSchema,
  board_size: z.coerce
    .number({ error: "Enter board size." })
    .int()
    .min(1, "Board size must be at least 1."),
  board_compensated: z.enum(BOARD_COMPENSATED_OPTIONS, {
    error: "Select board compensation.",
  }),
});

export const theologicalFoundationSchema = z.object({
  denomination: z.enum(DENOMINATION_OPTIONS, {
    error: "Select a denomination.",
  }),
  doctrinal_statement_public: yesNoSchema,
  doctrinal_statement_url: z.string().optional(),
  scripture_position: z.enum(SCRIPTURE_POSITION_OPTIONS, {
    error: "Select a scripture position.",
  }),
  gospel_clarity: z.enum(GOSPEL_CLARITY_OPTIONS, {
    error: "Select gospel clarity.",
  }),
  baptism_position: z.enum(BAPTISM_POSITION_OPTIONS, {
    error: "Select a baptism position.",
  }),
});

export const financialsSchema = z.object({
  annual_revenue_range: z.enum(ANNUAL_REVENUE_RANGE_OPTIONS, {
    error: "Select annual revenue range.",
  }),
  funding_sources: z
    .array(z.enum(FUNDING_SOURCE_OPTIONS))
    .min(1, "Select at least one funding source."),
  files_990: z.enum(FILES_990_OPTIONS, {
    error: "Select 990 status.",
  }),
  audit_level: z.enum(AUDIT_LEVEL_OPTIONS, {
    error: "Select an audit level.",
  }),
  board_approved_budget: yesNoSchema,
});

export const fruitAndReachSchema = z.object({
  annual_reach: z.coerce
    .number({ error: "Enter annual reach." })
    .int()
    .min(0, "Annual reach cannot be negative."),
  key_metric: z
    .string()
    .min(5, "Provide a brief key metric.")
    .max(140, "Keep this to one concise sentence."),
  media_presence_url: z.string().optional(),
  has_references: yesNoSchema,
});

export const discernmentSchema = z.object({
  legal_action: yesNoSchema,
  moral_failure: yesNoSchema,
  financial_investigation: yesNoSchema,
  funding_rationale: z
    .string()
    .min(10, "Explain your funding rationale.")
    .max(500, "Keep this under 500 characters."),
  referral_source: z.string().min(1, "Select a referral source."),
});

export const inquiryFormSchema = organizationIdentitySchema
  .merge(leadershipSchema)
  .merge(theologicalFoundationSchema)
  .merge(financialsSchema)
  .merge(fruitAndReachSchema)
  .merge(discernmentSchema)
  .superRefine((values, context) => {
    if (
      (values.geographic_scope === "International" ||
        values.geographic_scope === "Multi-national") &&
      values.countries.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["countries"],
        message: "Select at least one country.",
      });
    }

    if (
      values.ordination_status === "Ordained" &&
      (!values.ordaining_body || values.ordaining_body.trim().length < 2)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ordaining_body"],
        message: "Enter the ordaining body.",
      });
    }

    if (
      values.doctrinal_statement_public &&
      (!values.doctrinal_statement_url ||
        !z.string().url().safeParse(values.doctrinal_statement_url).success)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["doctrinal_statement_url"],
        message: "Enter a valid doctrinal statement URL.",
      });
    }

    if (
      values.media_presence_url &&
      !z.string().url().safeParse(values.media_presence_url).success
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media_presence_url"],
        message: "Enter a valid URL.",
      });
    }

    if (values.moral_failure || values.financial_investigation) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["moral_failure"],
        message:
          "This response triggers disqualification and cannot be submitted.",
      });
    }
  });

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

export const inquiryDefaultValues: InquiryFormValues = {
  annual_reach: 0,
  annual_revenue_range: "Under $100K",
  audit_level: "No audit",
  baptism_position: "Believer baptism only",
  board_approved_budget: false,
  board_compensated: "None",
  board_size: 1,
  countries: [],
  dba_name: "",
  denomination: "Non-denominational",
  doctrinal_statement_public: false,
  doctrinal_statement_url: "",
  ein: "",
  entity_type: "501c3",
  files_990: "Yes",
  financial_investigation: false,
  founder_still_in_leadership: false,
  funding_rationale: "",
  funding_sources: [],
  geographic_scope: "Local",
  gospel_clarity: "Faith alone in Christ alone",
  has_references: false,
  key_metric: "",
  lead_name: "",
  legal_action: false,
  legal_name: "",
  media_presence_url: "",
  moral_failure: false,
  ordaining_body: "",
  ordination_status: "Not ordained",
  primary_focus: [],
  referral_source: "",
  scripture_position: "Inerrant",
  state_of_incorporation: "Alabama",
  theological_education: "No formal training",
  year_founded: new Date().getFullYear(),
  years_in_role: 0,
};

export const inquiryStepFields = [
  [
    "legal_name",
    "dba_name",
    "ein",
    "year_founded",
    "state_of_incorporation",
    "entity_type",
    "primary_focus",
    "geographic_scope",
    "countries",
  ],
  [
    "lead_name",
    "years_in_role",
    "theological_education",
    "ordination_status",
    "ordaining_body",
    "founder_still_in_leadership",
    "board_size",
    "board_compensated",
  ],
  [
    "denomination",
    "doctrinal_statement_public",
    "doctrinal_statement_url",
    "scripture_position",
    "gospel_clarity",
    "baptism_position",
  ],
  [
    "annual_revenue_range",
    "funding_sources",
    "files_990",
    "audit_level",
    "board_approved_budget",
  ],
  ["annual_reach", "key_metric", "media_presence_url", "has_references"],
  [
    "legal_action",
    "moral_failure",
    "financial_investigation",
    "funding_rationale",
    "referral_source",
  ],
] as const satisfies readonly (readonly (keyof InquiryFormValues)[])[];

export const inquiryStepTitles = [
  "Organization Identity",
  "Leadership",
  "Theological Foundation",
  "Financials",
  "Fruit and Reach",
  "Discernment",
] as const;
