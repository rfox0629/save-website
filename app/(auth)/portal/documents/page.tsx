import Link from "next/link";

import { MinistryDocumentCenter } from "@/components/forms/ministry-document-center";
import { requireMinistryContext } from "@/lib/ministry";

export default async function PortalDocumentsPage() {
  const context = await requireMinistryContext();

  return (
    <main className="min-h-screen bg-[#0B1622] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <Link
            className="text-sm text-[#C09A45] hover:text-[#F4E3B2]"
            href="/portal"
          >
            Back to portal
          </Link>
          <h1 className="mt-3 text-3xl font-semibold">Document center</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Upload supporting materials and track what our review team has
            already received.
          </p>
        </div>

        <MinistryDocumentCenter
          applicationId={context.application?.id ?? null}
          documents={context.documents}
          organizationId={context.organization.id}
          userId={context.userId}
        />
      </div>
    </main>
  );
}
