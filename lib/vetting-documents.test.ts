import { describe, expect, it, vi } from "vitest";

import {
  buildStoragePath,
  DocumentUploadError,
  MAX_DOCUMENT_BYTES,
  uploadVettingDocument,
} from "@/lib/vetting-documents";

/**
 * Step 8 regression: every document field belongs to the last step, and the
 * last step has no Next button. Uploads were triggered by the step-advance
 * handler, so nothing reached storage until final Submit and a reload lost it.
 * These cases pin the rules that decide whether a chosen file is persisted.
 */

function pdf(name = "Form 990 (2025).pdf", size = 1024) {
  return { name, size, type: "application/pdf" } as unknown as File;
}

function deps(
  overrides: Partial<Parameters<typeof uploadVettingDocument>[0]["deps"]> = {},
) {
  return {
    insertDocument: vi.fn(async () => ({ error: null })),
    uploadToStorage: vi.fn(async () => ({ error: null })),
    ...overrides,
  };
}

const base = {
  applicationId: "app-1",
  field: "form_990" as const,
  organizationId: "org-1",
};

describe("persisting a supplied document", () => {
  it("stores the file and records the row in one step", async () => {
    const d = deps();
    const result = await uploadVettingDocument({
      ...base,
      deps: d,
      file: pdf(),
    });

    expect(d.uploadToStorage).toHaveBeenCalledOnce();
    expect(d.insertDocument).toHaveBeenCalledWith({
      application_id: "app-1",
      document_type: "form_990",
      file_name: "Form-990-2025.pdf",
      file_size_bytes: 1024,
      reviewed: false,
      storage_path: "org-1/vetting/form_990/Form-990-2025.pdf",
    });
    expect(result).toEqual({
      fileName: "Form-990-2025.pdf",
      storagePath: "org-1/vetting/form_990/Form-990-2025.pdf",
    });
  });

  it("keeps the storage path scoped to the organization and field", () => {
    expect(buildStoragePath("org-1", "bylaws", "Our Bylaws.pdf")).toBe(
      "org-1/vetting/bylaws/Our-Bylaws.pdf",
    );
  });

  it("refuses a file that is not a PDF, and records nothing", async () => {
    const d = deps();
    const file = {
      name: "notes.txt",
      size: 10,
      type: "text/plain",
    } as unknown as File;

    await expect(
      uploadVettingDocument({ ...base, deps: d, file }),
    ).rejects.toThrow(DocumentUploadError);
    expect(d.uploadToStorage).not.toHaveBeenCalled();
    expect(d.insertDocument).not.toHaveBeenCalled();
  });

  it("refuses a file over the size limit, and records nothing", async () => {
    const d = deps();

    await expect(
      uploadVettingDocument({
        ...base,
        deps: d,
        file: pdf("big.pdf", MAX_DOCUMENT_BYTES + 1),
      }),
    ).rejects.toThrow("10MB or smaller");
    expect(d.insertDocument).not.toHaveBeenCalled();
  });

  it("does not record a row when the file never reached storage", async () => {
    const d = deps({
      uploadToStorage: vi.fn(async () => ({
        error: { message: "storage is full" },
      })),
    });

    await expect(
      uploadVettingDocument({ ...base, deps: d, file: pdf() }),
    ).rejects.toThrow("storage is full");
    expect(d.insertDocument).not.toHaveBeenCalled();
  });

  it("surfaces a failed row write rather than reporting success", async () => {
    const d = deps({
      insertDocument: vi.fn(async () => ({
        error: { message: "row rejected" },
      })),
    });

    await expect(
      uploadVettingDocument({ ...base, deps: d, file: pdf() }),
    ).rejects.toThrow("row rejected");
  });
});
