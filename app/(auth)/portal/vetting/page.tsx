import { loadVettingDraft } from "@/app/actions/vetting";
import { VettingForm } from "@/components/forms/vetting-form";
import { MinistryNav } from "@/components/portal/ministry-nav";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default async function VettingPage() {
  const draft = await loadVettingDraft();

  if (draft.applicationStatus !== "inquiry_approved" && !draft.readOnly) {
    return (
      <main className="min-h-screen bg-[#F9F6F0] px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <MinistryNav active="vetting" />
          <div className="mx-auto max-w-3xl rounded-[32px] border border-[#D8D1C3] bg-white px-8 py-12 text-center shadow-[0_25px_80px_rgba(27,77,53,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
              Deep Vetting
            </p>
            <h1
              className="mt-6 text-5xl leading-tight text-[#1B4D35]"
              style={{ fontFamily: "var(--font-auth-serif)" }}
            >
              This form is locked.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#4F6357]">
              This form will be unlocked once your inquiry has been approved.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="bg-[#1B4D35] text-white hover:bg-[#236645]"
              >
                <Link href="/portal">Back to portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <VettingForm
      applicationId={draft.applicationId}
      applicationStatus={draft.applicationStatus}
      initialValues={draft.initialValues}
      organizationId={draft.organizationId}
      readOnly={draft.readOnly}
      submittedAt={draft.submittedAt}
      uploadedDocuments={draft.uploadedDocuments}
    />
  );
}
