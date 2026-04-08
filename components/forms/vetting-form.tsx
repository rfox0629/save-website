"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { useForm, type FieldPath, type FieldValues } from "react-hook-form";
import { toast } from "sonner";

import { saveVettingDraft, submitVetting } from "@/app/actions/vetting";
import { MinistryNav } from "@/components/portal/ministry-nav";
import { createClient } from "@/lib/supabase/client";
import {
  type VettingDocumentType,
  vettingDefaultValues,
  vettingDocumentTypes,
  vettingStepFields,
  vettingStepSchemas,
  vettingStepTitles,
  type VettingFormValues,
} from "@/lib/vetting";

type UploadedDoc = {
  fileName: string;
  storagePath: string;
};

type VettingFormProps = {
  applicationId: string | null;
  applicationStatus: string | null;
  initialValues: Partial<VettingFormValues>;
  organizationId: string | null;
  readOnly: boolean;
  submittedAt: string | null;
  uploadedDocuments: Partial<Record<string, UploadedDoc>>;
};

type FileState = Partial<Record<VettingDocumentType, File | null>>;
type UploadingState = Partial<Record<VettingDocumentType, boolean>>;

const DOCUMENT_LABELS: Record<VettingDocumentType, string> = {
  audit_review: "Most recent audit or financial review",
  board_minutes: "Board meeting minutes (last 2 years)",
  budget: "Board-approved budget",
  bylaws: "Current bylaws",
  doctrinal_statement: "Doctrinal statement (if not publicly available)",
  form_990: "Most recent Form 990 (if applicable)",
};

const STEP_DOCUMENT_FIELDS: Record<number, readonly VettingDocumentType[]> = {
  7: vettingDocumentTypes,
};

const REFERENCE_ROWS = [1, 2, 3] as const;
const PARTNER_ROWS = [1, 2] as const;

function mergeDefaults(
  initialValues: Partial<VettingFormValues>,
): VettingFormValues {
  return {
    ...vettingDefaultValues,
    ...initialValues,
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-[#9B2C2C]">{message}</p>;
}

function TextInput({
  readOnly = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  readOnly?: boolean;
}) {
  return (
    <input
      {...props}
      readOnly={readOnly}
      className={`w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10 ${readOnly ? "cursor-not-allowed bg-[#F4EFE4] text-[#617367]" : ""} ${props.className ?? ""}`}
    />
  );
}

function SelectInput({
  disabled = false,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      disabled={disabled}
      className={`w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10 ${disabled ? "cursor-not-allowed bg-[#F4EFE4] text-[#617367]" : ""} ${props.className ?? ""}`}
    />
  );
}

function TextArea({
  readOnly = false,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  readOnly?: boolean;
}) {
  return (
    <textarea
      {...props}
      readOnly={readOnly}
      className={`min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10 ${readOnly ? "cursor-not-allowed bg-[#F4EFE4] text-[#617367]" : ""} ${props.className ?? ""}`}
    />
  );
}

function SliderInput({
  disabled = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      disabled={disabled}
      type="range"
      className={`w-full accent-[#1B4D35] ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    />
  );
}

function StepHeader({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep + 1) / vettingStepTitles.length) * 100;

  return (
    <div className="rounded-[28px] border border-[#D8D1C3] bg-white px-6 py-5 shadow-[0_18px_40px_rgba(27,77,53,0.06)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
          Step {currentStep + 1} of 8 — {vettingStepTitles[currentStep]}
        </p>
        <p className="text-sm text-[#617367]">
          Draft saves on every Next click
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E8E0D3]">
        <div
          className="h-full rounded-full bg-[#1B4D35] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function RadioGroup({
  disabled = false,
  labels = ["No", "Yes"],
  onChange,
  value,
}: {
  disabled?: boolean;
  labels?: [string, string];
  onChange: (value: boolean) => void;
  value?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] p-1">
      {[false, true].map((option, index) => (
        <button
          className={`rounded-[14px] px-4 py-2 text-sm font-semibold transition ${
            value === option
              ? "bg-[#1B4D35] text-white"
              : "text-[#617367] hover:bg-[#F4EFE4]"
          } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
          disabled={disabled}
          key={String(option)}
          onClick={() => onChange(option)}
          type="button"
        >
          {labels[index]}
        </button>
      ))}
    </div>
  );
}

function CheckboxCard({
  checked,
  disabled = false,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-3 rounded-2xl border border-[#D8D1C3] px-4 py-3 text-sm text-[#1B4D35] ${
        disabled ? "bg-[#F4EFE4] text-[#617367]" : "bg-[#FFFDF8]"
      }`}
    >
      <input
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

function pickStepValues<T extends FieldValues>(
  values: T,
  fields: readonly string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const field of fields) {
    result[field] = values[field as keyof T];
  }

  return result;
}

function ReadOnlyBanner({ submittedAt }: { submittedAt: string | null }) {
  if (!submittedAt) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-[#C9BA98] bg-[#FFF8E8] px-6 py-5 text-[#1B4D35]">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#9A7A2D]">
        Submitted
      </p>
      <p className="mt-2 text-base leading-7">
        Submitted on {new Date(submittedAt).toLocaleDateString()}. This vetting
        form is now read-only while our team completes review.
      </p>
    </div>
  );
}

function sanitizeFilename(fileName: string) {
  return fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

export function VettingForm({
  applicationId,
  applicationStatus,
  initialValues,
  organizationId,
  readOnly,
  submittedAt,
  uploadedDocuments: initialDocuments,
}: VettingFormProps) {
  const supabase = useMemo(() => createClient(), []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [currentStep, setCurrentStep] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [processingVisible, setProcessingVisible] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(
    applicationStatus,
  );
  const [pendingFiles, setPendingFiles] = useState<FileState>({});
  const [uploadedDocuments, setUploadedDocuments] = useState(initialDocuments);
  const [uploading, setUploading] = useState<UploadingState>({});
  const [isPending, startTransition] = useTransition();

  const form = useForm<VettingFormValues>({
    defaultValues: mergeDefaults(initialValues),
  });

  const marriageSexualityPublic = form.watch("marriage_sexuality_public");
  const familyOnBoard = form.watch("family_on_board");
  const recentDeficit = form.watch("recent_deficit");
  const negativePress = form.watch("negative_press");
  const ecfaMember = form.watch("ecfa_member");
  const restrictedFundsMisused = form.watch("restricted_funds_misused");

  useEffect(() => {
    if (!processingVisible || !applicationId) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/status/${applicationId}`, {
          cache: "no-store",
        });

        if (!response.ok || cancelled) {
          return;
        }

        const body = (await response.json()) as { status?: string };
        const nextStatus = body.status ?? null;
        setProcessingStatus(nextStatus);

        if (nextStatus && nextStatus !== "vetting_submitted") {
          setProcessingVisible(false);
          setConfirmationVisible(true);
          toast.success("Background diligence checks are underway.");
        }
      } catch {
        // Ignore a single polling error and try again on the next interval.
      }
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [applicationId, processingVisible]);

  const validateStep = async () => {
    const fields = vettingStepFields[currentStep];
    const values = form.getValues();
    const schema = vettingStepSchemas[currentStep];
    const stepValues = pickStepValues(values, fields);

    fields.forEach((field) =>
      form.clearErrors(field as FieldPath<VettingFormValues>),
    );

    const result = schema.safeParse(stepValues);

    if (result.success) {
      return true;
    }

    result.error.issues.forEach((issue) => {
      const path = issue.path[0];
      if (typeof path === "string") {
        form.setError(path as FieldPath<VettingFormValues>, {
          message: issue.message,
          type: "manual",
        });
      }
    });

    return false;
  };

  const updatePendingFile =
    (field: VettingDocumentType) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setPendingFiles((current) => ({
        ...current,
        [field]: file,
      }));
    };

  const uploadStepFiles = async () => {
    const fields = STEP_DOCUMENT_FIELDS[currentStep] ?? [];

    if (!applicationId || !organizationId) {
      return;
    }

    for (const field of fields) {
      const file = pendingFiles[field];

      if (!file) {
        continue;
      }

      if (file.type !== "application/pdf") {
        throw new Error("Only PDF files are allowed.");
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Each file must be 10MB or smaller.");
      }

      setUploading((current) => ({ ...current, [field]: true }));

      const safeName = sanitizeFilename(file.name);
      const storagePath = `${organizationId}/vetting/${field}/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("ministry-documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        setUploading((current) => ({ ...current, [field]: false }));
        throw new Error(uploadError.message);
      }

      const { error: insertError } = await db.from("documents").insert({
        application_id: applicationId,
        document_type: field,
        file_name: safeName,
        file_size_bytes: file.size,
        reviewed: false,
        storage_path: storagePath,
      });

      setUploading((current) => ({ ...current, [field]: false }));

      if (insertError) {
        throw new Error(insertError.message);
      }

      setUploadedDocuments((current) => ({
        ...current,
        [field]: {
          fileName: safeName,
          storagePath,
        },
      }));
      setPendingFiles((current) => ({
        ...current,
        [field]: null,
      }));
    }
  };

  const handleNext = () => {
    startTransition(async () => {
      setGlobalError(null);
      const isValid = await validateStep();

      if (!isValid) {
        return;
      }

      try {
        await uploadStepFiles();
      } catch (error) {
        const nextMessage =
          error instanceof Error ? error.message : "Unable to upload files.";
        setGlobalError(nextMessage);
        toast.error(nextMessage);
        return;
      }

      const result = await saveVettingDraft(form.getValues(), applicationId);

      if (result.error) {
        setGlobalError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("Vetting draft saved.");
      setCurrentStep((step) =>
        Math.min(step + 1, vettingStepTitles.length - 1),
      );
    });
  };

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      setGlobalError(null);
      const isValid = await validateStep();

      if (!isValid) {
        return;
      }

      try {
        await uploadStepFiles();
      } catch (error) {
        const nextMessage =
          error instanceof Error ? error.message : "Unable to upload files.";
        setGlobalError(nextMessage);
        toast.error(nextMessage);
        return;
      }

      const result = await submitVetting(values, applicationId);

      if (result.error) {
        setGlobalError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("Vetting materials submitted. Processing your submission...");
      setProcessingStatus("vetting_submitted");
      setProcessingVisible(true);
    });
  });

  if (processingVisible) {
    return (
      <main className="min-h-screen bg-[#F9F6F0] px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <MinistryNav active="vetting" />
          <div className="mx-auto max-w-3xl rounded-[32px] border border-[#D8D1C3] bg-white px-8 py-12 text-center shadow-[0_25px_80px_rgba(27,77,53,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
              Processing Submission
            </p>
            <h1
              className="mt-6 text-5xl leading-tight text-[#1B4D35]"
              style={{ fontFamily: "var(--font-auth-serif)" }}
            >
              We’re processing your vetting materials.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#4F6357]">
              This can take up to a minute while SAVE runs your external checks
              and prepares your file for reviewer assessment.
            </p>
            <div className="mx-auto mt-8 h-3 max-w-xl overflow-hidden rounded-full bg-[#E8E0D3]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#C09A45]" />
            </div>
            <p className="mt-4 text-sm text-[#6B8570]">
              Current status: {processingStatus?.replace(/_/g, " ") ?? "pending"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (confirmationVisible) {
    return (
      <main className="min-h-screen bg-[#F9F6F0] px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <MinistryNav active="vetting" />
          <div className="mx-auto max-w-3xl rounded-[32px] border border-[#D8D1C3] bg-white px-8 py-12 text-center shadow-[0_25px_80px_rgba(27,77,53,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
              Vetting Submitted
            </p>
            <h1
              className="mt-6 text-5xl leading-tight text-[#1B4D35]"
              style={{ fontFamily: "var(--font-auth-serif)" }}
            >
              Your vetting materials have been submitted.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#4F6357]">
              Our team will be in touch within 2–3 weeks.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const renderDocumentField = (field: VettingDocumentType) => {
    const existing = uploadedDocuments[field];
    const pending = pendingFiles[field];

    return (
      <div className="space-y-2" key={field}>
        <label className="text-sm font-medium text-[#1B4D35]">
          {DOCUMENT_LABELS[field]}
        </label>
        <TextInput
          accept="application/pdf"
          disabled={readOnly}
          onChange={updatePendingFile(field)}
          type="file"
        />
        {uploading[field] ? (
          <p className="text-xs text-[#6B8570]">Uploading...</p>
        ) : null}
        {pending ? (
          <p className="text-xs text-[#6B8570]">Selected: {pending.name}</p>
        ) : null}
        {existing ? (
          <p className="text-xs text-[#2F7A53]">
            Uploaded: {existing.fileName}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-10 text-[#1B4D35]">
      <div className="mx-auto max-w-6xl space-y-8">
        <MinistryNav active="vetting" />
        <ReadOnlyBanner submittedAt={submittedAt} />
        {!readOnly ? <StepHeader currentStep={currentStep} /> : null}

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
              Current Section
            </p>
            <h1
              className="mt-4 text-4xl leading-tight"
              style={{ fontFamily: "var(--font-auth-serif)" }}
            >
              {readOnly ? "Vetting Submitted" : vettingStepTitles[currentStep]}
            </h1>
            <p className="mt-4 text-base leading-8 text-[#4F6357]">
              {readOnly
                ? "Your submitted vetting responses are shown below for reference."
                : "Complete each section carefully. Every Next click saves your draft and keeps your progress intact."}
            </p>

            {restrictedFundsMisused ? (
              <div className="mt-6 rounded-2xl border border-[#D98C8C] bg-[#FFF1F1] px-4 py-3 text-sm text-[#9B2C2C]">
                This will be reviewed carefully by our team. Please explain in
                the notes field.
              </div>
            ) : null}
          </aside>

          <form
            className="rounded-[32px] border border-[#D8D1C3] bg-white p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)]"
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              {(readOnly || currentStep === 0) && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Briefly describe the lead pastor or executive
                      director&apos;s call to ministry
                    </label>
                    <TextArea
                      maxLength={750}
                      readOnly={readOnly}
                      {...form.register("leader_conversion_narrative")}
                    />
                    <FieldError
                      message={
                        form.formState.errors.leader_conversion_narrative
                          ?.message
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Leader Marital Status
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("leader_marital_status")}
                    >
                      {[
                        "Married and stable",
                        "Single",
                        "Widowed",
                        "Divorced — prior to ministry",
                        "Divorced — during ministry",
                      ].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Leader Accountability
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("leader_accountability")}
                    >
                      {["Yes — formal structure", "Yes — informal", "No"].map(
                        (option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ),
                      )}
                    </SelectInput>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Decision-Making Model
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("decision_making_model")}
                    >
                      {[
                        "Lead pastor unilaterally",
                        "Lead pastor with staff input",
                        "Board approval required",
                        "Congregational vote",
                        "Elder plurality",
                      ].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Is the lead leader&apos;s compensation set by the board
                      without their vote?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("compensation_set_by_board", value)
                      }
                      value={form.watch("compensation_set_by_board")}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Describe any significant leadership conflict in the last 3
                      years and how it was resolved. If none, write
                      &quot;None.&quot;
                    </label>
                    <TextArea
                      maxLength={750}
                      readOnly={readOnly}
                      {...form.register("leadership_conflict_notes")}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Board confrontation willingness:{" "}
                      {form.watch("board_confrontation_willingness")}
                    </label>
                    <SliderInput
                      disabled={readOnly}
                      max={5}
                      min={1}
                      {...form.register("board_confrontation_willingness", {
                        valueAsNumber: true,
                      })}
                    />
                    <div className="flex justify-between text-xs text-[#6B8570]">
                      <span>1 = No mechanism exists</span>
                      <span>5 = Demonstrated history of accountability</span>
                    </div>
                  </div>
                </div>
              )}

              {(readOnly || currentStep === 1) && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Are staff required to affirm your doctrinal statement
                      annually?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("doctrinal_affirmation_required", value)
                      }
                      value={form.watch("doctrinal_affirmation_required")}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      How is the gospel presented in your primary outreach?
                    </label>
                    <TextArea
                      maxLength={500}
                      readOnly={readOnly}
                      {...form.register("gospel_presentation")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Syncretism Practice
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("syncretism_practice")}
                    >
                      {[
                        "Never",
                        "Occasionally for relational purposes",
                        "Yes — as part of our model",
                      ].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Is your ministry&apos;s position on marriage and sexuality
                      publicly stated?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("marriage_sexuality_public", value)
                      }
                      value={form.watch("marriage_sexuality_public")}
                    />
                  </div>
                  {(readOnly || marriageSexualityPublic) && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">
                        Marriage and Sexuality URL
                      </label>
                      <TextInput
                        readOnly={readOnly}
                        {...form.register("marriage_sexuality_url")}
                      />
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Doctrinal clarity self score:{" "}
                      {form.watch("doctrinal_clarity_self_score")}
                    </label>
                    <SliderInput
                      disabled={readOnly}
                      max={5}
                      min={1}
                      {...form.register("doctrinal_clarity_self_score", {
                        valueAsNumber: true,
                      })}
                    />
                    <div className="flex justify-between text-xs text-[#6B8570]">
                      <span>1 = Not addressed publicly</span>
                      <span>5 = Clearly stated everywhere</span>
                    </div>
                  </div>
                </div>
              )}

              {(readOnly || currentStep === 2) && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      How many board members are independent?
                    </label>
                    <TextInput
                      readOnly={readOnly}
                      type="number"
                      {...form.register("independent_board_count", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Board Meeting Frequency
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("board_meeting_frequency")}
                    >
                      {[
                        "Monthly",
                        "Quarterly",
                        "Semi-annually",
                        "Annually",
                        "Irregularly",
                      ].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Conflict of Interest Policy
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("conflict_of_interest_policy", value)
                      }
                      value={form.watch("conflict_of_interest_policy")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Whistleblower Policy
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("whistleblower_policy", value)
                      }
                      value={form.watch("whistleblower_policy")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Does the board conduct a formal annual review of the
                      executive director?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("annual_ed_review", value)
                      }
                      value={form.watch("annual_ed_review")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Are any family members of the lead leader on the board?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("family_on_board", value)
                      }
                      value={form.watch("family_on_board")}
                    />
                  </div>
                  {(readOnly || familyOnBoard) && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">
                        Family on Board Relationship
                      </label>
                      <TextInput
                        readOnly={readOnly}
                        {...form.register("family_on_board_relationship")}
                      />
                    </div>
                  )}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Describe any board member turnover in the last 3 years and
                      the reason. If none, write &quot;None.&quot;
                    </label>
                    <TextArea
                      maxLength={500}
                      readOnly={readOnly}
                      {...form.register("board_turnover_notes")}
                    />
                  </div>
                </div>
              )}

              {(readOnly || currentStep === 3) && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Program Expense Percentage
                    </label>
                    <TextInput
                      readOnly={readOnly}
                      type="number"
                      {...form.register("program_expense_pct", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Overhead Expense Percentage
                    </label>
                    <TextInput
                      readOnly={readOnly}
                      type="number"
                      {...form.register("overhead_expense_pct", {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError
                      message={
                        form.formState.errors.overhead_expense_pct?.message
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Reserve Fund Level
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("reserve_fund_level")}
                    >
                      {[
                        "No reserve fund",
                        "Less than 3 months operating",
                        "3–6 months",
                        "6–12 months",
                        "Over 12 months",
                      ].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Executive Salary Benchmark
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("exec_salary_benchmark")}
                    >
                      {[
                        "Significantly below peer benchmark",
                        "At benchmark",
                        "Above benchmark",
                        "Unknown",
                      ].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Has your organization operated at a deficit in the last 3
                      years?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("recent_deficit", value)
                      }
                      value={form.watch("recent_deficit")}
                    />
                  </div>
                  {(readOnly || recentDeficit) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Deficit Explanation
                      </label>
                      <TextArea
                        maxLength={250}
                        readOnly={readOnly}
                        {...form.register("deficit_explanation")}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Are donor-restricted funds tracked separately?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("restricted_funds_tracked", value)
                      }
                      value={form.watch("restricted_funds_tracked")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Have restricted funds ever been used for another purpose?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("restricted_funds_misused", value)
                      }
                      value={form.watch("restricted_funds_misused")}
                    />
                  </div>
                  {restrictedFundsMisused ? (
                    <div className="rounded-2xl border border-[#D98C8C] bg-[#FFF1F1] px-4 py-3 text-sm text-[#9B2C2C] md:col-span-2">
                      This will be reviewed carefully by our team. Please
                      explain in the notes field.
                    </div>
                  ) : null}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Does your organization accept cryptocurrency or non-cash
                      asset donations?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("crypto_policy", value)
                      }
                      value={form.watch("crypto_policy")}
                    />
                  </div>
                </div>
              )}

              {(readOnly || currentStep === 4) && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Primary Output Count
                    </label>
                    <TextInput
                      readOnly={readOnly}
                      type="number"
                      {...form.register("primary_output_count", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Primary Output Unit
                    </label>
                    <TextInput
                      readOnly={readOnly}
                      {...form.register("primary_output_unit")}
                      placeholder="e.g. people discipled"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Describe your ministry&apos;s theory of change
                    </label>
                    <TextArea
                      maxLength={750}
                      readOnly={readOnly}
                      {...form.register("theory_of_change")}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      How do you measure spiritual transformation?
                    </label>
                    <TextArea
                      maxLength={500}
                      readOnly={readOnly}
                      {...form.register("spiritual_measurement_method")}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Share one story of changed life or community impact
                    </label>
                    <TextArea
                      maxLength={1000}
                      readOnly={readOnly}
                      {...form.register("case_study_1")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Has your ministry been evaluated by an independent third
                      party?
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      onChange={(value) =>
                        form.setValue("third_party_evaluation", value)
                      }
                      value={form.watch("third_party_evaluation")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Fruit self score: {form.watch("fruit_self_score")}
                    </label>
                    <SliderInput
                      disabled={readOnly}
                      max={5}
                      min={1}
                      {...form.register("fruit_self_score", {
                        valueAsNumber: true,
                      })}
                    />
                    <div className="flex justify-between text-xs text-[#6B8570]">
                      <span>1 = Outputs unclear or untracked</span>
                      <span>5 = Documented and externally validated</span>
                    </div>
                  </div>
                </div>
              )}

              {(readOnly || currentStep === 5) && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {REFERENCE_ROWS.map((index) => (
                      <div
                        className="space-y-4 rounded-[24px] border border-[#D8D1C3] bg-[#FFFDF8] p-5"
                        key={index}
                      >
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B8570]">
                          Reference {index}
                        </p>
                        <TextInput
                          readOnly={readOnly}
                          {...form.register(`ref_${index}_name` as const)}
                          placeholder="Name"
                        />
                        <TextInput
                          readOnly={readOnly}
                          {...form.register(`ref_${index}_role` as const)}
                          placeholder="Role"
                        />
                        <TextInput
                          readOnly={readOnly}
                          {...form.register(`ref_${index}_email` as const)}
                          placeholder="Email"
                        />
                        <TextInput
                          readOnly={readOnly}
                          {...form.register(
                            `ref_${index}_relationship` as const,
                          )}
                          placeholder="Relationship"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {PARTNER_ROWS.map((index) => (
                      <div
                        className="space-y-4 rounded-[24px] border border-[#D8D1C3] bg-[#FFFDF8] p-5"
                        key={index}
                      >
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B8570]">
                          Church Partner {index}
                        </p>
                        <TextInput
                          readOnly={readOnly}
                          {...form.register(`partner_${index}_name` as const)}
                          placeholder="Church name"
                        />
                        <TextInput
                          readOnly={readOnly}
                          {...form.register(`partner_${index}_pastor` as const)}
                          placeholder="Pastor name"
                        />
                        <TextInput
                          readOnly={readOnly}
                          {...form.register(
                            `partner_${index}_contact` as const,
                          )}
                          placeholder="Contact"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Has your organization received significant negative
                        press in the last 5 years?
                      </label>
                      <RadioGroup
                        disabled={readOnly}
                        onChange={(value) =>
                          form.setValue("negative_press", value)
                        }
                        value={form.watch("negative_press")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Are you a current member of ECFA or an equivalent
                        accountability body?
                      </label>
                      <RadioGroup
                        disabled={readOnly}
                        onChange={(value) =>
                          form.setValue("ecfa_member", value)
                        }
                        value={form.watch("ecfa_member")}
                      />
                    </div>
                    {(readOnly || negativePress) && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">
                          Negative Press Notes
                        </label>
                        <TextArea
                          readOnly={readOnly}
                          {...form.register("negative_press_notes")}
                        />
                      </div>
                    )}
                    {(readOnly || ecfaMember) && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Which body?
                          </label>
                          <TextInput
                            readOnly={readOnly}
                            {...form.register("ecfa_body")}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Has your membership ever lapsed or been revoked?
                          </label>
                          <RadioGroup
                            disabled={readOnly}
                            onChange={(value) =>
                              form.setValue("ecfa_lapsed", value)
                            }
                            value={form.watch("ecfa_lapsed")}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {(readOnly || currentStep === 6) && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Describe your ministry&apos;s primary strategy in your own
                      words
                    </label>
                    <TextArea
                      maxLength={750}
                      readOnly={readOnly}
                      {...form.register("strategy_description")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Three Year Plan
                    </label>
                    <TextArea
                      maxLength={500}
                      readOnly={readOnly}
                      {...form.register("three_year_plan")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      How would outside funding change your model?
                    </label>
                    <TextArea
                      maxLength={500}
                      readOnly={readOnly}
                      {...form.register("funding_impact")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      What would you stop doing if funding were reduced by 50%?
                    </label>
                    <TextArea
                      maxLength={500}
                      readOnly={readOnly}
                      {...form.register("funding_reduction_response")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Strategic clarity self score:{" "}
                      {form.watch("strategic_clarity_self_score")}
                    </label>
                    <SliderInput
                      disabled={readOnly}
                      max={5}
                      min={1}
                      {...form.register("strategic_clarity_self_score", {
                        valueAsNumber: true,
                      })}
                    />
                    <div className="flex justify-between text-xs text-[#6B8570]">
                      <span>1 = Reactive</span>
                      <span>
                        5 = Written plan, board-approved, reviewed annually
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {(readOnly || currentStep === 7) && (
                <div className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    {vettingDocumentTypes.map((field) =>
                      renderDocumentField(field),
                    )}
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <CheckboxCard
                      checked={form.watch("attestation_complete")}
                      disabled={readOnly}
                      label="All information provided is accurate and complete to the best of my knowledge."
                      onToggle={() =>
                        form.setValue(
                          "attestation_complete",
                          !form.watch("attestation_complete"),
                        )
                      }
                    />
                    <CheckboxCard
                      checked={form.watch("attestation_research")}
                      disabled={readOnly}
                      label="I authorize SAVE to contact the references listed and conduct independent external research."
                      onToggle={() =>
                        form.setValue(
                          "attestation_research",
                          !form.watch("attestation_research"),
                        )
                      }
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Signatory Name
                      </label>
                      <TextInput
                        readOnly={readOnly}
                        {...form.register("signatory_name")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Signatory Title
                      </label>
                      <TextInput
                        readOnly={readOnly}
                        {...form.register("signatory_title")}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Signed At</label>
                      <TextInput readOnly {...form.register("signed_at")} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {globalError ? (
              <p className="mt-6 text-sm text-[#9B2C2C]">{globalError}</p>
            ) : null}

            {!readOnly ? (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E0D3] pt-6">
                <button
                  className="rounded-2xl border border-[#D8D1C3] px-5 py-3 text-sm font-semibold text-[#1B4D35] transition hover:bg-[#F4EFE4]"
                  disabled={currentStep === 0 || isPending}
                  onClick={() =>
                    setCurrentStep((step) => Math.max(step - 1, 0))
                  }
                  type="button"
                >
                  Back
                </button>
                {currentStep < vettingStepTitles.length - 1 ? (
                  <button
                    className="rounded-2xl bg-[#1B4D35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236645] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isPending}
                    onClick={handleNext}
                    type="button"
                  >
                    {isPending ? "Saving..." : "Next"}
                  </button>
                ) : (
                  <button
                    className="rounded-2xl bg-[#1B4D35] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#236645] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending ? "Submitting..." : "Submit Vetting"}
                  </button>
                )}
              </div>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}
