/**
 * A staff member's display name.
 *
 * Attribution prefers this over provider-controlled auth metadata, so it is
 * application data with its own validation rather than whatever an auth
 * provider happens to hold.
 */

export function assertDisplayName(value: unknown): string {
  const trimmed = typeof value === "string" ? value.trim() : "";

  if (trimmed.length === 0) {
    throw new Error("A display name cannot be empty.");
  }

  if (trimmed.length > 120) {
    throw new Error("A display name must be 120 characters or fewer.");
  }

  return trimmed;
}
