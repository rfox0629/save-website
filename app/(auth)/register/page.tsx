"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { register } from "@/app/actions/auth";

const registerSchema = z
  .object({
    confirmPassword: z.string().min(8, "Confirm your password."),
    email: z.string().email("Enter a valid email address."),
    ein: z
      .string()
      .min(1, "EIN is required.")
      .regex(/^\d{2}-?\d{7}$/, "Enter a valid EIN."),
    organizationLegalName: z
      .string()
      .min(2, "Organization legal name is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-[#9B2C2C]">{message}</p>;
}

export default function RegisterPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      confirmPassword: "",
      email: "",
      ein: "",
      organizationLegalName: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const result = await register({
        email: values.email,
        ein: values.ein,
        organizationLegalName: values.organizationLegalName,
        password: values.password,
      });

      if (result?.error) {
        setFormError(result.error);
        toast.error(result.error);
      }
    });
  });

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_480px]">
        <section className="rounded-[32px] border border-[#D8D1C3] bg-[#FFFDF8] p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)] md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
            Ministry Registration
          </p>
          <h1
            className="mt-6 max-w-[680px] text-5xl leading-[1.05] text-[#1B4D35] md:text-6xl"
            style={{ fontFamily: "var(--font-auth-serif)" }}
          >
            Create your ministry account and start the SAVE application.
          </h1>
          <p className="mt-6 max-w-[560px] text-lg leading-8 text-[#4C5E52]">
            We&apos;ll create your ministry account, organization record, and
            initial application so you can head straight into the portal.
          </p>

          <div className="mt-10 rounded-[28px] border border-[#D8D1C3] bg-[#F4EFE4] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
              What you&apos;ll need
            </p>
            <ul className="mt-3 space-y-2 text-base leading-8 text-[#4C5E52]">
              <li>Your ministry email address</li>
              <li>Your organization legal name</li>
              <li>Your EIN in the format XX-XXXXXXX</li>
            </ul>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#D8D1C3] bg-white p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)] md:p-10">
          <div className="space-y-2">
            <h2
              className="text-4xl text-[#1B4D35]"
              style={{ fontFamily: "var(--font-auth-serif)" }}
            >
              Register
            </h2>
            <p className="text-sm leading-7 text-[#5D7264]">
              Your account will be provisioned with the{" "}
              <span className="font-semibold text-[#1B4D35]">ministry</span>{" "}
              role.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#1B4D35]"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
                placeholder="director@ministry.org"
                {...form.register("email")}
              />
              <FieldError message={form.formState.errors.email?.message} />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#1B4D35]"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
                placeholder="Choose a secure password"
                {...form.register("password")}
              />
              <FieldError message={form.formState.errors.password?.message} />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#1B4D35]"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
                placeholder="Re-enter your password"
                {...form.register("confirmPassword")}
              />
              <FieldError
                message={form.formState.errors.confirmPassword?.message}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#1B4D35]"
                htmlFor="organizationLegalName"
              >
                Organization Legal Name
              </label>
              <input
                id="organizationLegalName"
                type="text"
                autoComplete="organization"
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
                placeholder="Ministry Organization, Inc."
                {...form.register("organizationLegalName")}
              />
              <FieldError
                message={form.formState.errors.organizationLegalName?.message}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#1B4D35]"
                htmlFor="ein"
              >
                EIN
              </label>
              <input
                id="ein"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
                placeholder="12-3456789"
                {...form.register("ein")}
              />
              <FieldError message={form.formState.errors.ein?.message} />
            </div>

            <FieldError message={formError ?? undefined} />

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-[#1B4D35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#236645] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-8 text-sm text-[#5D7264]">
            Already have an account?{" "}
            <Link
              className="font-semibold text-[#1B4D35] underline-offset-4 hover:underline"
              href="/login"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
