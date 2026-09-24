import { describe, expect, it } from "vitest";

import {
  assembleReviewerSummaryPayload,
  buildTimeWithLeadershipPayload,
  buildVoiceAlignmentPayload,
} from "@/lib/ai/reviewer-summary-payload";
import type { DiligenceEngagement } from "@/lib/supabase/types";

/**
 * The synthesis used to read inquiry, vetting, external checks and reviewer
 * notes only. Relational evidence reached it solely if a reviewer retyped it
 * into a note, so anything they left out was invisible everywhere downstream.
 */

function engagement(
  overrides: Partial<DiligenceEngagement> = {},
): DiligenceEngagement {
  return {
    character_confidence: "high",
    concerns: ["Single point of failure in the founder"],
    culture_confidence: "medium",
    culture_observations: "Staff disagree with him in front of visitors.",
    donor_excerpt: "SAVE spent time with this leadership where they work.",
    follow_ups: ["Ask for the succession plan"],
    kind: "onsite_visit",
    leadership_character_observations: "He corrected himself unprompted.",
    narrative: "A half day with the leadership in the space they work.",
    occurred_on: "2026-09-18",
    org_health_confidence: "high",
    org_health_observations: "Thin and knowingly so.",
    private_notes: "Succession is the live question. Revisit before any recommendation.",
    status: "written_up",
    strengths: ["Correction accepted without defensiveness"],
    visibility: "summary_shareable",
    ...overrides,
  } as DiligenceEngagement;
}

describe("Time With Leadership reaches the synthesis", () => {
  it("carries the reviewer's observations and confidence readings", () => {
    const [entry] = buildTimeWithLeadershipPayload([engagement()]);

    expect(entry.narrative).toBe(
      "A half day with the leadership in the space they work.",
    );
    expect(entry.leadership_character).toBe("He corrected himself unprompted.");
    expect(entry.leadership_character_confidence).toBe("high");
    expect(entry.organizational_health).toBe("Thin and knowingly so.");
    expect(entry.concerns_observed).toEqual([
      "Single point of failure in the founder",
    ]);
    expect(entry.follow_ups).toEqual(["Ask for the succession plan"]);
  });

  it("never carries private notes into the payload", () => {
    const payload = buildTimeWithLeadershipPayload([engagement()]);

    expect(JSON.stringify(payload)).not.toContain("Succession is the live");
    expect(JSON.stringify(payload)).not.toContain("private");
  });

  it("never carries the donor excerpt back into generation", () => {
    const payload = buildTimeWithLeadershipPayload([engagement()]);

    expect(JSON.stringify(payload)).not.toContain(
      "SAVE spent time with this leadership",
    );
  });

  it("omits engagements that have only been scheduled", () => {
    expect(
      buildTimeWithLeadershipPayload([engagement({ status: "scheduled" })]),
    ).toEqual([]);
  });
});

describe("Voice Alignment reaches the synthesis", () => {
  it("carries the approved synthesis", () => {
    const payload = buildVoiceAlignmentPayload({
      generatedAt: "2026-09-23T21:39:40Z",
      status: "aligned",
      summary: {
        alignment_insight: "Both perspectives raise succession.",
        internal_summary: { concerns: ["Succession planning"] },
      },
    });

    expect(payload?.status).toBe("aligned");
    expect(JSON.stringify(payload)).toContain("Succession planning");
  });

  it("returns nothing when no synthesis has been generated", () => {
    expect(buildVoiceAlignmentPayload({ summary: null })).toBeUndefined();
  });
});

describe("evidence provenance", () => {
  const assembled = () =>
    assembleReviewerSummaryPayload({
      externalChecks: [{ source: "IRS TEOS", status: "fail" }],
      ministrySubmitted: { organization: { legal_name: "Example Ministry" } },
      reviewerNotes: [{ note: "A reviewer's own opinion.", section: "Fruit" }],
      timeWithLeadership: buildTimeWithLeadershipPayload([engagement()]),
      voiceAlignment: buildVoiceAlignmentPayload({
        status: "aligned",
        summary: { alignment_insight: "Succession is raised by both sides." },
      }),
    });

  it("keeps each source in its own bucket rather than one blob", () => {
    expect(Object.keys(assembled()).sort()).toEqual([
      "ministry_submitted",
      "reviewer_authored",
      "save_documents_and_external_checks",
      "save_time_with_leadership",
      "save_voice_alignment",
    ]);
  });

  it("keeps reviewer opinion out of the ministry's own bucket", () => {
    const payload = assembled();

    expect(JSON.stringify(payload.ministry_submitted)).not.toContain(
      "A reviewer's own opinion.",
    );
    expect(JSON.stringify(payload.reviewer_authored)).toContain(
      "A reviewer's own opinion.",
    );
  });

  /**
   * The point of the repair: relational evidence must reach the model on its
   * own, not because someone copied it into a reviewer note.
   */
  it("delivers relational evidence with no reviewer notes at all", () => {
    const payload = assembleReviewerSummaryPayload({
      ministrySubmitted: { organization: { legal_name: "Example Ministry" } },
      reviewerNotes: undefined,
      timeWithLeadership: buildTimeWithLeadershipPayload([engagement()]),
      voiceAlignment: buildVoiceAlignmentPayload({
        status: "aligned",
        summary: { alignment_insight: "Succession is raised by both sides." },
      }),
    });

    expect(payload.reviewer_authored).toBeUndefined();
    expect(JSON.stringify(payload.save_time_with_leadership)).toContain(
      "He corrected himself unprompted.",
    );
    expect(JSON.stringify(payload.save_voice_alignment)).toContain(
      "Succession is raised by both sides.",
    );
  });

  it("carries a simulation disclosure through to the model", () => {
    const payload = assembleReviewerSummaryPayload({
      ministrySubmitted: {},
      timeWithLeadership: buildTimeWithLeadershipPayload([
        engagement({
          narrative:
            "DISPOSABLE PILOT TEST RECORD. No site visit took place; this entry exercises the workflow.",
        }),
      ]),
    });

    expect(JSON.stringify(payload)).toContain("No site visit took place");
  });
});
