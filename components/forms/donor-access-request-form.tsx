"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { submitDonorAccessRequest } from "@/app/actions/donor-requests";

const donorAccessSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  fullName: z.string().min(2, "Full name is required."),
  givingFocus: z
    .string()
    .min(10, "Please share a brief description of your giving focus.")
    .max(300, "Keep this to 300 characters or fewer."),
  organization: z.string().max(120).optional(),
  referralSource: z.enum([
    "Ministry referral",
    "Peer referral",
    "Conference",
    "Other",
  ]),
});

type DonorAccessValues = z.infer<typeof donorAccessSchema>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-[#9B2C2C]">{message}</p> : null;
}

export function DonorAccessRequestForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<DonorAccessValues>({
    resolver: zodResolver(donorAccessSchema),
    defaultValues: {
      email: "",
      fullName: "",
      givingFocus: "",
      organization: "",
      referralSource: "Ministry referral",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const result = await submitDonorAccessRequest(values);

      if (result.error) {
        setFormError(result.error);
        toast.error(result.error);
        return;
      }

      setSubmitted(true);
      form.reset();
      toast.success("Request submitted successfully.");
    });
  });

  if (submitted) {
    return (
      <section className="rounded-[32px] border border-[#B8D2EE] bg-[#E8F0FA] px-8 py-10">
        <h2
          className="text-3xl text-[#1A4480]"
          style={{ fontFamily: "var(--font-public-serif)" }}
        >
          Thank you.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[#3D5576]">
          Your request will be reviewed within 3 business days.
        </p>
      </section>
    );
  }

  return (
    <form
      className="rounded-[32px] border border-[#D8D1C3] bg-white p-8 shadow-[0_20px_60px_rgba(26,68,128,0.07)]"
      onSubmit={onSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-[#1A4480]">
          <span>Full name</span>
          <input
            className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1A4480] outline-none transition focus:border-[#1A4480] focus:ring-2 focus:ring-[#1A4480]/20"
            {...form.register("fullName")}
            type="text"
          />
          <FieldError message={form.formState.errors.fullName?.message} />
        </label>

        <label className="space-y-2 text-sm font-medium text-[#1A4480]">
          <span>Email</span>
          <input
            className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1A4480] outline-none transition focus:border-[#1A4480] focus:ring-2 focus:ring-[#1A4480]/20"
            {...form.register("email")}
            type="email"
          />
          <FieldError message={form.formState.errors.email?.message} />
        </label>

        <label className="space-y-2 text-sm font-medium text-[#1A4480]">
          <span>Organization or fund name</span>
          <input
            className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1A4480] outline-none transition focus:border-[#1A4480] focus:ring-2 focus:ring-[#1A4480]/20"
            {...form.register("organization")}
            type="text"
          />
          <FieldError message={form.formState.errors.organization?.message} />
        </label>

        <label className="space-y-2 text-sm font-medium text-[#1A4480]">
          <span>How did you hear about SAVE?</span>
          <select
            className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1A4480] outline-none transition focus:border-[#1A4480] focus:ring-2 focus:ring-[#1A4480]/20"
            {...form.register("referralSource")}
          >
            <option value="Ministry referral">Ministry referral</option>
            <option value="Peer referral">Peer referral</option>
            <option value="Conference">Conference</option>
            <option value="Other">Other</option>
          </select>
          <FieldError message={form.formState.errors.referralSource?.message} />
        </label>
      </div>

      <label className="mt-5 block space-y-2 text-sm font-medium text-[#1A4480]">
        <span>Brief description of your giving focus</span>
        <textarea
          className="min-h-[140px] w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1A4480] outline-none transition focus:border-[#1A4480] focus:ring-2 focus:ring-[#1A4480]/20"
          maxLength={300}
          {...form.register("givingFocus")}
        />
        <div className="flex items-center justify-between text-xs text-[#7088A5]">
          <FieldError message={form.formState.errors.givingFocus?.message} />
          <span>{form.watch("givingFocus")?.length ?? 0}/300</span>
        </div>
      </label>

      {formError ? (
        <div className="mt-5 rounded-2xl border border-[#E6D4A7] bg-[#FFF8E8] px-4 py-3 text-sm text-[#6C5A2F]">
          {formError}
        </div>
      ) : null}

      <button
        className="mt-8 w-full rounded-2xl bg-[#1A4480] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2A5FA0] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
