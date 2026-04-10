import { loadInquiryDraft } from "@/app/actions/inquiry";
import { InquiryForm } from "@/components/forms/inquiry-form";

export default async function InquiryPage() {
  const draft = await loadInquiryDraft();

  return (
    <InquiryForm
      applicationId={draft.applicationId}
      applicationStatus={draft.applicationStatus}
      canPreview={draft.canPreview}
      currentViewMode={draft.currentViewMode}
      initialValues={draft.initialValues}
      readOnly={draft.readOnly}
      submittedAt={draft.submittedAt}
    />
  );
}
