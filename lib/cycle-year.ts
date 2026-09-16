import type { Applications } from "@/lib/supabase/types";

/**
 * `cycle_year` is the assigned SAVE assessment cycle year (founder decision,
 * Phase B): the calendar year in which SAVE formally advances an inquiry into
 * the assessment process.
 *
 * It is deliberately NOT the registration year, the inquiry-submission year,
 * the ministry's fiscal year, or the Form 990 year. An inquiry submitted in
 * December 2026 and advanced in January 2027 belongs to cycle 2027.
 *
 * It is also NOT a reassessment clock. Reassessment (normally two years, or
 * earlier after material leadership, financial, doctrinal, governance or
 * organisational change) must be modelled from the completed/published
 * assessment event, never inferred from 1 January of this value.
 */

/** The single staff lifecycle transition that assigns a cycle year. */
export const CYCLE_ASSIGNMENT_STATUS = "inquiry_approved" as const;

export function resolveCycleYear(now: Date = new Date()): number {
  return now.getFullYear();
}

/**
 * A cycle year is assigned only when SAVE advances an unassigned application.
 * An application that already carries one keeps it through every later status
 * change, so re-advancing or correcting a status never rewrites history.
 */
export function shouldAssignCycleYear(
  status: string,
  existingCycleYear: number | null | undefined,
): boolean {
  if (status !== CYCLE_ASSIGNMENT_STATUS) {
    return false;
  }

  return existingCycleYear === null || existingCycleYear === undefined;
}

/**
 * Builds the `applications` update payload for a staff status change, adding
 * the cycle year only on the advancing transition of an unassigned record.
 */
export function buildStatusUpdate(
  status: Applications["status"],
  existingCycleYear: number | null | undefined,
  now: Date = new Date(),
): { cycle_year?: number; status: Applications["status"] } {
  if (!shouldAssignCycleYear(status, existingCycleYear)) {
    return { status };
  }

  return { cycle_year: resolveCycleYear(now), status };
}
