import type { ReferenceContact } from "@/lib/scoring/types";

/**
 * The three references a ministry supplies on the Complete Application.
 *
 * The form, its validation, persistence, save/resume and the staff evidence
 * view all use `ref_1_*` through `ref_3_*`. Scoring alone read `reference_N_*`,
 * which nothing has ever written, so all four values of all three references
 * were always absent and the three external-trust points were unearnable
 * however a ministry answered. The mismatch was uniform: every reference, every
 * value.
 *
 * `ref_${index}_*` is canonical. `reference_${index}_*` is read only as a
 * fallback, for any row that was written under it.
 *
 * This mapping lives in its own module, apart from the engine, so the tests can
 * exercise the code that actually ships rather than a copy of it: the engine
 * imports `server-only` and cannot be loaded from a test.
 */

type ReferenceValue = "name" | "role" | "email" | "relationship";

function getOptionalString(
  raw: Record<string, unknown>,
  key: string,
): string | null {
  return typeof raw[key] === "string" ? (raw[key] as string) : null;
}

export function getReference(
  raw: Record<string, unknown>,
  index: 1 | 2 | 3,
): ReferenceContact {
  const read = (value: ReferenceValue) =>
    getOptionalString(raw, `ref_${index}_${value}`) ??
    getOptionalString(raw, `reference_${index}_${value}`);

  return {
    email: read("email"),
    name: read("name"),
    relationship: read("relationship"),
    role: read("role"),
  };
}

export function normalizeReferences(
  raw: Record<string, unknown>,
): ReferenceContact[] {
  return [getReference(raw, 1), getReference(raw, 2), getReference(raw, 3)];
}
