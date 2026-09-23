import { vettingStepSchemas, type VettingFormValues } from "@/lib/vetting";

/**
 * Where an unfinished Complete Application should reopen.
 *
 * A part-finished application used to reopen at step 1 however much had been
 * saved, so a ministry returning to it had to click Next seven times to reach
 * the place it left off.
 *
 * The saved response already says how far the ministry got: each step has a
 * schema, and the first step whose saved values do not satisfy its schema is
 * the first step still needing work. That is derived here rather than tracked
 * separately, so there is no second record of progress to drift out of step
 * with the answers themselves.
 */
export function resolveResumeStep(
  values: Partial<VettingFormValues> | null | undefined,
): number {
  if (!values || Object.keys(values).length === 0) {
    return 0;
  }

  for (let step = 0; step < vettingStepSchemas.length; step += 1) {
    if (!vettingStepSchemas[step].safeParse(values).success) {
      return step;
    }
  }

  // Everything is answered but the ministry has not submitted: the last step
  // carries the attestation and the Submit button, so that is where it lands.
  return vettingStepSchemas.length - 1;
}
