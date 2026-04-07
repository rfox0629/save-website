"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
  inquiryFormSchema,
  inquiryStepFields,
  inquiryStepTitles,
  type InquiryFormValues,
} from "@/lib/inquiry";
import { saveInquiryDraft, submitInquiry } from "@/app/actions/inquiry";

type InquiryFormProps = {
  applicationId: string | null;
  initialValues: Partial<InquiryFormValues>;
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

  return <p className="text-sm text-red-300">{message}</p>;
}

function InputField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30 ${props.className ?? ""}`}
    />
  );
}

function SelectField(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-[#112131] px-4 py-3 text-white outline-none transition focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30 ${props.className ?? ""}`}
    />
  );
}

function StepHeader({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <p className="uppercase tracking-[0.35em] text-[#C09A45]">
          Inquiry Portal
        </p>
        <p>
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#C09A45] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid gap-2 md:grid-cols-6">
        {inquiryStepTitles.map((title, index) => (
          <div
            key={title}
            className={`rounded-2xl border px-3 py-3 text-xs transition ${
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
            <p className="mt-2 normal-case tracking-normal">{title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckboxCard({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-[#C09A45]/40">
      <input
        checked={checked}
        className="size-4 accent-[#C09A45]"
        onChange={onChange}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}

function BooleanToggle({
  value,
  onChange,
  labels = ["No", "Yes"],
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  labels?: [string, string];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
      {[false, true].map((option, index) => (
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
          {labels[index]}
        </button>
      ))}
    </div>
  );
}

export function InquiryForm({
  applicationId: initialApplicationId,
  initialValues,
}: InquiryFormProps) {
  const [applicationId, setApplicationId] = useState<string | null>(
    initialApplicationId,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [isSaving, startSavingTransition] = useTransition();

  const form = useForm<InquiryFormValues>({
    defaultValues: mergeDefaults(initialValues),
    resolver: zodResolver(inquiryFormSchema) as Resolver<InquiryFormValues>,
  });

  const geographicScope = form.watch("geographic_scope");
  const ordinationStatus = form.watch("ordination_status");
  const doctrinalStatementPublic = form.watch("doctrinal_statement_public");
  const moralFailure = form.watch("moral_failure");
  const financialInvestigation = form.watch("financial_investigation");
  const legalAction = form.watch("legal_action");

  const disqualified = moralFailure || financialInvestigation;

  const stepTitle = inquiryStepTitles[currentStep];
  const stepFields = inquiryStepFields[currentStep];

  const completionCopy = useMemo(() => {
    if (disqualified) {
      return "This inquiry cannot be submitted because one of the discernment responses triggers an automatic disqualification.";
    }

    return "Review your details and submit your inquiry when you're ready.";
  }, [disqualified]);

  const saveCurrentStep = async () => {
    const isValid = await form.trigger(stepFields);

    if (!isValid) {
      return false;
    }

    const values = form.getValues();
    const result = await saveInquiryDraft(values, applicationId);

    if (result.error) {
      setGlobalError(result.error);
      return false;
    }

    if (result.applicationId) {
      setApplicationId(result.applicationId);
    }

    setGlobalError(null);
    return true;
  };

  const handleNext = () => {
    startSavingTransition(async () => {
      const didSave = await saveCurrentStep();

      if (!didSave) {
        return;
      }

      setCurrentStep((step) =>
        Math.min(step + 1, inquiryStepTitles.length - 1),
      );
    });
  };

  const handlePrevious = () => {
    setGlobalError(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const handleFinalSubmit = form.handleSubmit((values) => {
    startSavingTransition(async () => {
      if (values.moral_failure || values.financial_investigation) {
        setGlobalError(
          "This inquiry is disqualified and cannot be submitted because of the answers in the discernment step.",
        );
        return;
      }

      const result = await submitInquiry(values, applicationId);

      if (result.error) {
        setGlobalError(result.error);
        return;
      }

      if (result.applicationId) {
        setApplicationId(result.applicationId);
      }

      setConfirmationVisible(true);
      setGlobalError(null);
    });
  });

  if (confirmationVisible) {
    return (
      <main className="relative isolate min-h-screen overflow-hidden bg-[#0B1622] px-6 py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(192,154,69,0.12),_transparent_35%),linear-gradient(180deg,_rgba(17,28,43,0.92),_#0B1622)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center rounded-[2rem] border border-white/10 bg-white/5 px-8 py-14 text-center shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.4em] text-[#C09A45]">
            Inquiry Submitted
          </p>
          <h1 className="mt-6 text-4xl font-semibold">
            Thank you. Your ministry inquiry is in review.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            We saved your application and marked it as submitted. A reviewer can
            now continue the discernment process from the dashboard.
          </p>
          <div className="mt-10 rounded-3xl border border-[#C09A45]/25 bg-[#112131] px-6 py-5 text-left text-sm text-slate-300">
            <p className="font-medium text-[#F1D9A1]">What happens next</p>
            <p className="mt-3 leading-7">
              Your answers, ministry profile, and supporting context are now
              available to the review team. You can return to the dashboard at
              any time for follow-up steps.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#0B1622] px-6 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(192,154,69,0.15),_transparent_32%),linear-gradient(180deg,_rgba(13,26,41,0.96),_#0B1622)]" />
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[#102033] blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <StepHeader
          currentStep={currentStep}
          totalSteps={inquiryStepTitles.length}
        />

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#C09A45]">
              Current Section
            </p>
            <h1 className="mt-4 text-3xl font-semibold">{stepTitle}</h1>
            <p className="mt-4 leading-7 text-slate-300">
              Complete this section before moving forward. Each Next click saves
              your draft to Supabase so you can continue without losing
              progress.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-[#112131] p-5 text-sm text-slate-300">
              <p className="font-medium text-[#F1D9A1]">Submission rules</p>
              <p className="mt-3 leading-7">{completionCopy}</p>
              {legalAction ? (
                <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-amber-100">
                  Legal action is disclosed. This will be highlighted for
                  reviewers.
                </div>
              ) : null}
              {disqualified ? (
                <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-200">
                  This inquiry is currently disqualified because of a moral
                  failure or financial investigation response.
                </div>
              ) : null}
            </div>
          </aside>

          <form
            className="rounded-[2rem] border border-white/10 bg-[#0D1A29]/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
            onSubmit={handleFinalSubmit}
          >
            <div className="space-y-6">
              {currentStep === 0 ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-200">
                        Legal name
                      </label>
                      <InputField
                        {...form.register("legal_name")}
                        placeholder="Ministry Organization, Inc."
                      />
                      <FieldError
                        message={form.formState.errors.legal_name?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        DBA name
                      </label>
                      <InputField
                        {...form.register("dba_name")}
                        placeholder="Doing business as..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        EIN
                      </label>
                      <InputField
                        {...form.register("ein")}
                        placeholder="12-3456789"
                      />
                      <FieldError
                        message={form.formState.errors.ein?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        Year founded
                      </label>
                      <InputField
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
                      <label className="text-sm font-medium text-slate-200">
                        State of incorporation
                      </label>
                      <SelectField {...form.register("state_of_incorporation")}>
                        {US_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </SelectField>
                      <FieldError
                        message={
                          form.formState.errors.state_of_incorporation?.message
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        Entity type
                      </label>
                      <SelectField {...form.register("entity_type")}>
                        {ENTITY_TYPES.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectField>
                      <FieldError
                        message={form.formState.errors.entity_type?.message}
                      />
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <label className="text-sm font-medium text-slate-200">
                        Primary focus
                      </label>
                      <div className="grid gap-3 md:grid-cols-2">
                        {PRIMARY_FOCUS_OPTIONS.map((option) => {
                          const selected = form.watch("primary_focus");
                          const checked = selected.includes(option);

                          return (
                            <CheckboxCard
                              checked={checked}
                              key={option}
                              label={option}
                              onChange={() => {
                                const next = checked
                                  ? selected.filter((value) => value !== option)
                                  : [...selected, option];

                                form.setValue("primary_focus", next, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                            />
                          );
                        })}
                      </div>
                      <FieldError
                        message={form.formState.errors.primary_focus?.message}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        Geographic scope
                      </label>
                      <SelectField {...form.register("geographic_scope")}>
                        {GEOGRAPHIC_SCOPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  </div>

                  {(geographicScope === "International" ||
                    geographicScope === "Multi-national") && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-200">
                        Countries
                      </label>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {COUNTRY_OPTIONS.map((country) => {
                          const selected = form.watch("countries");
                          const checked = selected.includes(country);

                          return (
                            <CheckboxCard
                              checked={checked}
                              key={country}
                              label={country}
                              onChange={() => {
                                const next = checked
                                  ? selected.filter(
                                      (value) => value !== country,
                                    )
                                  : [...selected, country];

                                form.setValue("countries", next, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                            />
                          );
                        })}
                      </div>
                      <FieldError
                        message={
                          form.formState.errors.countries?.message as
                            | string
                            | undefined
                        }
                      />
                    </div>
                  )}
                </>
              ) : null}

              {currentStep === 1 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Lead name
                    </label>
                    <InputField
                      {...form.register("lead_name")}
                      placeholder="Executive director or lead pastor"
                    />
                    <FieldError
                      message={form.formState.errors.lead_name?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Years in role
                    </label>
                    <InputField
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
                    <label className="text-sm font-medium text-slate-200">
                      Theological education
                    </label>
                    <SelectField {...form.register("theological_education")}>
                      {THEOLOGICAL_EDUCATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Ordination status
                    </label>
                    <SelectField {...form.register("ordination_status")}>
                      {ORDINATION_STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  {ordinationStatus === "Ordained" ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        Ordaining body
                      </label>
                      <InputField
                        {...form.register("ordaining_body")}
                        placeholder="Presbytery, convention, or network"
                      />
                      <FieldError
                        message={form.formState.errors.ordaining_body?.message}
                      />
                    </div>
                  ) : null}

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Founder still in leadership?
                    </label>
                    <BooleanToggle
                      onChange={(value) =>
                        form.setValue("founder_still_in_leadership", value, {
                          shouldDirty: true,
                        })
                      }
                      value={form.watch("founder_still_in_leadership")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Board size
                    </label>
                    <InputField
                      type="number"
                      {...form.register("board_size", { valueAsNumber: true })}
                    />
                    <FieldError
                      message={form.formState.errors.board_size?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Board compensated
                    </label>
                    <SelectField {...form.register("board_compensated")}>
                      {BOARD_COMPENSATED_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              ) : null}

              {currentStep === 2 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Denomination
                    </label>
                    <SelectField {...form.register("denomination")}>
                      {DENOMINATION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Doctrinal statement publicly available?
                    </label>
                    <BooleanToggle
                      onChange={(value) =>
                        form.setValue("doctrinal_statement_public", value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      value={form.watch("doctrinal_statement_public")}
                    />
                  </div>

                  {doctrinalStatementPublic ? (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-slate-200">
                        Doctrinal statement URL
                      </label>
                      <InputField
                        {...form.register("doctrinal_statement_url")}
                        placeholder="https://..."
                      />
                      <FieldError
                        message={
                          form.formState.errors.doctrinal_statement_url?.message
                        }
                      />
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Scripture position
                    </label>
                    <SelectField {...form.register("scripture_position")}>
                      {SCRIPTURE_POSITION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Gospel clarity
                    </label>
                    <SelectField {...form.register("gospel_clarity")}>
                      {GOSPEL_CLARITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Baptism position
                    </label>
                    <SelectField {...form.register("baptism_position")}>
                      {BAPTISM_POSITION_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              ) : null}

              {currentStep === 3 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Annual revenue range
                    </label>
                    <SelectField {...form.register("annual_revenue_range")}>
                      {ANNUAL_REVENUE_RANGE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Files 990
                    </label>
                    <SelectField {...form.register("files_990")}>
                      {FILES_990_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Funding sources
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {FUNDING_SOURCE_OPTIONS.map((option) => {
                        const selected = form.watch("funding_sources");
                        const checked = selected.includes(option);

                        return (
                          <CheckboxCard
                            checked={checked}
                            key={option}
                            label={option}
                            onChange={() => {
                              const next = checked
                                ? selected.filter((value) => value !== option)
                                : [...selected, option];

                              form.setValue("funding_sources", next, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                          />
                        );
                      })}
                    </div>
                    <FieldError
                      message={form.formState.errors.funding_sources?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Audit level
                    </label>
                    <SelectField {...form.register("audit_level")}>
                      {AUDIT_LEVEL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Board-approved budget
                    </label>
                    <BooleanToggle
                      onChange={(value) =>
                        form.setValue("board_approved_budget", value, {
                          shouldDirty: true,
                        })
                      }
                      value={form.watch("board_approved_budget")}
                    />
                  </div>
                </div>
              ) : null}

              {currentStep === 4 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Annual reach
                    </label>
                    <InputField
                      type="number"
                      {...form.register("annual_reach", {
                        valueAsNumber: true,
                      })}
                    />
                    <FieldError
                      message={form.formState.errors.annual_reach?.message}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Key metric
                    </label>
                    <InputField
                      {...form.register("key_metric")}
                      placeholder="One sentence describing your most meaningful outcome metric"
                    />
                    <FieldError
                      message={form.formState.errors.key_metric?.message}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Media presence URL
                    </label>
                    <InputField
                      {...form.register("media_presence_url")}
                      placeholder="https://..."
                    />
                    <FieldError
                      message={
                        form.formState.errors.media_presence_url?.message
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-200">
                      Has references?
                    </label>
                    <BooleanToggle
                      onChange={(value) =>
                        form.setValue("has_references", value, {
                          shouldDirty: true,
                        })
                      }
                      value={form.watch("has_references")}
                    />
                  </div>
                </div>
              ) : null}

              {currentStep === 5 ? (
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        Legal action
                      </label>
                      <BooleanToggle
                        onChange={(value) =>
                          form.setValue("legal_action", value, {
                            shouldDirty: true,
                          })
                        }
                        value={form.watch("legal_action")}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        Moral failure
                      </label>
                      <BooleanToggle
                        labels={["No", "Yes"]}
                        onChange={(value) =>
                          form.setValue("moral_failure", value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        value={form.watch("moral_failure")}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-200">
                        Financial investigation
                      </label>
                      <BooleanToggle
                        labels={["No", "Yes"]}
                        onChange={(value) =>
                          form.setValue("financial_investigation", value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        value={form.watch("financial_investigation")}
                      />
                    </div>
                  </div>

                  {legalAction ? (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      Legal action disclosure does not automatically disqualify
                      the inquiry, but it will be flagged for reviewer
                      follow-up.
                    </div>
                  ) : null}

                  {disqualified ? (
                    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      This response triggers an automatic disqualification. You
                      can save your draft, but final submission is disabled.
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Funding rationale
                    </label>
                    <textarea
                      {...form.register("funding_rationale")}
                      className="min-h-36 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30"
                      maxLength={500}
                      placeholder="In 500 characters or fewer, explain why your ministry is seeking funding and what support would accelerate."
                    />
                    <div className="flex items-center justify-between">
                      <FieldError
                        message={
                          form.formState.errors.funding_rationale?.message
                        }
                      />
                      <span className="text-xs text-slate-500">
                        {form.watch("funding_rationale").length}/500
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Referral source
                    </label>
                    <SelectField {...form.register("referral_source")}>
                      <option value="">Select one</option>
                      {REFERRAL_SOURCE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </SelectField>
                    <FieldError
                      message={form.formState.errors.referral_source?.message}
                    />
                  </div>
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
                  disabled={currentStep === 0 || isSaving}
                  onClick={handlePrevious}
                  type="button"
                >
                  Previous
                </button>

                {currentStep < inquiryStepTitles.length - 1 ? (
                  <button
                    className="rounded-2xl bg-[#C09A45] px-5 py-3 text-sm font-semibold text-[#0B1622] transition hover:bg-[#d7b35c] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isSaving}
                    onClick={handleNext}
                    type="button"
                  >
                    {isSaving ? "Saving..." : "Save and continue"}
                  </button>
                ) : (
                  <button
                    className="rounded-2xl bg-[#C09A45] px-5 py-3 text-sm font-semibold text-[#0B1622] transition hover:bg-[#d7b35c] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSaving || disqualified}
                    type="submit"
                  >
                    {isSaving ? "Submitting..." : "Submit inquiry"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
