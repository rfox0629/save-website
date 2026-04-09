"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, type FieldPath, type FieldValues } from "react-hook-form";
import { toast } from "sonner";

import { saveInquiryDraft, submitInquiry } from "@/app/actions/inquiry";
import { MinistryNav } from "@/components/portal/ministry-nav";
import {
  ANNUAL_REVENUE_RANGE_OPTIONS,
  AUDIT_LEVEL_OPTIONS,
  BAPTISM_POSITION_OPTIONS,
  BOARD_COMPENSATED_OPTIONS,
  COUNTRY_OPTIONS,
  DENOMINATION_OPTIONS,
  ENTITY_TYPES,
  FILES_990_OPTIONS,
  FUNDING_SOURCE_OPTIONS,
  GEOGRAPHIC_SCOPE_OPTIONS,
  GOSPEL_CLARITY_OPTIONS,
  ORDINATION_STATUS_OPTIONS,
  PRIMARY_FOCUS_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
  SCRIPTURE_POSITION_OPTIONS,
  THEOLOGICAL_EDUCATION_OPTIONS,
  US_STATES,
  inquiryDefaultValues,
  inquiryStepFields,
  inquiryStepSchemas,
  inquiryStepTitles,
  type InquiryFormValues,
} from "@/lib/inquiry";

type InquiryFormProps = {
  applicationId: string | null;
  applicationStatus: string | null;
  initialValues: Partial<InquiryFormValues>;
  readOnly: boolean;
  submittedAt: string | null;
};

function mergeDefaults(
  initialValues: Partial<InquiryFormValues>,
): InquiryFormValues {
  return {
    ...inquiryDefaultValues,
    ...initialValues,
    countries: initialValues.countries ?? inquiryDefaultValues.countries,
    funding_sources:
      initialValues.funding_sources ?? inquiryDefaultValues.funding_sources,
    primary_focus:
      initialValues.primary_focus ?? inquiryDefaultValues.primary_focus,
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

function StepHeader({ currentStep }: { currentStep: number }) {
  const progress = ((currentStep + 1) / inquiryStepTitles.length) * 100;

  return (
    <div className="rounded-[28px] border border-[#D8D1C3] bg-white px-6 py-5 shadow-[0_18px_40px_rgba(27,77,53,0.06)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
          Step {currentStep + 1} of 6. {inquiryStepTitles[currentStep]}
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

function SectionTitle({ body, title }: { body: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
        Current Section
      </p>
      <h1
        className="mt-4 text-4xl leading-tight text-[#1B4D35]"
        style={{ fontFamily: "var(--font-auth-serif)" }}
      >
        {title}
      </h1>
      <p className="mt-4 text-base leading-8 text-[#4F6357]">{body}</p>
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
        Submitted on {new Date(submittedAt).toLocaleDateString()}. This inquiry
        is now read-only while review is completed.
      </p>
    </div>
  );
}

export function InquiryForm({
  applicationId: initialApplicationId,
  initialValues,
  readOnly,
  submittedAt,
}: InquiryFormProps) {
  const [applicationId, setApplicationId] = useState<string | null>(
    initialApplicationId,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<InquiryFormValues>({
    defaultValues: mergeDefaults(initialValues),
  });

  const ordinationStatus = form.watch("ordination_status");
  const doctrinalStatementPublic = form.watch("doctrinal_statement_public");
  const geographicScope = form.watch("geographic_scope");
  const legalAction = form.watch("legal_action");
  const moralFailure = form.watch("moral_failure");
  const financialInvestigation = form.watch("financial_investigation");

  const isDisqualified = Boolean(moralFailure || financialInvestigation);

  const validateStep = async () => {
    const fields = inquiryStepFields[currentStep];
    const values = form.getValues();
    const schema = inquiryStepSchemas[currentStep];
    const stepValues = pickStepValues(values, fields);

    fields.forEach((field) =>
      form.clearErrors(field as FieldPath<InquiryFormValues>),
    );

    const result = schema.safeParse(stepValues);

    if (result.success) {
      return true;
    }

    result.error.issues.forEach((issue) => {
      const path = issue.path[0];

      if (typeof path === "string") {
        form.setError(path as FieldPath<InquiryFormValues>, {
          message: issue.message,
          type: "manual",
        });
      }
    });

    return false;
  };

  const handleNext = () => {
    startTransition(async () => {
      setGlobalError(null);
      const isValid = await validateStep();

      if (!isValid) {
        return;
      }

      const result = await saveInquiryDraft(form.getValues(), applicationId);

      if (result.error) {
        setGlobalError(result.error);
        toast.error(result.error);
        return;
      }

      if (result.applicationId) {
        setApplicationId(result.applicationId);
      }

      toast.success("Inquiry draft saved.");

      setCurrentStep((step) =>
        Math.min(step + 1, inquiryStepTitles.length - 1),
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

      if (values.moral_failure || values.financial_investigation) {
        setGlobalError(
          "Based on your response, this application cannot move forward at this time.",
        );
        return;
      }

      const result = await submitInquiry(values, applicationId);

      if (result.error) {
        setGlobalError(result.error);
        toast.error(result.error);
        return;
      }

      toast.success("Inquiry submitted successfully.");
      setConfirmationVisible(true);
    });
  });

  const introBody = useMemo(() => {
    if (readOnly) {
      return "Your submitted inquiry is shown below for reference. Editing is disabled while review is completed.";
    }

    return "Complete each section carefully. Every move to the next step saves your draft automatically.";
  }, [readOnly]);

  if (confirmationVisible) {
    return (
      <main className="min-h-screen bg-[#F9F6F0] px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <MinistryNav active="inquiry" />
          <div className="mx-auto max-w-3xl rounded-[32px] border border-[#D8D1C3] bg-white px-8 py-12 text-center shadow-[0_25px_80px_rgba(27,77,53,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
              Inquiry Submitted
            </p>
            <h1
              className="mt-6 text-5xl leading-tight text-[#1B4D35]"
              style={{ fontFamily: "var(--font-auth-serif)" }}
            >
              Your inquiry has been submitted.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#4F6357]">
              Review will be completed within 5 business days.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-10 text-[#1B4D35]">
      <div className="mx-auto max-w-6xl space-y-8">
        <MinistryNav active="inquiry" />
        <ReadOnlyBanner submittedAt={submittedAt} />
        {!readOnly ? <StepHeader currentStep={currentStep} /> : null}

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[32px] border border-[#D8D1C3] bg-[linear-gradient(135deg,#FFFDF8_0%,#F4EFE4_100%)] p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)]">
            <SectionTitle
              body={introBody}
              title={
                readOnly ? "Inquiry Submitted" : inquiryStepTitles[currentStep]
              }
            />

            <div className="mt-8 rounded-[24px] border border-[#D8D1C3] bg-white p-5 text-sm leading-7 text-[#4F6357]">
              <p className="font-semibold uppercase tracking-[0.25em] text-[#6B8570]">
                Review Notes
              </p>
              <p className="mt-3">
                SAVE reviews ministry leadership, theology, governance, and
                stewardship before advancing an application.
              </p>

              {legalAction ? (
                <div className="mt-4 rounded-2xl border border-[#D8A85A] bg-[#FFF4DD] px-4 py-3 text-[#7B5B19]">
                  This will be reviewed by our team.
                </div>
              ) : null}

              {isDisqualified ? (
                <div className="mt-4 rounded-2xl border border-[#D98C8C] bg-[#FFF1F1] px-4 py-3 text-[#9B2C2C]">
                  Based on your response, this application cannot move forward
                  at this time.
                </div>
              ) : null}
            </div>
          </aside>

          <form
            className="rounded-[32px] border border-[#D8D1C3] bg-white p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)]"
            onSubmit={handleSubmit}
          >
            <div className="space-y-6">
              {(readOnly || currentStep === 0) && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Legal Name</label>
                      <TextInput readOnly {...form.register("legal_name")} />
                      <FieldError
                        message={form.formState.errors.legal_name?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">DBA Name</label>
                      <TextInput
                        readOnly={readOnly}
                        {...form.register("dba_name")}
                        placeholder="Optional"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">EIN</label>
                      <TextInput readOnly {...form.register("ein")} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Year Founded
                      </label>
                      <TextInput
                        readOnly={readOnly}
                        type="number"
                        {...form.register("year_founded", {
                          valueAsNumber: true,
                        })}
                      />
                      <FieldError
                        message={form.formState.errors.year_founded?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        State of Incorporation
                      </label>
                      <SelectInput
                        disabled={readOnly}
                        {...form.register("state_of_incorporation")}
                      >
                        {US_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </SelectInput>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Entity Type</label>
                      <SelectInput
                        disabled={readOnly}
                        {...form.register("entity_type")}
                      >
                        {ENTITY_TYPES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Geographic Scope
                      </label>
                      <SelectInput
                        disabled={readOnly}
                        {...form.register("geographic_scope")}
                      >
                        {GEOGRAPHIC_SCOPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Website URL</label>
                      <TextInput
                        readOnly={readOnly}
                        {...form.register("website_url")}
                        placeholder="https://example.org"
                      />
                      <FieldError
                        message={form.formState.errors.website_url?.message}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Primary Focus</label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {PRIMARY_FOCUS_OPTIONS.map((option) => {
                        const current = form.watch("primary_focus");
                        const checked = current.includes(option);

                        return (
                          <CheckboxCard
                            checked={checked}
                            disabled={readOnly}
                            key={option}
                            label={option}
                            onToggle={() => {
                              if (readOnly) return;
                              form.setValue(
                                "primary_focus",
                                checked
                                  ? current.filter((value) => value !== option)
                                  : [...current, option],
                              );
                            }}
                          />
                        );
                      })}
                    </div>
                    <FieldError
                      message={
                        form.formState.errors.primary_focus?.message as string
                      }
                    />
                  </div>

                  {(readOnly ||
                    geographicScope === "International" ||
                    geographicScope === "Multi-national") && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Countries</label>
                      <div className="grid gap-3 md:grid-cols-2">
                        {(
                          [
                            "United States",
                            "Canada",
                            "United Kingdom",
                            "Kenya",
                            "Nigeria",
                            "India",
                            "Philippines",
                            "Brazil",
                          ] as Array<(typeof COUNTRY_OPTIONS)[number]>
                        ).map((country) => {
                          const current = form.watch("countries");
                          const checked = current.includes(country);

                          return (
                            <CheckboxCard
                              checked={checked}
                              disabled={readOnly}
                              key={country}
                              label={country}
                              onToggle={() => {
                                if (readOnly) return;
                                form.setValue(
                                  "countries",
                                  checked
                                    ? current.filter(
                                        (value) => value !== country,
                                      )
                                    : [...current, country],
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                      <FieldError
                        message={
                          form.formState.errors.countries?.message as string
                        }
                      />
                    </div>
                  )}
                </>
              )}

              {(readOnly || currentStep === 1) && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lead Name</label>
                      <TextInput
                        readOnly={readOnly}
                        {...form.register("lead_name")}
                      />
                      <FieldError
                        message={form.formState.errors.lead_name?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Years in Role
                      </label>
                      <TextInput
                        readOnly={readOnly}
                        type="number"
                        {...form.register("years_in_role", {
                          valueAsNumber: true,
                        })}
                      />
                      <FieldError
                        message={form.formState.errors.years_in_role?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Theological Education
                      </label>
                      <SelectInput
                        disabled={readOnly}
                        {...form.register("theological_education")}
                      >
                        {THEOLOGICAL_EDUCATION_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Ordination Status
                      </label>
                      <SelectInput
                        disabled={readOnly}
                        {...form.register("ordination_status")}
                      >
                        {ORDINATION_STATUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </div>
                    {(readOnly || ordinationStatus === "Ordained") && (
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">
                          Ordaining Body
                        </label>
                        <TextInput
                          readOnly={readOnly}
                          {...form.register("ordaining_body")}
                        />
                        <FieldError
                          message={
                            form.formState.errors.ordaining_body?.message
                          }
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Board Size</label>
                      <TextInput
                        readOnly={readOnly}
                        type="number"
                        {...form.register("board_size", {
                          valueAsNumber: true,
                        })}
                      />
                      <FieldError
                        message={form.formState.errors.board_size?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Board Compensation
                      </label>
                      <SelectInput
                        disabled={readOnly}
                        {...form.register("board_compensated")}
                      >
                        {BOARD_COMPENSATED_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </div>
                  </div>
                </>
              )}

              {(readOnly || currentStep === 2) && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Denomination</label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("denomination")}
                    >
                      {DENOMINATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Doctrinal Statement Public
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      labels={["No", "Yes"]}
                      onChange={(value) =>
                        form.setValue("doctrinal_statement_public", value)
                      }
                      value={form.watch("doctrinal_statement_public")}
                    />
                  </div>
                  {(readOnly || doctrinalStatementPublic) && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">
                        Doctrinal Statement URL
                      </label>
                      <TextInput
                        readOnly={readOnly}
                        {...form.register("doctrinal_statement_url")}
                        placeholder="https://example.org/statement-of-faith"
                      />
                      <FieldError
                        message={
                          form.formState.errors.doctrinal_statement_url?.message
                        }
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Scripture Position
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("scripture_position")}
                    >
                      {SCRIPTURE_POSITION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Gospel Clarity
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("gospel_clarity")}
                    >
                      {GOSPEL_CLARITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Baptism Position
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("baptism_position")}
                    >
                      {BAPTISM_POSITION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                </div>
              )}

              {(readOnly || currentStep === 3) && (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Annual Revenue Range
                      </label>
                      <SelectInput
                        disabled={readOnly}
                        {...form.register("annual_revenue_range")}
                      >
                        {ANNUAL_REVENUE_RANGE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Files 990</label>
                      <SelectInput
                        disabled={readOnly}
                        {...form.register("files_990")}
                      >
                        {FILES_990_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Audit Level</label>
                      <SelectInput
                        disabled={readOnly}
                        {...form.register("audit_level")}
                      >
                        {AUDIT_LEVEL_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectInput>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Board Approved Budget
                      </label>
                      <RadioGroup
                        disabled={readOnly}
                        labels={["No", "Yes"]}
                        onChange={(value) =>
                          form.setValue("board_approved_budget", value)
                        }
                        value={form.watch("board_approved_budget")}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Funding Sources
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {FUNDING_SOURCE_OPTIONS.map((option) => {
                        const current = form.watch("funding_sources");
                        const checked = current.includes(option);

                        return (
                          <CheckboxCard
                            checked={checked}
                            disabled={readOnly}
                            key={option}
                            label={option}
                            onToggle={() => {
                              if (readOnly) return;
                              form.setValue(
                                "funding_sources",
                                checked
                                  ? current.filter((value) => value !== option)
                                  : [...current, option],
                              );
                            }}
                          />
                        );
                      })}
                    </div>
                    <FieldError
                      message={
                        form.formState.errors.funding_sources?.message as string
                      }
                    />
                  </div>
                </>
              )}

              {(readOnly || currentStep === 4) && (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Annual Reach</label>
                    <TextInput
                      readOnly={readOnly}
                      type="number"
                      {...form.register("annual_reach", {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError
                      message={form.formState.errors.annual_reach?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Has References
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      labels={["No", "Yes"]}
                      onChange={(value) =>
                        form.setValue("has_references", value)
                      }
                      value={form.watch("has_references")}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Key Metric</label>
                    <TextInput
                      maxLength={150}
                      readOnly={readOnly}
                      {...form.register("key_metric")}
                      placeholder="e.g. 320 people discipled annually"
                    />
                    <FieldError
                      message={form.formState.errors.key_metric?.message}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">
                      Media Presence URL
                    </label>
                    <TextInput
                      readOnly={readOnly}
                      {...form.register("media_presence_url")}
                      placeholder="https://example.org/media"
                    />
                    <FieldError
                      message={
                        form.formState.errors.media_presence_url?.message
                      }
                    />
                  </div>
                </div>
              )}

              {(readOnly || currentStep === 5) && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Legal Action</label>
                    <RadioGroup
                      disabled={readOnly}
                      labels={["No", "Yes"]}
                      onChange={(value) => form.setValue("legal_action", value)}
                      value={form.watch("legal_action")}
                    />
                  </div>

                  {legalAction ? (
                    <div className="rounded-2xl border border-[#D8A85A] bg-[#FFF4DD] px-4 py-3 text-sm text-[#7B5B19]">
                      This will be reviewed by our team.
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Moral Failure</label>
                    <RadioGroup
                      disabled={readOnly}
                      labels={["No", "Yes"]}
                      onChange={(value) =>
                        form.setValue("moral_failure", value)
                      }
                      value={form.watch("moral_failure")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Financial Investigation
                    </label>
                    <RadioGroup
                      disabled={readOnly}
                      labels={["No", "Yes"]}
                      onChange={(value) =>
                        form.setValue("financial_investigation", value)
                      }
                      value={form.watch("financial_investigation")}
                    />
                  </div>

                  {isDisqualified ? (
                    <div className="rounded-2xl border border-[#D98C8C] bg-[#FFF1F1] px-4 py-3 text-sm text-[#9B2C2C]">
                      Based on your response, this application cannot move
                      forward at this time.
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Why are you seeking outside funding at this time?
                    </label>
                    <TextArea
                      maxLength={500}
                      readOnly={readOnly}
                      {...form.register("funding_rationale")}
                    />
                    <FieldError
                      message={form.formState.errors.funding_rationale?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Referral Source
                    </label>
                    <SelectInput
                      disabled={readOnly}
                      {...form.register("referral_source")}
                    >
                      {REFERRAL_SOURCE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectInput>
                  </div>

                  <div className="space-y-3">
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
                    <FieldError
                      message={
                        form.formState.errors.attestation_complete?.message
                      }
                    />

                    <CheckboxCard
                      checked={form.watch("attestation_research")}
                      disabled={readOnly}
                      label="I understand that SAVE will contact references and conduct independent research."
                      onToggle={() =>
                        form.setValue(
                          "attestation_research",
                          !form.watch("attestation_research"),
                        )
                      }
                    />
                    <FieldError
                      message={
                        form.formState.errors.attestation_research?.message
                      }
                    />
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

                {currentStep < inquiryStepTitles.length - 1 ? (
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
                    disabled={isPending || isDisqualified}
                    type="submit"
                  >
                    {isPending ? "Submitting..." : "Submit Inquiry"}
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
