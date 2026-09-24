import { describe, expect, it } from "vitest";

import { toBriefFormData } from "@/lib/brief-shared";
import type { DonorBrief } from "@/lib/supabase/types";

/**
 * The editor padded commendations with `.slice(0, 3)` and cautions to two.
 * Opening a brief that held more discarded the extras on load, and the next
 * save persisted the loss — three material concerns quietly became two, with
 * nothing to tell the reviewer it had happened.
 */

function brief(overrides: Partial<DonorBrief> = {}): DonorBrief {
  return {
    cautions: [],
    commendations: [],
    headline: "A headline",
    include_voice_alignment: false,
    ministry_description: "A description",
    published: false,
    recommendation_level: "Recommended",
    ...overrides,
  } as DonorBrief;
}

describe("brief curation", () => {
  it("keeps all three pilot cautions when the brief is opened", () => {
    const cautions = [
      "Succession and key-person dependency is the most consistently evidenced concern.",
      "Independent verification of legal and financial standing is currently absent.",
      "The leader's spouse serves as board secretary.",
    ];

    expect(toBriefFormData(brief({ cautions })).cautions).toEqual(cautions);
  });

  it("does not discard a fourth commendation on load", () => {
    const commendations = ["One", "Two", "Three", "Four"];

    expect(toBriefFormData(brief({ commendations })).commendations).toEqual(
      commendations,
    );
  });

  it("round trips without losing anything", () => {
    const stored = brief({
      cautions: ["A", "B", "C", "D"],
      commendations: ["One", "Two", "Three", "Four", "Five"],
    });
    const form = toBriefFormData(stored);

    expect(toBriefFormData(brief(form)).cautions).toEqual(stored.cautions);
    expect(toBriefFormData(brief(form)).commendations).toEqual(
      stored.commendations,
    );
  });

  it("still offers empty fields on a brief that has none", () => {
    const form = toBriefFormData(brief());

    expect(form.commendations).toEqual(["", "", ""]);
    expect(form.cautions).toEqual(["", ""]);
  });

  it("offers empty fields when there is no brief at all", () => {
    expect(toBriefFormData(null).cautions).toEqual(["", ""]);
  });
});
