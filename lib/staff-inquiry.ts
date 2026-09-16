import type { Database, Organizations } from "@/lib/supabase/types";

/**
 * Projects the ministry's submitted inquiry into the six sections it was
 * completed in, for read-only review by SAVE staff.
 *
 * This is a presentation projection over the canonical records — the
 * `organizations` row and the `inquiry_responses` row. Nothing is copied into
 * another table, and the AI reviewer summary is never the source of truth: it
 * is supplemental analysis shown separately.
 *
 * Two rules shape the output:
 *
 * 1. Some answers are stored twice. `board_compensated` and `files_990` are
 *    coarse booleans in their columns while `raw_data` keeps the option the
 *    ministry actually chose ("None compensated", "Exempt"). The stored label
 *    wins, because that is what the ministry said.
 * 2. Only finished, human-readable strings leave this module. Raw JSON, column
 *    names, empty values and developer terminology never reach a reviewer.
 */

type InquiryRow = Database["public"]["Tables"]["inquiry_responses"]["Row"];

type OrganizationLike = Pick<
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
>;

export type InquirySectionRow = {
  /** True for free-text answers, which read better as prose than as a value. */
  narrative?: boolean;
  label: string;
  value: string;
};

export type InquirySection = {
  rows: InquirySectionRow[];
  title: string;
};

/**
 * The minimal shape of the query builder this module needs. Declaring it here
 * keeps the one query that reads a ministry's inquiry in a single tested place.
 */
export type InquiryQueryBuilder = {
  select: (columns: string) => {
    eq: (
      column: string,
      value: string,
    ) => {
      maybeSingle: () => PromiseLike<{ data: unknown }>;
    };
  };
};

/**
 * Reads one ministry's submitted inquiry, always filtered to a single
 * application. Scoping lives here so that no caller can accidentally fetch —
 * or render — another organisation's inquiry against this assessment.
 */
export function selectInquiryForApplication(
  from: (table: string) => InquiryQueryBuilder,
  applicationId: string,
) {
  return from("inquiry_responses")
    .select("*")
    .eq("application_id", applicationId)
    .maybeSingle();
}

function text(value: string | null | undefined): string | undefined {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : undefined;
}

function yesNo(value: boolean | null | undefined): string | undefined {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return undefined;
}

function confirmed(value: boolean | null | undefined): string | undefined {
  if (value === true) return "Confirmed";
  if (value === false) return "Not confirmed";
  return undefined;
}

function list(
  values: readonly string[] | null | undefined,
): string | undefined {
  if (!Array.isArray(values)) return undefined;
  const cleaned = values.map((value) => text(value)).filter(Boolean);
  return cleaned.length > 0 ? cleaned.join(", ") : undefined;
}

function count(value: number | null | undefined): string | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-US")
    : undefined;
}

function rawRecord(raw: InquiryRow["raw_data"]): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

function rawText(
  raw: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = raw[key];
  return typeof value === "string" ? text(value) : undefined;
}

function rawBoolean(
  raw: Record<string, unknown>,
  key: string,
): boolean | undefined {
  const value = raw[key];
  return typeof value === "boolean" ? value : undefined;
}

function rawList(
  raw: Record<string, unknown>,
  key: string,
): string[] | undefined {
  const value = raw[key];
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : undefined;
}

/** Stored shorthand such as "501c3" is shown the way the form asked it. */
function entityType(value: string | null | undefined): string | undefined {
  const resolved = text(value);
  if (!resolved) return undefined;
  if (resolved === "501c3") return "501(c)(3)";
  if (resolved === "501c4") return "501(c)(4)";
  return resolved;
}

function section(title: string, rows: Array<InquirySectionRow | null>) {
  return {
    rows: rows.filter((row): row is InquirySectionRow => row !== null),
    title,
  };
}

function row(
  label: string,
  value: string | undefined,
  options: { narrative?: boolean } = {},
): InquirySectionRow | null {
  if (!value) return null;
  return options.narrative
    ? { label, narrative: true, value }
    : { label, value };
}

/** The moment the ministry submitted — not when the record was created. */
export function getInquirySubmittedAt(
  inquiry: Pick<InquiryRow, "submitted_at"> | null | undefined,
): string | null {
  return inquiry?.submitted_at ?? null;
}

export function buildInquirySections(
  organization: OrganizationLike,
  inquiry: InquiryRow | null | undefined,
): InquirySection[] {
  if (!inquiry) {
    return [];
  }

  const raw = rawRecord(inquiry.raw_data);
  const scope = list(organization.geographic_scope);
  const countries = list(rawList(raw, "countries") ?? organization.countries);
  const isOrdained = text(inquiry.ordination_status) === "Ordained";
  const statementPublic = rawBoolean(raw, "doctrinal_statement_public");

  return [
    section("Organization Identity", [
      row("Legal name", text(organization.legal_name)),
      row("Also known as", text(organization.dba_name)),
      row("EIN", text(organization.ein)),
      row("Year founded", count(organization.year_founded)),
      row("State of incorporation", text(organization.state_of_incorporation)),
      row("Entity type", entityType(organization.entity_type)),
      row("Primary focus", list(organization.primary_focus)),
      row("Geographic scope", scope),
      // Only meaningful when the ministry works beyond the United States.
      row("Countries served", countries),
      row("Website", text(organization.website_url)),
    ]),

    section("Leadership", [
      row("Lead name", text(inquiry.lead_name)),
      row("Years in role", count(inquiry.years_in_role)),
      row("Theological education", text(inquiry.theological_education)),
      row("Ordination status", text(inquiry.ordination_status)),
      // Conditional: only asked of an ordained leader.
      isOrdained ? row("Ordaining body", rawText(raw, "ordaining_body")) : null,
      row("Board size", count(inquiry.board_size)),
      row(
        "Board compensation",
        rawText(raw, "board_compensated") ?? yesNo(inquiry.board_compensated),
      ),
    ]),

    section("Theological Foundation", [
      row("Denomination", text(inquiry.denomination)),
      row("Doctrinal statement published", yesNo(statementPublic)),
      // Conditional: only required when the statement is public.
      statementPublic
        ? row("Doctrinal statement", text(inquiry.doctrinal_statement_url))
        : null,
      row("View of scripture", text(inquiry.scripture_position)),
      row("Gospel clarity", text(inquiry.gospel_clarity)),
      row("Baptism position", text(inquiry.baptism_position)),
    ]),

    section("Financials", [
      row("Annual revenue range", text(inquiry.annual_revenue_range)),
      row("Funding sources", list(inquiry.funding_sources)),
      row(
        "Files Form 990",
        rawText(raw, "files_990") ?? yesNo(inquiry.files_990),
      ),
      row("Audit level", text(inquiry.audit_level)),
      row("Board-approved budget", yesNo(inquiry.board_approved_budget)),
    ]),

    section("Fruit & Reach", [
      row("People reached annually", count(inquiry.annual_reach)),
      row("Key metric", text(inquiry.key_metric)),
      row("Media presence", rawText(raw, "media_presence_url")),
      row("References available", yesNo(inquiry.has_references)),
    ]),

    section("Discernment & Submit", [
      // These three are answered by every ministry; "No" is a real answer and
      // is always shown rather than hidden as an absent value.
      row("Legal action", yesNo(inquiry.legal_action)),
      row("Moral failure", yesNo(inquiry.moral_failure)),
      row("Financial investigation", yesNo(inquiry.financial_investigation)),
      row(
        "Why they are seeking outside funding",
        text(inquiry.funding_rationale),
        { narrative: true },
      ),
      row("How they heard about SAVE", text(inquiry.referral_source)),
      row(
        "Information is accurate and complete",
        confirmed(rawBoolean(raw, "attestation_complete")),
      ),
      row(
        "Understands SAVE will contact references and research independently",
        confirmed(rawBoolean(raw, "attestation_research")),
      ),
    ]),
  ];
}
