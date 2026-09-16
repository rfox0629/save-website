import { describe, expect, it } from "vitest";

import {
  buildInquirySections,
  getInquirySubmittedAt,
  selectInquiryForApplication,
  type InquirySection,
} from "@/lib/staff-inquiry";
import type { Database, Organizations } from "@/lib/supabase/types";

type InquiryRow = Database["public"]["Tables"]["inquiry_responses"]["Row"];

const organization = {
  countries: [],
  dba_name: null,
  ein: "99-9999999",
  entity_type: "501c3",
  geographic_scope: ["National"],
  legal_name: "SAVE Pilot Test Ministry",
  primary_focus: ["Discipleship", "Evangelism"],
  state_of_incorporation: "Minnesota",
  website_url: "https://pilot-test-ministry.example.org",
  year_founded: 2025,
} as unknown as Organizations;

const inquiry = {
  annual_reach: 84,
  annual_revenue_range: "Under $100K",
  application_id: "app-1",
  audit_level: "No audit",
  baptism_position: "Believer baptism only",
  board_approved_budget: true,
  board_compensated: false,
  board_size: 4,
  created_at: "2026-09-16T14:39:03.740Z",
  denomination: "Non-denominational",
  doctrinal_statement_url:
    "https://pilot-test-ministry.example.org/statement-of-faith",
  files_990: true,
  financial_investigation: false,
  funding_rationale:
    "We train ordinary Christians to make disciples where people already are.",
  funding_sources: ["Individual donors"],
  gospel_clarity: "Faith alone in Christ alone",
  has_references: true,
  id: "inquiry-1",
  key_metric: "24 active disciples meeting around kitchen tables",
  lead_name: "Jordan Pilot",
  legal_action: false,
  moral_failure: false,
  ordination_status: "Ordained",
  raw_data: {
    attestation_complete: true,
    attestation_research: true,
    board_compensated: "None compensated",
    countries: [],
    doctrinal_statement_public: true,
    files_990: "Yes",
    media_presence_url: "",
    ordaining_body: "Fictional Test Fellowship of Churches",
  },
  referral_source: "Referral from ministry",
  scripture_position: "Inerrant",
  submitted_at: "2026-09-16T14:46:26.476Z",
  theological_education: "Certificate",
  updated_at: "2026-09-16T14:46:26.523Z",
  years_in_role: 1,
} as unknown as InquiryRow;

const find = (sections: InquirySection[], title: string) =>
  sections.find((entry) => entry.title === title);

const valueOf = (sections: InquirySection[], title: string, label: string) =>
  find(sections, title)?.rows.find((entry) => entry.label === label)?.value;

const labelsOf = (sections: InquirySection[], title: string) =>
  find(sections, title)?.rows.map((entry) => entry.label) ?? [];

describe("submitted inquiry sections", () => {
  it("presents the six sections in the order the ministry completed them", () => {
    expect(
      buildInquirySections(organization, inquiry).map((s) => s.title),
    ).toEqual([
      "Organization Identity",
      "Leadership",
      "Theological Foundation",
      "Financials",
      "Fruit & Reach",
      "Discernment & Submit",
    ]);
  });

  it("renders the ministry's own submitted values", () => {
    const sections = buildInquirySections(organization, inquiry);

    expect(valueOf(sections, "Organization Identity", "Legal name")).toBe(
      "SAVE Pilot Test Ministry",
    );
    expect(valueOf(sections, "Organization Identity", "Primary focus")).toBe(
      "Discipleship, Evangelism",
    );
    expect(valueOf(sections, "Leadership", "Lead name")).toBe("Jordan Pilot");
    expect(valueOf(sections, "Fruit & Reach", "People reached annually")).toBe(
      "84",
    );
    expect(
      valueOf(
        sections,
        "Discernment & Submit",
        "Why they are seeking outside funding",
      ),
    ).toContain("We train ordinary Christians");
  });

  it("shows attestations as confirmations rather than raw booleans", () => {
    const sections = buildInquirySections(organization, inquiry);

    expect(
      valueOf(
        sections,
        "Discernment & Submit",
        "Information is accurate and complete",
      ),
    ).toBe("Confirmed");
    expect(
      valueOf(
        sections,
        "Discernment & Submit",
        "Understands SAVE will contact references and research independently",
      ),
    ).toBe("Confirmed");
  });

  it("always shows the three disclosure answers, including No", () => {
    const sections = buildInquirySections(organization, inquiry);

    expect(valueOf(sections, "Discernment & Submit", "Legal action")).toBe(
      "No",
    );
    expect(valueOf(sections, "Discernment & Submit", "Moral failure")).toBe(
      "No",
    );
    expect(
      valueOf(sections, "Discernment & Submit", "Financial investigation"),
    ).toBe("No");
  });

  it("prefers the option the ministry chose over the coarser stored boolean", () => {
    const sections = buildInquirySections(organization, inquiry);

    // board_compensated is `false` in its column but "None compensated" in the
    // stored answers; files_990 is `true` but "Yes" is what was selected.
    expect(valueOf(sections, "Leadership", "Board compensation")).toBe(
      "None compensated",
    );
    expect(valueOf(sections, "Financials", "Files Form 990")).toBe("Yes");
  });

  it("normalises entity type to the wording the form used", () => {
    const sections = buildInquirySections(organization, inquiry);

    expect(valueOf(sections, "Organization Identity", "Entity type")).toBe(
      "501(c)(3)",
    );
  });
});

describe("conditional fields", () => {
  it("shows the ordaining body only when the leader is ordained", () => {
    const ordained = buildInquirySections(organization, inquiry);
    expect(valueOf(ordained, "Leadership", "Ordaining body")).toBe(
      "Fictional Test Fellowship of Churches",
    );

    const notOrdained = buildInquirySections(organization, {
      ...inquiry,
      ordination_status: "Not ordained",
    });
    expect(labelsOf(notOrdained, "Leadership")).not.toContain("Ordaining body");
  });

  it("shows the doctrinal statement link only when it is public", () => {
    const published = buildInquirySections(organization, inquiry);
    expect(
      valueOf(published, "Theological Foundation", "Doctrinal statement"),
    ).toContain("statement-of-faith");
    expect(
      valueOf(
        published,
        "Theological Foundation",
        "Doctrinal statement published",
      ),
    ).toBe("Yes");

    const privateStatement = buildInquirySections(organization, {
      ...inquiry,
      raw_data: {
        ...(inquiry.raw_data as Record<string, unknown>),
        doctrinal_statement_public: false,
      },
    } as InquiryRow);
    expect(labelsOf(privateStatement, "Theological Foundation")).not.toContain(
      "Doctrinal statement",
    );
    expect(
      valueOf(
        privateStatement,
        "Theological Foundation",
        "Doctrinal statement published",
      ),
    ).toBe("No");
  });

  it("lists countries when the ministry works beyond the United States", () => {
    const international = buildInquirySections(
      { ...organization, geographic_scope: ["International"] } as Organizations,
      {
        ...inquiry,
        raw_data: {
          ...(inquiry.raw_data as Record<string, unknown>),
          countries: ["Kenya", "Philippines"],
        },
      } as InquiryRow,
    );

    expect(
      valueOf(international, "Organization Identity", "Countries served"),
    ).toBe("Kenya, Philippines");
  });

  it("omits optional answers the ministry left blank", () => {
    const sections = buildInquirySections(organization, inquiry);

    // No DBA name and no media URL were provided.
    expect(labelsOf(sections, "Organization Identity")).not.toContain(
      "Also known as",
    );
    expect(labelsOf(sections, "Fruit & Reach")).not.toContain("Media presence");
  });
});

describe("nothing technical reaches a reviewer", () => {
  it("emits no raw JSON, database keys or placeholder values", () => {
    const sections = buildInquirySections(organization, inquiry);
    const rendered = sections
      .flatMap((entry) => entry.rows)
      .map((entry) => `${entry.label}=${entry.value}`)
      .join("|");

    for (const forbidden of [
      "raw_data",
      "[object Object]",
      "undefined",
      "null",
      "_id",
      "application_id",
      "true",
      "false",
    ]) {
      expect(rendered).not.toContain(forbidden);
    }

    // Every emitted value is a non-empty string.
    for (const entry of sections.flatMap((s) => s.rows)) {
      expect(typeof entry.value).toBe("string");
      expect(entry.value.trim().length).toBeGreaterThan(0);
    }
  });

  it("returns no sections when the ministry has not submitted yet", () => {
    expect(buildInquirySections(organization, null)).toEqual([]);
  });
});

describe("submission timestamp", () => {
  it("reports the submission moment, not the record's creation", () => {
    expect(getInquirySubmittedAt(inquiry)).toBe("2026-09-16T14:46:26.476Z");
    expect(getInquirySubmittedAt(null)).toBeNull();
    expect(getInquirySubmittedAt({ submitted_at: null })).toBeNull();
  });
});

describe("retrieval is scoped to a single application", () => {
  function recordingClient(data: unknown) {
    const seen: {
      column?: string;
      columns?: string;
      single?: boolean;
      table?: string;
      value?: string;
    } = {};

    const from = (table: string) => {
      seen.table = table;
      return {
        select: (columns: string) => {
          seen.columns = columns;
          return {
            eq: (column: string, value: string) => {
              seen.column = column;
              seen.value = value;
              return {
                maybeSingle: async () => {
                  seen.single = true;
                  return { data };
                },
              };
            },
          };
        },
      };
    };

    return { from, seen };
  }

  it("reads the canonical table filtered by this application only", async () => {
    const client = recordingClient({ id: "inquiry-1" });

    await selectInquiryForApplication(client.from, "app-1");

    expect(client.seen).toEqual({
      column: "application_id",
      columns: "*",
      single: true,
      table: "inquiry_responses",
      value: "app-1",
    });
  });

  it("never widens the filter when asked for a different application", async () => {
    const client = recordingClient(null);

    await selectInquiryForApplication(client.from, "some-other-application");

    expect(client.seen.column).toBe("application_id");
    expect(client.seen.value).toBe("some-other-application");
    // A single row, so a broad query can never return a second ministry's rows.
    expect(client.seen.single).toBe(true);
  });

  it("returns exactly what the scoped query yielded", async () => {
    const row = { id: "inquiry-9", lead_name: "Someone Else" };
    const client = recordingClient(row);

    const result = await selectInquiryForApplication(client.from, "app-9");

    expect(result.data).toBe(row);
  });
});

describe("numbers read the way a reviewer expects", () => {
  it("writes a founding year plainly, not as a grouped count", () => {
    const sections = buildInquirySections(organization, inquiry);
    const founded = valueOf(sections, "Organization Identity", "Year founded");

    expect(founded).toBe("2025");
    expect(founded).not.toContain(",");
  });

  it("still groups large counts", () => {
    const sections = buildInquirySections(organization, {
      ...inquiry,
      annual_reach: 12500,
    } as InquiryRow);

    expect(valueOf(sections, "Fruit & Reach", "People reached annually")).toBe(
      "12,500",
    );
  });
});

describe("one ministry's answers never appear against another", () => {
  it("projects only the records it is handed", () => {
    const otherOrganization = {
      ...organization,
      ein: "12-3456789",
      legal_name: "Another Ministry",
    } as Organizations;
    const otherInquiry = {
      ...inquiry,
      application_id: "app-2",
      lead_name: "Someone Else",
    } as InquiryRow;

    const sections = buildInquirySections(otherOrganization, otherInquiry);
    const rendered = JSON.stringify(sections);

    expect(valueOf(sections, "Organization Identity", "Legal name")).toBe(
      "Another Ministry",
    );
    expect(valueOf(sections, "Leadership", "Lead name")).toBe("Someone Else");
    expect(rendered).not.toContain("SAVE Pilot Test Ministry");
    expect(rendered).not.toContain("Jordan Pilot");
    expect(rendered).not.toContain("99-9999999");
  });
});
