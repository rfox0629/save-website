"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ExistingDocument = {
  document_type: string;
  file_name: string;
  id: string;
  reviewed: boolean;
  signedUrl: string | null;
  statusLabel: string;
  uploaded_at: string;
};

const DOCUMENT_TYPE_OPTIONS = [
  "990",
  "Audit",
  "Bylaws",
  "Board Minutes",
  "Doctrinal Statement",
  "Budget",
  "Third-party Evaluation",
  "Other",
] as const;

function sanitizeType(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function MinistryDocumentCenter({
  applicationId,
  documents,
  organizationId,
  userId,
}: {
  applicationId: string | null;
  documents: ExistingDocument[];
  organizationId: string;
  userId: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [selectedType, setSelectedType] =
    useState<(typeof DOCUMENT_TYPE_OPTIONS)[number]>("990");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  async function handleUpload() {
    if (!applicationId) {
      setMessage("No application is available yet.");
      return;
    }

    if (!file) {
      setMessage("Select a file to upload.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("Files must be 10MB or smaller.");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return;
    }

    setPending(true);
    setProgress(8);
    setMessage(null);

    const progressTimer = window.setInterval(() => {
      setProgress((current) => (current >= 92 ? current : current + 9));
    }, 180);

    try {
      const safeName = file.name.replace(/\s+/g, "-");
      const documentType = sanitizeType(selectedType);
      const storagePath = `${organizationId}/documents/${documentType}/${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("ministry-documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { error: insertError } = await db.from("documents").insert({
        application_id: applicationId,
        document_type: selectedType,
        file_name: file.name,
        file_size_bytes: file.size,
        review_notes: null,
        reviewed: false,
        reviewer_id: null,
        storage_path: storagePath,
        uploaded_by: userId,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setFile(null);
      setProgress(100);
      setToastMessage(`${file.name} uploaded successfully.`);
      toast.success(`${file.name} uploaded successfully.`);
      setMessage(null);
      router.refresh();
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : "Unable to upload document.";
      setMessage(nextMessage);
      toast.error(nextMessage);
    } finally {
      window.clearInterval(progressTimer);
      window.setTimeout(() => setProgress(0), 500);
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      {toastMessage ? (
        <div className="fixed right-6 top-6 z-50 rounded-2xl border border-[#B7D7C4] bg-[#EAF5EE] px-4 py-3 text-sm font-medium text-[#1B4D35] shadow-[0_18px_40px_rgba(27,77,53,0.12)]">
          {toastMessage}
        </div>
      ) : null}

      <section className="rounded-[32px] border border-[#D8D1C3] bg-white p-8 shadow-[0_20px_60px_rgba(27,77,53,0.07)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
          Section 1
        </p>
        <h2
          className="mt-4 text-3xl text-[#1B4D35]"
          style={{ fontFamily: "var(--font-auth-serif)" }}
        >
          Uploaded Documents
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4F6357]">
          Review every file your ministry has already shared with SAVE. Each
          document includes its review status and a secure download link.
        </p>

        <div className="mt-8 overflow-hidden rounded-[24px] border border-[#E3DCCF]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F4EFE4] text-[#5E7266]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Document Type</th>
                  <th className="px-5 py-4 font-semibold">File Name</th>
                  <th className="px-5 py-4 font-semibold">Uploaded</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE7DA] bg-white">
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td className="px-5 py-4 text-[#1B4D35]">
                      {document.document_type}
                    </td>
                    <td className="px-5 py-4">
                      {document.signedUrl ? (
                        <a
                          className="font-medium text-[#1B4D35] underline decoration-[#C09A45]/60 underline-offset-4 hover:text-[#2F7A53]"
                          href={document.signedUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {document.file_name}
                        </a>
                      ) : (
                        <span className="text-[#4F6357]">
                          {document.file_name}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#4F6357]">
                      {new Date(document.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          document.reviewed
                            ? "bg-[#EAF5EE] text-[#1B4D35]"
                            : "bg-[#FFF4DA] text-[#8A6720]"
                        }`}
                      >
                        {document.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 ? (
                  <tr>
                    <td
                      className="px-5 py-12 text-center text-[#6B8570]"
                      colSpan={4}
                    >
                      No documents uploaded yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_20px_60px_rgba(27,77,53,0.07)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
          Section 2
        </p>
        <h2
          className="mt-4 text-3xl text-[#1B4D35]"
          style={{ fontFamily: "var(--font-auth-serif)" }}
        >
          Upload New Document
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4F6357]">
          Upload PDF documents up to 10MB. New files are added to your review
          record immediately and appear above once saved.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-[220px,1fr]">
          <label className="space-y-2 text-sm font-medium text-[#1B4D35]">
            <span>Document type</span>
            <select
              className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/20"
              onChange={(event) =>
                setSelectedType(
                  event.target.value as (typeof DOCUMENT_TYPE_OPTIONS)[number],
                )
              }
              value={selectedType}
            >
              {DOCUMENT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-medium text-[#1B4D35]">
            <span>Choose file</span>
            <input
              accept=".pdf,application/pdf"
              className="w-full rounded-2xl border border-dashed border-[#CDBFA3] bg-[#FFFDF8] px-4 py-3 text-sm text-[#4F6357] file:mr-4 file:rounded-full file:border-0 file:bg-[#1B4D35] file:px-4 file:py-2 file:font-medium file:text-white"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>
        </div>

        {progress > 0 ? (
          <div className="mt-6 space-y-2">
            <div className="h-3 overflow-hidden rounded-full bg-[#E5DDD0]">
              <div
                className="h-full rounded-full bg-[#1B4D35] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-[#4F6357]">
              {pending ? "Uploading document..." : "Upload complete."}
            </p>
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 rounded-2xl border border-[#E6D4A7] bg-[#FFF8E8] px-4 py-3 text-sm text-[#6C5A2F]">
            {message}
          </div>
        ) : null}

        <div className="mt-8">
          <Button
            className="min-w-[180px] bg-[#1B4D35] text-white hover:bg-[#236645]"
            disabled={pending}
            onClick={() => void handleUpload()}
            type="button"
          >
            {pending ? "Uploading..." : "Upload document"}
          </Button>
        </div>
      </section>
    </div>
  );
}
