"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState, useTransition, type ChangeEvent } from "react";
import { useForm, type Resolver } from "react-hook-form";

import { createClient } from "@/lib/supabase/client";
import {
  type VettingDocumentType,
  vettingDefaultValues,
  vettingFormSchema,
  vettingStepFields,
  vettingStepTitles,
  type VettingFormValues,
} from "@/lib/vetting";
import { saveVettingDraft, submitVetting } from "@/app/actions/vetting";

type UploadedDoc = {
  fileName: string;
  storagePath: string;
};

type VettingFormProps = {
  applicationId: string;
  initialValues: Partial<VettingFormValues>;
  uploadedDocuments: Partial<Record<string, UploadedDoc>>;
};

type FileState = Partial<Record<VettingDocumentType, File | null>>;

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

  return <p className="text-sm text-red-300">{message}</p>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30 ${props.className ?? ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-[#112131] px-4 py-3 text-white outline-none transition focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30 ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-32 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30 ${props.className ?? ""}`}
    />
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
      {[false, true].map((option) => (
        <button
          key={String(option)}
          className={`rounded-[1rem] px-4 py-2 text-sm font-medium transition ${
            value === option
              ? "bg-[#C09A45] text-[#0B1622]"
              : "text-slate-300 hover:bg-white/5"
          }`}
          onClick={() => onChange(option)}
          type="button"
        >
          {option ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep + 1) / vettingStepTitles.length) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <p className="uppercase tracking-[0.35em] text-[#C09A45]">
          Deep Vetting
        </p>
        <p>
          Step {currentStep + 1} of {vettingStepTitles.length}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#C09A45] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
        {vettingStepTitles.map((title, index) => (
          <div
            key={title}
            className={`rounded-2xl border px-3 py-3 text-xs ${
              index === currentStep
                ? "border-[#C09A45]/60 bg-[#C09A45]/10 text-[#F1D9A1]"
                : index < currentStep
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-white/10 bg-white/[0.03] text-slate-400"
            }`}
          >
            <p className="font-semibold uppercase tracking-[0.2em]">
              {index + 1}
            </p>
            <p className="mt-2 tracking-normal">{title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const documentFieldConfig: Record<
  VettingDocumentType,
  { label: string; documentType: VettingDocumentType }
> = {
  audit: { documentType: "audit", label: "Audit upload" },
  board_minutes: {
    documentType: "board_minutes",
    label: "Board minutes upload",
  },
  budget: { documentType: "budget", label: "Budget upload" },
  bylaws: { documentType: "bylaws", label: "Bylaws upload" },
  doctrinal_statement: {
    documentType: "doctrinal_statement",
    label: "Doctrinal statement file",
  },
  form_990: { documentType: "form_990", label: "Form 990 upload" },
  third_party_evaluation: {
    documentType: "third_party_evaluation",
    label: "Third-party evaluation upload",
  },
};

const stepDocumentFields: Record<number, VettingDocumentType[]> = {
  1: ["doctrinal_statement"],
  2: ["bylaws", "board_minutes"],
  3: ["form_990", "audit", "budget"],
  4: ["third_party_evaluation"],
};

const referenceFieldSets = [
  {
    email: "reference_1_email",
    name: "reference_1_name",
    relationship: "reference_1_relationship",
    role: "reference_1_role",
    title: "Reference 1",
  },
  {
    email: "reference_2_email",
    name: "reference_2_name",
    relationship: "reference_2_relationship",
    role: "reference_2_role",
    title: "Reference 2",
  },
  {
    email: "reference_3_email",
    name: "reference_3_name",
    relationship: "reference_3_relationship",
    role: "reference_3_role",
    title: "Reference 3",
  },
] as const;

const partnerFieldSets = [
  {
    contact: "church_partner_1_contact",
    name: "church_partner_1_name",
    pastor: "church_partner_1_pastor",
    title: "Church partner 1",
  },
  {
    contact: "church_partner_2_contact",
    name: "church_partner_2_name",
    pastor: "church_partner_2_pastor",
    title: "Church partner 2",
  },
] as const;

function sanitizeFilename(fileName: string) {
  return fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

export function VettingForm({
  applicationId,
  initialValues,
  uploadedDocuments: initialDocuments,
}: VettingFormProps) {
  const supabase = useMemo(() => createClient(), []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState(initialDocuments);
  const [pendingFiles, setPendingFiles] = useState<FileState>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<VettingFormValues>({
    defaultValues: mergeDefaults(initialValues),
    resolver: zodResolver(vettingFormSchema) as Resolver<VettingFormValues>,
  });

  const restrictedFundsMisused = form.watch("restricted_funds_misused");
  const marriageSexualityPublic = form.watch("marriage_sexuality_public");
  const familyOnBoard = form.watch("family_on_board");
  const recentDeficit = form.watch("recent_deficit");
  const cryptoPolicy = form.watch("crypto_policy");
  const negativePress = form.watch("negative_press");
  const ecfaMember = form.watch("ecfa_member");
  const thirdPartyEvaluation = form.watch("third_party_evaluation");

  const disqualified = restrictedFundsMisused;

  const stepFields = vettingStepFields[currentStep];

  const updatePendingFile =
    (field: VettingDocumentType) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setPendingFiles((current) => ({
        ...current,
        [field]: file,
      }));
    };

  const uploadStepFiles = async () => {
    const fields = stepDocumentFields[currentStep] ?? [];

    for (const field of fields) {
      const file = pendingFiles[field];

      if (!file) {
        continue;
      }

      const safeName = sanitizeFilename(file.name);
      const storagePath = `${applicationId}/${field}/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("ministry-documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { error: documentError } = await db.from("documents").insert({
        application_id: applicationId,
        document_type: field,
        file_name: safeName,
        file_size_bytes: file.size,
        reviewed: false,
        storage_path: storagePath,
      });

      if (documentError) {
        throw new Error(documentError.message);
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

  const saveCurrentStep = async () => {
    const isValid = await form.trigger(stepFields);

    if (!isValid) {
      return false;
    }

    try {
      await uploadStepFiles();
    } catch (error) {
      setGlobalError(
        error instanceof Error
          ? error.message
          : "We could not upload one of the files.",
      );
      return false;
    }

    const result = await saveVettingDraft(form.getValues());

    if (result.error) {
      setGlobalError(result.error);
      return false;
    }

    setGlobalError(null);
    return true;
  };

  const handleNext = () => {
    startTransition(async () => {
      const success = await saveCurrentStep();

      if (success) {
        setCurrentStep((step) =>
          Math.min(step + 1, vettingStepTitles.length - 1),
        );
      }
    });
  };

  const handlePrevious = () => {
    setGlobalError(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        await uploadStepFiles();
      } catch (error) {
        setGlobalError(
          error instanceof Error
            ? error.message
            : "We could not upload one of the files.",
        );
        return;
      }

      const result = await submitVetting(values);

      if (result.error) {
        setGlobalError(result.error);
        return;
      }

      setGlobalError(null);
      setConfirmationVisible(true);
    });
  });

  if (confirmationVisible) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden bg-[#0B1622] px-6 py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(192,154,69,0.12),_transparent_35%),linear-gradient(180deg,_rgba(17,28,43,0.92),_#0B1622)]" />
        <div className="relative mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 px-8 py-14 text-center shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.35em] text-[#C09A45]">
            Vetting Submitted
          </p>
          <h1 className="mt-6 text-4xl font-semibold">
            Your deep vetting materials are now in review.
          </h1>
          <p className="mt-4 text-slate-300">
            We saved your responses, marked the application as vetting
            submitted, and triggered the scoring route for downstream review
            workflows.
          </p>
        </div>
      </main>
    );
  }

  const renderDocumentField = (field: VettingDocumentType) => {
    const existing = uploadedDocuments[field];
    const pending = pendingFiles[field];

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">
          {documentFieldConfig[field].label}
        </label>
        <Input onChange={updatePendingFile(field)} type="file" />
        {pending ? (
          <p className="text-xs text-[#F1D9A1]">Selected: {pending.name}</p>
        ) : null}
        {existing ? (
          <p className="text-xs text-emerald-200">
            Uploaded: {existing.fileName}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#0B1622] px-6 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(192,154,69,0.15),_transparent_32%),linear-gradient(180deg,_rgba(13,26,41,0.96),_#0B1622)]" />
      <div className="relative mx-auto max-w-6xl">
        <Stepper currentStep={currentStep} />

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#C09A45]">
              Current Section
            </p>
            <h1 className="mt-4 text-3xl font-semibold">
              {vettingStepTitles[currentStep]}
            </h1>
            <p className="mt-4 leading-7 text-slate-300">
              Each Next button validates the current section, uploads any files
              attached to this step, and saves your draft to Supabase.
            </p>

            {disqualified ? (
              <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                This submission is blocked because restricted funds were
                reported as misused.
              </div>
            ) : null}
          </aside>

          <form
            className="space-y-6 rounded-[2rem] border border-white/10 bg-[#0D1A29]/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
            onSubmit={handleSubmit}
          >
            {currentStep === 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Leader conversion narrative
                  </label>
                  <Textarea
                    {...form.register("leader_conversion_narrative")}
                    maxLength={750}
                  />
                  <FieldError
                    message={
                      form.formState.errors.leader_conversion_narrative?.message
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Leader marital status
                  </label>
                  <Select {...form.register("leader_marital_status")}>
                    {[
                      "Married and stable",
                      "Single",
                      "Widowed",
                      "Divorced prior to ministry",
                      "Divorced during ministry",
                    ].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Leader accountability
                  </label>
                  <Select {...form.register("leader_accountability")}>
                    {["Yes formal", "Yes informal", "No"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Decision-making model
                  </label>
                  <Select {...form.register("decision_making_model")}>
                    {[
                      "Lead pastor unilaterally",
                      "Lead pastor with staff",
                      "Board approval required",
                      "Congregational vote",
                      "Elder plurality",
                    ].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Compensation set by board
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("compensation_set_by_board", value, {
                        shouldDirty: true,
                      })
                    }
                    value={form.watch("compensation_set_by_board")}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Leadership conflict notes
                  </label>
                  <Textarea
                    {...form.register("leadership_conflict_notes")}
                    maxLength={750}
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Board confrontation willingness
                  </label>
                  <input
                    {...form.register("board_confrontation_willingness", {
                      valueAsNumber: true,
                    })}
                    className="w-full accent-[#C09A45]"
                    max={5}
                    min={1}
                    type="range"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>1 = No mechanism</span>
                    <span>5 = Demonstrated history</span>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  {renderDocumentField("doctrinal_statement")}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Doctrinal statement paste
                  </label>
                  <Textarea
                    {...form.register("doctrinal_statement_text")}
                    maxLength={1500}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Staff doctrinal affirmation
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("staff_doctrinal_affirmation", value, {
                        shouldDirty: true,
                      })
                    }
                    value={form.watch("staff_doctrinal_affirmation")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Syncretism practice
                  </label>
                  <Select {...form.register("syncretism_practice")}>
                    {[
                      "Never",
                      "Occasionally for relational purposes",
                      "Yes as part of our model",
                    ].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Gospel presentation
                  </label>
                  <Textarea
                    {...form.register("gospel_presentation")}
                    maxLength={500}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Marriage and sexuality statement public?
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("marriage_sexuality_public", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    value={marriageSexualityPublic}
                  />
                </div>
                {marriageSexualityPublic ? (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Public URL
                    </label>
                    <Input {...form.register("marriage_sexuality_url")} />
                    <FieldError
                      message={
                        form.formState.errors.marriage_sexuality_url?.message
                      }
                    />
                  </div>
                ) : null}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Doctrinal conflict handling
                  </label>
                  <Textarea
                    {...form.register("doctrinal_conflict_handling")}
                    maxLength={500}
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Doctrinal clarity self score
                  </label>
                  <input
                    {...form.register("doctrinal_clarity_self_score", {
                      valueAsNumber: true,
                    })}
                    className="w-full accent-[#C09A45]"
                    max={5}
                    min={1}
                    type="range"
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">{renderDocumentField("bylaws")}</div>
                <div className="space-y-2">
                  {renderDocumentField("board_minutes")}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Independent board count
                  </label>
                  <Input
                    type="number"
                    {...form.register("independent_board_count", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Board meeting frequency
                  </label>
                  <Select {...form.register("board_meeting_frequency")}>
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
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Conflict of interest policy
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("conflict_of_interest_policy", value, {
                        shouldDirty: true,
                      })
                    }
                    value={form.watch("conflict_of_interest_policy")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Whistleblower policy
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("whistleblower_policy", value, {
                        shouldDirty: true,
                      })
                    }
                    value={form.watch("whistleblower_policy")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Annual ED review
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("annual_ed_review", value, {
                        shouldDirty: true,
                      })
                    }
                    value={form.watch("annual_ed_review")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Family on board
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("family_on_board", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    value={familyOnBoard}
                  />
                </div>
                {familyOnBoard ? (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Relationship
                    </label>
                    <Input {...form.register("family_on_board_relationship")} />
                    <FieldError
                      message={
                        form.formState.errors.family_on_board_relationship
                          ?.message
                      }
                    />
                  </div>
                ) : null}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Board turnover notes
                  </label>
                  <Textarea
                    {...form.register("board_turnover_notes")}
                    maxLength={500}
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  {renderDocumentField("form_990")}
                </div>
                <div className="space-y-2">{renderDocumentField("audit")}</div>
                <div className="space-y-2 md:col-span-2">
                  {renderDocumentField("budget")}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Program expense %
                  </label>
                  <Input
                    type="number"
                    {...form.register("program_expense_pct", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Overhead expense %
                  </label>
                  <Input
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
                  <label className="text-sm font-medium text-slate-200">
                    Reserve fund level
                  </label>
                  <Select {...form.register("reserve_fund_level")}>
                    {[
                      "No reserve",
                      "Less than 3 months",
                      "3–6 months",
                      "6–12 months",
                      "Over 12 months",
                    ].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Exec salary benchmark
                  </label>
                  <Select {...form.register("exec_salary_benchmark")}>
                    {[
                      "Significantly below",
                      "At benchmark",
                      "Above benchmark",
                      "Unknown",
                    ].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Recent deficit
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("recent_deficit", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    value={recentDeficit}
                  />
                </div>
                {recentDeficit ? (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Deficit explanation
                    </label>
                    <Textarea
                      {...form.register("recent_deficit_explanation")}
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Restricted funds tracked
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("restricted_funds_tracked", value, {
                        shouldDirty: true,
                      })
                    }
                    value={form.watch("restricted_funds_tracked")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Restricted funds misused
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("restricted_funds_misused", value, {
                        shouldDirty: true,
                      })
                    }
                    value={restrictedFundsMisused}
                  />
                </div>
                {restrictedFundsMisused ? (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 md:col-span-2">
                    This is a hard stop. The application cannot be submitted
                    while restricted funds misuse is marked yes.
                  </div>
                ) : null}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Crypto policy
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("crypto_policy", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    value={cryptoPolicy}
                  />
                </div>
                {cryptoPolicy ? (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Describe crypto policy
                    </label>
                    <Textarea {...form.register("crypto_policy_description")} />
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentStep === 4 ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Primary output count
                  </label>
                  <Input
                    type="number"
                    {...form.register("primary_output_count", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Primary output unit
                  </label>
                  <Input {...form.register("primary_output_unit")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Theory of change
                  </label>
                  <Textarea
                    {...form.register("theory_of_change")}
                    maxLength={750}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Spiritual measurement method
                  </label>
                  <Textarea
                    {...form.register("spiritual_measurement_method")}
                    maxLength={500}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Case study 1
                  </label>
                  <Textarea
                    {...form.register("case_study_1")}
                    maxLength={1000}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Case study 2
                  </label>
                  <Textarea
                    {...form.register("case_study_2")}
                    maxLength={1000}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Third-party evaluation
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("third_party_evaluation", value, {
                        shouldDirty: true,
                      })
                    }
                    value={thirdPartyEvaluation}
                  />
                </div>
                {thirdPartyEvaluation ? (
                  <div className="space-y-2 md:col-span-2">
                    {renderDocumentField("third_party_evaluation")}
                  </div>
                ) : null}
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm font-medium text-slate-200">
                    Fruit self score
                  </label>
                  <input
                    {...form.register("fruit_self_score", {
                      valueAsNumber: true,
                    })}
                    className="w-full accent-[#C09A45]"
                    max={5}
                    min={1}
                    type="range"
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 5 ? (
              <div className="space-y-6">
                {referenceFieldSets.map((reference) => (
                  <div
                    key={reference.title}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2"
                  >
                    <p className="text-sm font-medium text-[#F1D9A1] md:col-span-2">
                      {reference.title}
                    </p>
                    <Input
                      placeholder="Name"
                      {...form.register(reference.name)}
                    />
                    <Input
                      placeholder="Role"
                      {...form.register(reference.role)}
                    />
                    <Input
                      placeholder="Email"
                      {...form.register(reference.email)}
                    />
                    <Input
                      placeholder="Relationship"
                      {...form.register(reference.relationship)}
                    />
                  </div>
                ))}

                {partnerFieldSets.map((partner) => (
                  <div
                    key={partner.title}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-3"
                  >
                    <p className="text-sm font-medium text-[#F1D9A1] md:col-span-3">
                      {partner.title}
                    </p>
                    <Input
                      placeholder="Partner name"
                      {...form.register(partner.name)}
                    />
                    <Input
                      placeholder="Partner pastor"
                      {...form.register(partner.pastor)}
                    />
                    <Input
                      placeholder="Partner contact"
                      {...form.register(partner.contact)}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Negative press
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("negative_press", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    value={negativePress}
                  />
                </div>
                {negativePress ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Textarea
                      className="md:col-span-2"
                      placeholder="Describe the negative press"
                      {...form.register("negative_press_description")}
                    />
                    <Input
                      className="md:col-span-2"
                      placeholder="URL"
                      {...form.register("negative_press_url")}
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    ECFA member
                  </label>
                  <Toggle
                    onChange={(value) =>
                      form.setValue("ecfa_member", value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    value={ecfaMember}
                  />
                </div>
                {ecfaMember ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      placeholder="Which body?"
                      {...form.register("ecfa_body")}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        ECFA lapsed
                      </label>
                      <Toggle
                        onChange={(value) =>
                          form.setValue("ecfa_lapsed", value, {
                            shouldDirty: true,
                          })
                        }
                        value={form.watch("ecfa_lapsed")}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {currentStep === 6 ? (
              <div className="space-y-5">
                <Textarea
                  maxLength={750}
                  placeholder="Strategy description"
                  {...form.register("strategy_description")}
                />
                <Textarea
                  maxLength={500}
                  placeholder="Three-year plan"
                  {...form.register("three_year_plan")}
                />
                <Textarea
                  maxLength={500}
                  placeholder="Funding impact"
                  {...form.register("funding_impact")}
                />
                <Textarea
                  maxLength={500}
                  placeholder="Funding reduction response"
                  {...form.register("funding_reduction_response")}
                />
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-200">
                    Strategic clarity self score
                  </label>
                  <input
                    {...form.register("strategic_clarity_self_score", {
                      valueAsNumber: true,
                    })}
                    className="w-full accent-[#C09A45]"
                    max={5}
                    min={1}
                    type="range"
                  />
                </div>
              </div>
            ) : null}

            {currentStep === 7 ? (
              <div className="space-y-5">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input
                    className="size-4 accent-[#C09A45]"
                    type="checkbox"
                    checked={form.watch("attestation_truthful")}
                    onChange={(event) =>
                      form.setValue(
                        "attestation_truthful",
                        event.target.checked,
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        },
                      )
                    }
                  />
                  I attest that the information provided is accurate.
                </label>
                <FieldError
                  message={form.formState.errors.attestation_truthful?.message}
                />
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <input
                    className="size-4 accent-[#C09A45]"
                    type="checkbox"
                    checked={form.watch("attestation_authorized")}
                    onChange={(event) =>
                      form.setValue(
                        "attestation_authorized",
                        event.target.checked,
                        {
                          shouldDirty: true,
                          shouldValidate: true,
                        },
                      )
                    }
                  />
                  I am authorized to submit this vetting form on behalf of the
                  ministry.
                </label>
                <FieldError
                  message={
                    form.formState.errors.attestation_authorized?.message
                  }
                />
                <Input
                  placeholder="Signatory name"
                  {...form.register("signatory_name")}
                />
                <FieldError
                  message={form.formState.errors.signatory_name?.message}
                />
                <Input
                  placeholder="Signatory title"
                  {...form.register("signatory_title")}
                />
                <FieldError
                  message={form.formState.errors.signatory_title?.message}
                />
                <Input type="date" {...form.register("signed_at")} />
              </div>
            ) : null}

            {globalError ? (
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {globalError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentStep === 0 || isPending}
                onClick={handlePrevious}
                type="button"
              >
                Previous
              </button>
              {currentStep < vettingStepTitles.length - 1 ? (
                <button
                  className="rounded-2xl bg-[#C09A45] px-5 py-3 text-sm font-semibold text-[#0B1622] transition hover:bg-[#d7b35c] disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isPending}
                  onClick={handleNext}
                  type="button"
                >
                  {isPending ? "Saving..." : "Save and continue"}
                </button>
              ) : (
                <button
                  className="rounded-2xl bg-[#C09A45] px-5 py-3 text-sm font-semibold text-[#0B1622] transition hover:bg-[#d7b35c] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isPending || disqualified}
                  type="submit"
                >
                  {isPending ? "Submitting..." : "Submit vetting"}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
