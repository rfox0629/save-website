import Link from "next/link";

import { MinistryDocumentCenter } from "@/components/forms/ministry-document-center";
import { MinistryNav } from "@/components/portal/ministry-nav";
import { requireMinistryContext } from "@/lib/ministry";

export default async function PortalDocumentsPage() {
  const context = await requireMinistryContext();

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-10 text-[#1B4D35]">
      <div className="mx-auto max-w-6xl space-y-8">
        <MinistryNav active="documents" />

        <section className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)] md:p-10">
          <Link
            className="text-sm font-semibold text-[#6B8570] hover:text-[#1B4D35]"
            href="/portal"
          >
            Back to portal
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
            Ministry Documents
          </p>
          <h1
            className="mt-4 text-4xl leading-tight md:text-5xl"
            style={{ fontFamily: "var(--font-auth-serif)" }}
          >
            Keep your review materials organized in one place.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#4F6357]">
            Upload supporting documentation, confirm what has already been
            received, and download secure copies anytime you need them.
          </p>
        </section>

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
