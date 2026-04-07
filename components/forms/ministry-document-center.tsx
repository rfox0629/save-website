"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  "Other",
] as const;

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

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
  const [message, setMessage] = useState<string | null>(null);

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

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setMessage("Only PDF and image files are allowed.");
      return;
    }

    setPending(true);
    setMessage(null);

    try {
      const safeName = file.name.replace(/\s+/g, "-");
      const documentType = sanitizeType(selectedType);
      const storagePath = `${organizationId}/${documentType}/${safeName}`;
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
      setMessage("Document uploaded successfully.");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to upload document.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold text-white">
          Upload new document
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          PDF and image files only, up to 10MB each.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[220px,1fr,auto]">
          <select
            className="rounded-2xl border border-white/10 bg-[#0B1622] px-4 py-3 text-white"
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

          <input
            accept=".pdf,image/png,image/jpeg,image/webp,image/gif"
            className="rounded-2xl border border-dashed border-white/10 bg-[#0B1622] px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#C09A45] file:px-4 file:py-2 file:font-medium file:text-[#0B1622]"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />

          <Button
            className="bg-[#C09A45] text-[#0B1622] hover:bg-[#d4ac57]"
            disabled={pending}
            onClick={() => void handleUpload()}
            type="button"
          >
            {pending ? "Uploading..." : "Upload"}
          </Button>
        </div>

        {message ? (
          <p className="mt-4 text-sm text-slate-300">{message}</p>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.04] text-slate-300">
              <tr>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {documents.map((document) => (
                <tr className="bg-[#102133]/50" key={document.id}>
                  <td className="px-5 py-4 text-white">
                    {document.document_type}
                  </td>
                  <td className="px-5 py-4">
                    {document.signedUrl ? (
                      <a
                        className="text-[#F4E3B2] hover:text-white"
                        href={document.signedUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {document.file_name}
                      </a>
                    ) : (
                      <span className="text-slate-300">
                        {document.file_name}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {new Date(document.uploaded_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                      {document.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
              {documents.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-slate-400"
                    colSpan={4}
                  >
                    No documents uploaded yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
