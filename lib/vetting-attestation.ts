import type { Database } from "@/lib/supabase/types";

/**
 * The Complete Application's signed attestation.
 *
 * The signature belongs in its own columns rather than only in `raw_data`,
 * which is where it used to live. These helpers are the single place that
 * mapping happens, so the write and the read can be tested against the code
 * that actually ships.
 *
 * `attests_doctrinal_alignment` and `attests_financial_integrity` are columns
 * on the same table and are deliberately never written here: no question on
 * this form asks for them, and recording a signature the ministry never gave
 * would be a fabrication.
 */

type VettingRow = Database["public"]["Tables"]["vetting_responses"]["Row"];

export type AttestationFormValues = {
  attestation_complete: boolean;
  signatory_name: string;
  signatory_title: string;
  signed_at: string;
};

export type AttestationColumns = {
  attestation_name: string | null;
  attestation_signed_at: string | null;
  attestation_title: string | null;
  attests_information_is_true: boolean;
};

function rawString(
  raw: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = raw[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** A calendar date from the form becomes a timestamp for the column. */
function toTimestamp(signedAt: string): string | null {
  if (!signedAt) return null;
  const parsed = new Date(`${signedAt}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function buildAttestationColumns(
  values: AttestationFormValues,
): AttestationColumns {
  return {
    attestation_name: values.signatory_name?.trim() || null,
    attestation_signed_at: toTimestamp(values.signed_at),
    attestation_title: values.signatory_title?.trim() || null,
    attests_information_is_true: values.attestation_complete,
  };
}

/**
 * Reads the attestation back for the form. The columns are canonical; the
 * `raw_data` copy is a fallback so drafts saved before the columns existed
 * still resume correctly.
 */
export function readAttestation(
  row: Partial<VettingRow> | null | undefined,
  raw: Record<string, unknown>,
): {
  attestation_complete: boolean | undefined;
  signatory_name: string | undefined;
  signatory_title: string | undefined;
  signed_at: string | undefined;
} {
  const storedComplete =
    typeof row?.attests_information_is_true === "boolean"
      ? row.attests_information_is_true
      : undefined;
  const legacyComplete =
    typeof raw.attestation_complete === "boolean"
      ? raw.attestation_complete
      : undefined;

  return {
    attestation_complete: storedComplete ?? legacyComplete,
    signatory_name:
      (typeof row?.attestation_name === "string"
        ? row.attestation_name
        : undefined) ?? rawString(raw, "signatory_name"),
    signatory_title:
      (typeof row?.attestation_title === "string"
        ? row.attestation_title
        : undefined) ?? rawString(raw, "signatory_title"),
    signed_at:
      (typeof row?.attestation_signed_at === "string"
        ? row.attestation_signed_at.slice(0, 10)
        : undefined) ?? rawString(raw, "signed_at"),
  };
}
