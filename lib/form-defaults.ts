/**
 * Shared form-initialisation helpers for the ministry-facing forms.
 *
 * Why this exists (production incident, Phase B pilot):
 * `{ ...defaults, ...initialValues }` looks harmless but is not. A key that is
 * PRESENT with the value `undefined` still wins the spread, so a server value
 * that happens to be absent replaced a perfectly good default — `""` became
 * `undefined`, and the enum defaults ("Alabama", "Local") were wiped too.
 *
 * React Hook Form reads `defaultValues` once, at mount, so nothing recovered
 * afterwards: the inquiry's Legal Name and EIN arrived empty, were hard-coded
 * read-only, and the ministry was blocked by a raw Zod error on a field it was
 * not allowed to edit. No ministry could submit an inquiry at all.
 *
 * Server props also cross the RSC boundary as the literal string "$undefined"
 * for absent values, so that marker is treated as missing too.
 */

/** The marker Next.js serialises an absent server prop as. */
export const UNDEFINED_MARKER = "$undefined";

/** True when a value carries no information and must not overwrite a default. */
export function isMissingValue(value: unknown): boolean {
  return value === undefined || value === null || value === UNDEFINED_MARKER;
}

/**
 * Merge server-provided values over schema defaults without letting missing
 * values destroy them. Neither argument is mutated.
 */
export function mergeFormDefaults<T extends Record<string, unknown>>(
  defaults: T,
  initialValues: Partial<T> | null | undefined,
): T {
  const merged = { ...defaults };

  if (!initialValues) {
    return merged;
  }

  for (const key of Object.keys(initialValues) as (keyof T)[]) {
    const value = initialValues[key];

    if (isMissingValue(value)) {
      continue;
    }

    merged[key] = value as T[keyof T];
  }

  return merged;
}

/**
 * Zod's `invalid_type` text ("Invalid input: expected string, received
 * undefined") is developer output and must never reach a ministry. When a
 * field arrives missing, say what to do about it instead.
 */
const DEVELOPER_MESSAGE_PATTERN = /expected .+, received (undefined|null|nan)/i;

export function toActionableMessage(message: string, label?: string): string {
  if (!DEVELOPER_MESSAGE_PATTERN.test(message)) {
    return message;
  }

  return label
    ? `${label} is required. Contact SAVE if this field is empty and you cannot edit it.`
    : "This field is required. Contact SAVE if you cannot edit it.";
}
