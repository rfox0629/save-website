"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { register } from "@/app/actions/auth";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  organizationLegalName: z
    .string()
    .min(2, "Organization legal name is required."),
  ein: z
    .string()
    .min(1, "EIN is required.")
    .regex(/^\d{2}-?\d{7}$/, "Enter a valid EIN."),
});

type RegisterValues = z.infer<typeof registerSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-300">{message}</p>;
}

export default function RegisterPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      organizationLegalName: "",
      ein: "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const result = await register(values);

      if (result?.error) {
        setFormError(result.error);
      }
    });
  });

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(192,154,69,0.18),_transparent_30%),linear-gradient(180deg,_rgba(17,28,43,0.92),_#0B1622)]" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#13263B] blur-3xl" />
      <div className="absolute right-10 top-16 h-48 w-48 rounded-full border border-[#C09A45]/15 bg-[#C09A45]/5 blur-3xl" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between border-b border-white/10 px-8 py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-[#C09A45]">
              Ministry Registration
            </p>
            <div className="space-y-4">
              <h1 className="max-w-md text-4xl font-semibold leading-tight text-white md:text-5xl">
                Start your ministry application with a secure account.
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-300">
                This registration flow is reserved for ministry applicants. We
                create your organization record and link it to your account so
                future application data stays scoped correctly.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-[#C09A45]/20 bg-[#0F2031]/80 p-6 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.3em] text-[#C09A45]">
              What you need
            </p>
            <ul className="mt-3 space-y-3 leading-7">
              <li>Your ministry email address</li>
              <li>Your legal organization name</li>
              <li>Your EIN for organization matching</li>
            </ul>
          </div>
        </div>

        <div className="bg-[#0D1A29]/95 px-8 py-10 lg:px-12 lg:py-14">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                Create a ministry account
              </h2>
              <p className="text-sm text-slate-400">
                Your role will be provisioned as{" "}
                <span className="text-[#F1D9A1]">ministry</span>.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-200"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30"
                  placeholder="director@ministry.org"
                  {...form.register("email")}
                />
                <FieldError message={form.formState.errors.email?.message} />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-200"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30"
                  placeholder="Choose a secure password"
                  {...form.register("password")}
                />
                <FieldError message={form.formState.errors.password?.message} />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-200"
                  htmlFor="organizationLegalName"
                >
                  Organization legal name
                </label>
                <input
                  id="organizationLegalName"
                  type="text"
                  autoComplete="organization"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30"
                  placeholder="Ministry Organization, Inc."
                  {...form.register("organizationLegalName")}
                />
                <FieldError
                  message={form.formState.errors.organizationLegalName?.message}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-200"
                  htmlFor="ein"
                >
                  EIN
                </label>
                <input
                  id="ein"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30"
                  placeholder="12-3456789"
                  {...form.register("ein")}
                />
                <FieldError message={form.formState.errors.ein?.message} />
              </div>

              <FieldError message={formError ?? undefined} />

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-[#C09A45] px-4 py-3 text-sm font-semibold text-[#0B1622] transition hover:bg-[#d3ac56] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Creating account..." : "Create ministry account"}
              </button>
            </form>

            <p className="text-sm text-slate-400">
              Already have access?{" "}
              <Link className="text-[#F1D9A1] hover:text-white" href="/login">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
