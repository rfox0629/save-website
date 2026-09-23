import type { VettingDocumentType } from "@/lib/vetting";

/**
 * Persisting a document the ministry has supplied.
 *
 * Every document field on the Complete Application belongs to step 8, and step
 * 8 is the only step with no Next button. Uploads used to be triggered by the
 * step-advance handler, so nothing on that step reached storage until final
 * Submit: a ministry that attached its 990, audit, budget, bylaws, minutes and
 * doctrinal statement and then reloaded lost all six with no warning, and was
 * asked to supply them again.
 *
 * A document now persists the moment it is chosen. The rules that used to live
 * inside the form's upload loop live here instead, so the validation and the
 * storage path are covered by tests against the code that actually runs rather
 * than a copy of it.
 */

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_CONTENT_TYPE = "application/pdf";

export type UploadedDocument = {
  fileName: string;
  storagePath: string;
};

type StorageResult = { error?: { message: string } | null };

export type DocumentUploadDeps = {
  uploadToStorage: (
    storagePath: string,
    file: File,
  ) => Promise<StorageResult> | StorageResult;
  insertDocument: (row: {
    application_id: string;
    document_type: string;
    file_name: string;
    file_size_bytes: number;
    reviewed: boolean;
    storage_path: string;
  }) => Promise<StorageResult> | StorageResult;
};

export function sanitizeFilename(fileName: string) {
  return fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

export function buildStoragePath(
  organizationId: string,
  field: string,
  fileName: string,
) {
  return `${organizationId}/vetting/${field}/${sanitizeFilename(fileName)}`;
}

/** Thrown for a file the ministry can correct, so the form can say why. */
export class DocumentUploadError extends Error {}

export async function uploadVettingDocument({
  applicationId,
  deps,
  field,
  file,
  organizationId,
}: {
  applicationId: string;
  deps: DocumentUploadDeps;
  field: VettingDocumentType;
  file: File;
  organizationId: string;
}): Promise<UploadedDocument> {
  if (file.type !== DOCUMENT_CONTENT_TYPE) {
    throw new DocumentUploadError("Only PDF files are allowed.");
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    throw new DocumentUploadError("Each file must be 10MB or smaller.");
  }

  const fileName = sanitizeFilename(file.name);
  const storagePath = buildStoragePath(organizationId, field, file.name);

  const uploaded = await deps.uploadToStorage(storagePath, file);

  if (uploaded?.error) {
    throw new DocumentUploadError(uploaded.error.message);
  }

  const inserted = await deps.insertDocument({
    application_id: applicationId,
    document_type: field,
    file_name: fileName,
    file_size_bytes: file.size,
    reviewed: false,
    storage_path: storagePath,
  });

  if (inserted?.error) {
    throw new DocumentUploadError(inserted.error.message);
  }

  return { fileName, storagePath };
}
