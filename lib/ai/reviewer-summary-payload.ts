import type { DiligenceEngagement } from "@/lib/supabase/types";

/**
 * Relational evidence for the reviewer synthesis.
 *
 * Voice Alignment and Time With Leadership are the two halves of SAVE's
 * relational diligence, and before this module the synthesis could not see
 * either. A reviewer had to retype what the evidence said into a note, which
 * meant anything they left out was invisible to every downstream surface.
 *
 * Two boundaries are enforced here rather than left to the caller:
 *
 * - Individual Voice Alignment responses never enter the payload. Respondents
 *   are told their feedback is not attributed back to them, and the synthesis
 *   feeds donor-facing generation, so only the approved unattributed summary is
 *   passed through.
 * - An engagement's private notes never leave the SAVE team "in any
 *   projection", which includes this one. The donor excerpt is dropped too: it
 *   is already-published copy rather than evidence, and feeding it back risks
 *   the model quoting SAVE to SAVE.
 */

export function compactValue(value: unknown): unknown {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  if (Array.isArray(value)) {
    const items = value.map(compactValue).filter((item) => item !== undefined);
    return items.length > 0 ? items : undefined;
  }

  if (typeof value === "object") {
    const record = compactRecord(value as Record<string, unknown>);
    return Object.keys(record).length > 0 ? record : undefined;
  }

  return value;
}

export function compactRecord(record: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(record).flatMap(([key, value]) => {
      const compacted = compactValue(value);
      return compacted === undefined ? [] : [[key, compacted]];
    }),
  );
}

function toStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/**
 * One engagement, as evidence. `visibility` is carried so the model can tell an
 * internal record from one SAVE was willing to summarise publicly; the excerpt
 * itself is not.
 */
export function buildTimeWithLeadershipPayload(
  engagements: DiligenceEngagement[],
) {
  return engagements
    .filter((engagement) => engagement.status !== "scheduled")
    .slice(0, 12)
    .map((engagement) =>
      compactRecord({
        concerns_observed: engagement.concerns,
        culture: engagement.culture_observations,
        culture_confidence: engagement.culture_confidence,
        follow_ups: toStringList(engagement.follow_ups),
        kind: engagement.kind,
        leadership_character: engagement.leadership_character_observations,
        leadership_character_confidence: engagement.character_confidence,
        narrative: engagement.narrative,
        occurred_on: engagement.occurred_on,
        organizational_health: engagement.org_health_observations,
        organizational_health_confidence: engagement.org_health_confidence,
        status: engagement.status,
        strengths_observed: engagement.strengths,
        visibility: engagement.visibility,
      }),
    )
    .filter((entry) => Object.keys(entry).length > 0);
}

/**
 * The Voice Alignment synthesis only — the same unattributed conclusions a
 * donor could be shown, never the individual responses behind them.
 */
export function buildVoiceAlignmentPayload(input: {
  externalResponseCount?: number;
  generatedAt?: string | null;
  internalResponseCount?: number;
  status?: string | null;
  summary: unknown;
}) {
  const payload = compactRecord({
    external_response_count: input.externalResponseCount,
    generated_at: input.generatedAt,
    internal_response_count: input.internalResponseCount,
    status: input.status,
    synthesis: input.summary,
  });

  return Object.keys(payload).length > 0 ? payload : undefined;
}

/**
 * Assemble the payload the model sees.
 *
 * Each source of evidence keeps its own top-level bucket so the model can never
 * present SAVE's own material, a reviewer's opinion, or a third party's
 * testimony as the ministry's own claim.
 */
export function assembleReviewerSummaryPayload(input: {
  externalChecks?: unknown;
  ministrySubmitted: Record<string, unknown>;
  reviewerNotes?: unknown;
  timeWithLeadership?: unknown;
  voiceAlignment?: unknown;
}) {
  return compactRecord({
    ministry_submitted: input.ministrySubmitted,
    save_documents_and_external_checks: input.externalChecks,
    save_time_with_leadership: input.timeWithLeadership,
    save_voice_alignment: input.voiceAlignment,
    reviewer_authored: input.reviewerNotes,
  });
}
