import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InquiryForm } from "@/components/forms/inquiry-form";
import type { InquiryFormValues } from "@/lib/inquiry";

const saveInquiryDraft = vi.fn(
  async (_values: unknown, _applicationId: string | null) => ({
    applicationId: "app-pilot",
  }),
);
const submitInquiry = vi.fn(
  async (_values: unknown, _applicationId: string | null) => ({ ok: true }),
);

vi.mock("@/app/actions/inquiry", () => ({
  saveInquiryDraft: (values: unknown, applicationId: string | null) =>
    saveInquiryDraft(values, applicationId),
  submitInquiry: (values: unknown, applicationId: string | null) =>
    submitInquiry(values, applicationId),
}));

vi.mock("@/components/portal/ministry-nav", () => ({
  MinistryNav: () => null,
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

function renderForm(
  overrides: {
    initialValues?: Partial<InquiryFormValues>;
    readOnly?: boolean;
  } = {},
) {
  return render(
    <InquiryForm
      applicationId="app-pilot"
      applicationStatus="inquiry_submitted"
      canPreview={false}
      currentViewMode="ministry"
      initialValues={overrides.initialValues ?? {}}
      readOnly={overrides.readOnly ?? false}
      submittedAt={null}
    />,
  );
}

const field = (name: string) =>
  document.querySelector(`[name="${name}"]`) as HTMLInputElement &
    HTMLSelectElement;

beforeEach(() => {
  saveInquiryDraft.mockClear();
  submitInquiry.mockClear();
});

describe("InquiryForm initialisation", () => {
  it("puts server-provided Legal Name and EIN into form state", () => {
    renderForm({
      initialValues: {
        ein: "99-9999999",
        legal_name: "SAVE Pilot Test Ministry",
      },
    });

    expect(field("legal_name")).toHaveValue("SAVE Pilot Test Ministry");
    expect(field("ein")).toHaveValue("99-9999999");
  });

  it("does not let undefined server values destroy enum defaults", () => {
    renderForm({
      initialValues: {
        entity_type: undefined,
        geographic_scope: undefined,
        legal_name: undefined,
        state_of_incorporation: undefined,
      },
    });

    expect(field("state_of_incorporation")).toHaveValue("Alabama");
    expect(field("geographic_scope")).toHaveValue("Local");
    expect(field("entity_type")).toHaveValue("501(c)(3)");
    expect(field("legal_name")).toHaveValue("");
  });

  it("keeps existing valid initial values through initialisation", () => {
    renderForm({
      initialValues: {
        ein: "12-3456789",
        geographic_scope: "National",
        legal_name: "Existing Ministry",
        state_of_incorporation: "Minnesota",
        website_url: "https://example.org",
        year_founded: 2025,
      },
    });

    expect(field("legal_name")).toHaveValue("Existing Ministry");
    expect(field("ein")).toHaveValue("12-3456789");
    expect(field("state_of_incorporation")).toHaveValue("Minnesota");
    expect(field("geographic_scope")).toHaveValue("National");
    expect(field("year_founded")).toHaveValue(2025);
    expect(field("website_url")).toHaveValue("https://example.org");
  });
});

describe("InquiryForm editability", () => {
  it("allows editing Legal Name and EIN in editable mode", async () => {
    const user = userEvent.setup();
    renderForm({
      initialValues: { ein: "12-3456789", legal_name: "Before" },
      readOnly: false,
    });

    const legalName = field("legal_name");
    const ein = field("ein");

    expect(legalName).not.toHaveAttribute("readonly");
    expect(ein).not.toHaveAttribute("readonly");

    await user.clear(legalName);
    await user.type(legalName, "After Ministry");
    await user.clear(ein);
    await user.type(ein, "98-7654321");

    expect(legalName).toHaveValue("After Ministry");
    expect(ein).toHaveValue("98-7654321");
  });

  it("prevents editing in genuine read-only mode", async () => {
    const user = userEvent.setup();
    renderForm({
      initialValues: { ein: "12-3456789", legal_name: "Locked Ministry" },
      readOnly: true,
    });

    const legalName = field("legal_name");
    const ein = field("ein");

    expect(legalName).toHaveAttribute("readonly");
    expect(ein).toHaveAttribute("readonly");

    await user.type(legalName, "should not change");
    await user.type(ein, "00-0000000");

    expect(legalName).toHaveValue("Locked Ministry");
    expect(ein).toHaveValue("12-3456789");
  });
});

describe("InquiryForm step 1 completion", () => {
  it("lets a brand-new ministry complete step 1", async () => {
    const user = userEvent.setup();
    renderForm({
      initialValues: {
        ein: "12-3456789",
        legal_name: "Brand New Ministry",
      },
    });

    await user.click(screen.getByText("Discipleship"));
    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(saveInquiryDraft).toHaveBeenCalledTimes(1));

    // Advanced to step 2 rather than being blocked on step 1.
    expect(await screen.findByText("Leadership")).toBeInTheDocument();

    // Saved against the application it was given, and no other.
    expect(saveInquiryDraft.mock.calls[0]?.[1]).toBe("app-pilot");
  });

  it("never shows raw Zod type output to a ministry", async () => {
    const user = userEvent.setup();
    renderForm({ initialValues: { legal_name: undefined } });

    await user.click(screen.getByText("Discipleship"));
    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() =>
      expect(screen.queryByText(/Legal name is required/i)).toBeInTheDocument(),
    );

    expect(screen.queryByText(/received undefined/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Invalid input:/i)).not.toBeInTheDocument();
    expect(saveInquiryDraft).not.toHaveBeenCalled();
  });
});
