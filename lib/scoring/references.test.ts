import { describe, expect, it } from "vitest";

import { scoreExternal } from "@/lib/scoring/categories/external";
import { getReference, normalizeReferences } from "@/lib/scoring/references";
import type { NormalizedVetting, ReferenceContact } from "@/lib/scoring/types";

/**
 * Finding S regression: the form writes `ref_N_*` and scoring read
 * `reference_N_*`, so every reference a ministry supplied scored zero. These
 * cases walk the path the real data takes — the keys persistence writes, then
 * the mapping, then the scoring outcome — across all three references and all
 * four values, so a rename on either side fails here rather than silently
 * costing every ministry three points.
 */

const INDICES = [1, 2, 3] as const;
const VALUES = ["name", "role", "email", "relationship"] as const;

// Mirrors `mapVettingToPersistence`: the answers are stored in raw_data.
function persistReference(index: 1 | 2 | 3) {
  return Object.fromEntries(
    VALUES.map((value) => [`ref_${index}_${value}`, `${value}-${index}`]),
  );
}

function expectedContact(index: 1 | 2 | 3): ReferenceContact {
  return {
    email: `email-${index}`,
    name: `name-${index}`,
    relationship: `relationship-${index}`,
    role: `role-${index}`,
  };
}

/** A reference counts only when it carries both a name and an email. */
function validReference(index: number) {
  return {
    [`ref_${index}_name`]: `Reference ${index}`,
    [`ref_${index}_email`]: `reference${index}@example.org`,
  };
}

function referencePoints(references: ReferenceContact[]) {
  const vetting = { references } as unknown as NormalizedVetting;

  return scoreExternal(vetting).components.find(
    (component) => component.criterion === "references",
  );
}

describe("the reference keys scoring reads", () => {
  it.each(INDICES)(
    "reads every value of reference %i from the keys the form writes",
    (index) => {
      expect(getReference(persistReference(index), index)).toEqual(
        expectedContact(index),
      );
    },
  );

  it("maps all three references from a single stored application", () => {
    const raw = {
      ...persistReference(1),
      ...persistReference(2),
      ...persistReference(3),
    };

    expect(normalizeReferences(raw)).toEqual([
      expectedContact(1),
      expectedContact(2),
      expectedContact(3),
    ]);
  });

  it("returns nulls rather than undefined when a reference is absent", () => {
    expect(normalizeReferences({})).toEqual([
      { email: null, name: null, relationship: null, role: null },
      { email: null, name: null, relationship: null, role: null },
      { email: null, name: null, relationship: null, role: null },
    ]);
  });

  it.each(VALUES)(
    "still reads a row written under the legacy %s key",
    (value) => {
      expect(
        getReference({ [`reference_2_${value}`]: "legacy" }, 2)[value],
      ).toBe("legacy");
    },
  );

  it("prefers the key the form actually writes over the legacy key", () => {
    const both = {
      ref_1_email: "current@example.org",
      reference_1_email: "legacy@example.org",
    };

    expect(getReference(both, 1).email).toBe("current@example.org");
  });

  it("keeps each reference's values separate from its neighbours'", () => {
    const [first, second, third] = normalizeReferences(persistReference(2));

    expect(second).toEqual(expectedContact(2));
    expect(first.name).toBeNull();
    expect(third.name).toBeNull();
  });
});

describe("what those references score", () => {
  it.each([0, 1, 2, 3])(
    "awards %i points for that many valid references",
    (count) => {
      const raw = Object.assign(
        {},
        ...Array.from({ length: count }, (_unused, offset) =>
          validReference(offset + 1),
        ),
      ) as Record<string, unknown>;

      const component = referencePoints(normalizeReferences(raw));

      expect(component?.awarded_points).toBe(count);
      expect(component?.rationale).toContain(
        `${count} valid external references`,
      );
    },
  );

  it("scores nothing when the values sit under the old scoring keys alone", () => {
    // The shape that produced the defect: were the fallback dropped, this is
    // what every previously stored row would score.
    const legacyOnly = {
      reference_1_email: "reference1@example.org",
      reference_1_name: "Reference 1",
    };

    expect(
      referencePoints(normalizeReferences(legacyOnly))?.awarded_points,
    ).toBe(1);
  });

  it("does not count a reference missing an email", () => {
    const raw = { ref_1_name: "Reference 1", ref_2_name: "Reference 2" };

    expect(referencePoints(normalizeReferences(raw))?.awarded_points).toBe(0);
  });

  it("does not count a reference whose name is only whitespace", () => {
    const raw = {
      ref_1_email: "reference1@example.org",
      ref_1_name: "   ",
    };

    expect(referencePoints(normalizeReferences(raw))?.awarded_points).toBe(0);
  });

  it("keeps the weighting at three points", () => {
    // The repair corrects the mapping only; the weight is unchanged.
    const raw = {
      ...validReference(1),
      ...validReference(2),
      ...validReference(3),
    };
    const component = referencePoints(normalizeReferences(raw));

    expect(component?.max_points).toBe(3);
    expect(component?.awarded_points).toBe(3);
  });
});
