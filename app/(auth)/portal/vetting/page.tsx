import { loadVettingDraft } from "@/app/actions/vetting";
import { VettingForm } from "@/components/forms/vetting-form";

export default async function VettingPage() {
  const draft = await loadVettingDraft();

  return (
    <VettingForm
      applicationId={draft.applicationId}
      initialValues={draft.initialValues}
      uploadedDocuments={draft.uploadedDocuments}
    />
  );
}
