"use client";

import { useState, useTransition } from "react";

type VoiceAlignmentResponseFormProps = {
  requestType: "external" | "internal";
  respondentEmail: string;
  respondentName: string;
  token: string;
};

type RecommendationOption = "No" | "With some caution" | "Yes";

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-[#1B4D35]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B8570]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[#1B4D35]">{title}</h2>
    </div>
  );
}

function ChoiceGroup({
  name,
  onChange,
  options,
  value,
}: {
  name: string;
  onChange: (value: RecommendationOption) => void;
  options: RecommendationOption[];
  value: string;
}) {
  return (
    <div className="grid gap-3">
      {options.map((option) => {
        const checked = value === option;

        return (
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
              checked
                ? "border-[#A8C5B1] bg-[#F2F8F3] text-[#1B4D35]"
                : "border-[#D8D1C3] bg-[#FFFDF8] text-[#4F6357]"
            }`}
            key={option}
          >
            <input
              checked={checked}
              className="h-4 w-4 border-[#CBBFA9] text-[#1B4D35]"
              name={name}
              onChange={() => onChange(option)}
              type="radio"
            />
            <span>{option}</span>
          </label>
        );
      })}
    </div>
  );
}

export function VoiceAlignmentResponseForm({
  requestType,
  respondentEmail,
  respondentName,
  token,
}: VoiceAlignmentResponseFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    additionalComments: "",
    concerns: "",
    concernsInconsistencies: "",
    growthAreas: "",
    internalCulture: "",
    leaderCharacter: "",
    orgLeaderDescription: "",
    orgStrengths: "",
    positiveObservations: "",
    relationship: "",
    respondentEmail,
    respondentName,
    supportRecommendation: "" as RecommendationOption | "",
    trustRecommendation: "" as RecommendationOption | "",
    yearsContextKnown: "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submit() {
    setFormError(null);

    startTransition(async () => {
      const response = await fetch(`/api/voice-alignment/${token}/response`, {
        body: JSON.stringify(form),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setFormError(result.error ?? "Unable to submit feedback.");
        return;
      }

      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <section className="rounded-[32px] border border-[#DCE8DF] bg-white px-8 py-10 shadow-[0_20px_60px_rgba(27,77,53,0.07)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6B8570]">
          Thank You
        </p>
        <h2
          className="mt-4 text-3xl leading-tight text-[#1B4D35]"
          style={{ fontFamily: "var(--font-public-serif)" }}
        >
          Thank you for sharing your perspective.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[#365342]">
          Your input contributes to a deeper understanding of this organization
          and helps ensure integrity, alignment, and trust.
        </p>
        <p className="mt-3 text-base leading-8 text-[#365342]">
          Thank you for your time.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-[#D8D1C3] bg-white p-8 shadow-[0_20px_60px_rgba(27,77,53,0.07)]">
      <header className="border-b border-[#E8E0D2] pb-6">
        <h1
          className="text-3xl leading-tight text-[#1B4D35]"
          style={{ fontFamily: "var(--font-public-serif)" }}
        >
          Share Your Perspective
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-8 text-[#4F6357]">
          Your input helps us understand how this organization is experienced
          both internally and externally.
        </p>
        <div className="mt-5 rounded-[24px] border border-[#E3DCCF] bg-[#FCFAF5] px-5 py-4">
          <p className="text-sm leading-7 text-[#475A4F]">
            Your responses are confidential and will be used to identify
            patterns and themes. Individual responses are not published or
            attribute feedback to specific individuals.
          </p>
        </div>
      </header>

      <div className="mt-8 space-y-8">
        <section className="space-y-5">
          <SectionHeading eyebrow="About You" title="A little context" />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Your name">
              <input
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                onChange={(event) => update("respondentName", event.target.value)}
                type="text"
                value={form.respondentName}
              />
            </Field>

            <Field
              label={
                requestType === "internal"
                  ? "Your role or relationship to the organization"
                  : "Your relationship to the organization"
              }
            >
              <input
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                onChange={(event) => update("relationship", event.target.value)}
                type="text"
                value={form.relationship}
              />
            </Field>

            <Field
              label={
                requestType === "internal"
                  ? "How long you’ve been involved"
                  : "How long you’ve known or observed them"
              }
            >
              <input
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                onChange={(event) => update("yearsContextKnown", event.target.value)}
                type="text"
                value={form.yearsContextKnown}
              />
            </Field>
          </div>
        </section>

        <section className="space-y-5">
          <SectionHeading eyebrow="Questions" title="Your perspective" />

          {requestType === "internal" ? (
            <div className="grid gap-5">
              <Field label="How would you describe the leader’s character?">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                  onChange={(event) => update("leaderCharacter", event.target.value)}
                  value={form.leaderCharacter}
                />
              </Field>
              <Field label="What does this organization do especially well?">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                  onChange={(event) => update("orgStrengths", event.target.value)}
                  value={form.orgStrengths}
                />
              </Field>
              <Field label="Where do you see opportunities for growth?">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                  onChange={(event) => update("growthAreas", event.target.value)}
                  value={form.growthAreas}
                />
              </Field>
              <Field label="How would you describe the internal culture?">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                  onChange={(event) => update("internalCulture", event.target.value)}
                  value={form.internalCulture}
                />
              </Field>
              <Field label="Would you trust this leader with greater responsibility?">
                <ChoiceGroup
                  name="trustRecommendation"
                  onChange={(value) => update("trustRecommendation", value)}
                  options={["Yes", "With some caution", "No"]}
                  value={form.trustRecommendation}
                />
              </Field>
              <Field label="Is there anything else you believe should be considered?">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                  onChange={(event) => update("concerns", event.target.value)}
                  value={form.concerns}
                />
              </Field>
            </div>
          ) : (
            <div className="grid gap-5">
              <Field label="How would you describe this organization or its leadership?">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                  onChange={(event) => update("orgLeaderDescription", event.target.value)}
                  value={form.orgLeaderDescription}
                />
              </Field>
              <Field label="What stands out most positively?">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                  onChange={(event) => update("positiveObservations", event.target.value)}
                  value={form.positiveObservations}
                />
              </Field>
              <Field label="Have you observed any concerns or inconsistencies?">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                  onChange={(event) =>
                    update("concernsInconsistencies", event.target.value)
                  }
                  value={form.concernsInconsistencies}
                />
              </Field>
              <Field label="Would you recommend this organization for support?">
                <ChoiceGroup
                  name="supportRecommendation"
                  onChange={(value) => update("supportRecommendation", value)}
                  options={["Yes", "With some caution", "No"]}
                  value={form.supportRecommendation}
                />
              </Field>
              <Field label="Anything else you’d like to share?">
                <textarea
                  className="min-h-[120px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35]"
                  onChange={(event) => update("additionalComments", event.target.value)}
                  value={form.additionalComments}
                />
              </Field>
            </div>
          )}
        </section>
      </div>

      {formError ? (
        <div className="mt-6 rounded-2xl border border-[#E6D4A7] bg-[#FFF8E8] px-4 py-3 text-sm text-[#6C5A2F]">
          {formError}
        </div>
      ) : null}

      <button
        className="mt-8 w-full rounded-2xl bg-[#1B4D35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#236645] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        onClick={() => void submit()}
        type="button"
      >
        {isPending ? "Submitting..." : "Share Your Perspective"}
      </button>
    </section>
  );
}
