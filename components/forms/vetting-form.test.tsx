import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { VettingForm } from "@/components/forms/vetting-form";

/**
 * Two Complete Application regressions:
 *
 * - the Yes/No toggles conveyed their selection with a background colour only,
 *   so assistive technology could not tell which option was chosen;
 * - every document field sits on the last step, which has no Next button, so a
 *   chosen file reached SAVE only at final Submit and a reload discarded it.
 */

const saveVettingDraft = vi.fn(
  async (values: unknown, applicationId: string | null) => ({
    applicationId: applicationId ?? "app-pilot",
    receivedValues: values,
  }),
);
const submitVetting = vi.fn(
  async (values: unknown, applicationId: string | null) => ({
    applicationId,
    ok: true,
    receivedValues: values,
  }),
);

vi.mock("@/app/actions/vetting", () => ({
  saveVettingDraft: (values: unknown, applicationId: string | null) =>
    saveVettingDraft(values, applicationId),
  submitVetting: (values: unknown, applicationId: string | null) =>
    submitVetting(values, applicationId),
}));

vi.mock("@/components/portal/ministry-nav", () => ({
  MinistryNav: () => null,
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const upload = vi.fn(async () => ({ error: null }));
const insert = vi.fn(async () => ({ error: null }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: "ministry-user-1" } } }),
    },
    from: () => ({ insert }),
    storage: { from: () => ({ upload }) },
  }),
}));

function renderForm(overrides: Record<string, unknown> = {}) {
  return render(
    <VettingForm
      applicationId="app-pilot"
      applicationStatus="inquiry_approved"
      canPreview={false}
      currentViewMode="ministry"
      initialValues={{}}
      organizationId="org-pilot"
      readOnly={false}
      submittedAt={null}
      uploadedDocuments={{}}
      {...overrides}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("the Yes/No toggles say which option is chosen", () => {
  it("exposes a pressed state rather than colour alone", () => {
    renderForm({ initialValues: { compensation_set_by_board: true } });

    const yes = screen.getAllByRole("button", { name: "Yes" })[0];
    const no = screen.getAllByRole("button", { name: "No" })[0];

    expect(yes).toHaveAttribute("aria-pressed", "true");
    expect(no).toHaveAttribute("aria-pressed", "false");
  });

  it("moves the pressed state when the answer changes", async () => {
    const user = userEvent.setup();
    renderForm({ initialValues: { compensation_set_by_board: false } });

    const yes = screen.getAllByRole("button", { name: "Yes" })[0];
    expect(yes).toHaveAttribute("aria-pressed", "false");

    await user.click(yes);

    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: "Yes" })[0]).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
  });
});

describe("an unfinished application reopens where it left off", () => {
  it("renders the step it was given rather than always the first", () => {
    renderForm({ initialStep: 7 });

    expect(
      screen.getByRole("heading", { name: /Documents & Attestation/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Submit Vetting/i }),
    ).toBeTruthy();
  });

  it("offers a draft save on the last step, which has no Next", async () => {
    const user = userEvent.setup();
    renderForm({ initialStep: 7 });

    const save = screen.getByRole("button", { name: /Save draft/i });
    await user.click(save);

    await waitFor(() => expect(saveVettingDraft).toHaveBeenCalled());
    expect(submitVetting).not.toHaveBeenCalled();
  });
});

describe("a chosen document persists immediately", () => {
  it("uploads and records it without waiting for Submit", async () => {
    const user = userEvent.setup();
    const { container } = renderForm({ initialStep: 7 });

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["%PDF-1.4"], "budget.pdf", {
      type: "application/pdf",
    });

    await user.upload(input, file);

    await waitFor(() => expect(upload).toHaveBeenCalled());
    await waitFor(() => expect(insert).toHaveBeenCalled());
    expect(submitVetting).not.toHaveBeenCalled();

    // Evidence provenance: the uploader comes from the authenticated session,
    // not from a prop the client could set.
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ uploaded_by: "ministry-user-1" }),
    );
  });
});

describe("documents SAVE already holds", () => {
  it("shows them again after a reload instead of asking for them twice", () => {
    renderForm({
      initialStep: 7,
      uploadedDocuments: {
        budget: {
          fileName: "budget.pdf",
          storagePath: "org-pilot/vetting/budget/budget.pdf",
        },
      },
    });

    expect(screen.getByText(/Uploaded: budget\.pdf/i)).toBeTruthy();
  });
});
