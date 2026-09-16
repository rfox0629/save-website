import { describe, expect, it } from "vitest";

import {
  buildAttestationColumns,
  readAttestation,
} from "@/lib/vetting-attestation";

const signed = {
  attestation_complete: true,
  signatory_name: "Jordan Pilot",
  signatory_title: "Executive Director",
  signed_at: "2026-09-20",
};

describe("the signed attestation reaches its own columns", () => {
  it("writes each form value to its canonical column", () => {
    expect(buildAttestationColumns(signed)).toEqual({
      attestation_name: "Jordan Pilot",
      attestation_signed_at: "2026-09-20T00:00:00.000Z",
      attestation_title: "Executive Director",
      attests_information_is_true: true,
    });
  });

  it("records a withheld attestation as false rather than dropping it", () => {
    expect(
      buildAttestationColumns({ ...signed, attestation_complete: false })
        .attests_information_is_true,
    ).toBe(false);
  });

  it("stores nothing for a blank signatory rather than an empty string", () => {
    const columns = buildAttestationColumns({
      ...signed,
      signatory_name: "   ",
      signatory_title: "",
      signed_at: "",
    });

    expect(columns.attestation_name).toBeNull();
    expect(columns.attestation_title).toBeNull();
    expect(columns.attestation_signed_at).toBeNull();
  });

  it("never writes a signature the ministry was not asked to give", () => {
    // No question on this form backs these two columns, so the mapping must
    // not produce them at all.
    const columns = buildAttestationColumns(signed) as Record<string, unknown>;

    expect(columns).not.toHaveProperty("attests_doctrinal_alignment");
    expect(columns).not.toHaveProperty("attests_financial_integrity");
    expect(Object.keys(columns).sort()).toEqual([
      "attestation_name",
      "attestation_signed_at",
      "attestation_title",
      "attests_information_is_true",
    ]);
  });
});

describe("reading the attestation back", () => {
  it("prefers the canonical columns", () => {
    const loaded = readAttestation(
      {
        attestation_name: "Jordan Pilot",
        attestation_signed_at: "2026-09-20T00:00:00.000Z",
        attestation_title: "Executive Director",
        attests_information_is_true: true,
      },
      {
        attestation_complete: false,
        signatory_name: "Stale Draft Name",
        signatory_title: "Stale Title",
        signed_at: "2026-01-01",
      },
    );

    expect(loaded).toEqual({
      attestation_complete: true,
      signatory_name: "Jordan Pilot",
      signatory_title: "Executive Director",
      signed_at: "2026-09-20",
    });
  });

  it("falls back to an older draft stored only in raw_data", () => {
    const loaded = readAttestation(
      {
        attestation_name: null,
        attestation_signed_at: null,
        attestation_title: null,
        attests_information_is_true: null,
      },
      {
        attestation_complete: true,
        signatory_name: "Earlier Signatory",
        signatory_title: "Director",
        signed_at: "2026-05-04",
      },
    );

    expect(loaded).toEqual({
      attestation_complete: true,
      signatory_name: "Earlier Signatory",
      signatory_title: "Director",
      signed_at: "2026-05-04",
    });
  });

  it("returns nothing when neither source has an answer", () => {
    expect(readAttestation(null, {})).toEqual({
      attestation_complete: undefined,
      signatory_name: undefined,
      signatory_title: undefined,
      signed_at: undefined,
    });
  });

  it("keeps a recorded false rather than treating it as missing", () => {
    expect(
      readAttestation({ attests_information_is_true: false }, {})
        .attestation_complete,
    ).toBe(false);
  });
});

describe("round-trip", () => {
  it("returns the ministry's own values after a save and reload", () => {
    const columns = buildAttestationColumns(signed);
    const reloaded = readAttestation(columns, {});

    expect(reloaded).toEqual({
      attestation_complete: true,
      signatory_name: "Jordan Pilot",
      signatory_title: "Executive Director",
      signed_at: "2026-09-20",
    });
  });

  it("survives a second save of what was reloaded", () => {
    const once = buildAttestationColumns(signed);
    const reloaded = readAttestation(once, {});
    const twice = buildAttestationColumns({
      attestation_complete: reloaded.attestation_complete ?? false,
      signatory_name: reloaded.signatory_name ?? "",
      signatory_title: reloaded.signatory_title ?? "",
      signed_at: reloaded.signed_at ?? "",
    });

    expect(twice).toEqual(once);
  });
});
