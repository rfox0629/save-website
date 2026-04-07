"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { login, sendMagicLink } from "@/app/actions/auth";

const passwordLoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type PasswordLoginValues = z.infer<typeof passwordLoginSchema>;
type MagicLinkValues = z.infer<typeof magicLinkSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-300">{message}</p>;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isMagicLinkPending, startMagicLinkTransition] = useTransition();

  const passwordForm = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const magicLinkForm = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  const message =
    searchParams.get("message") === "check-email"
      ? "Check your inbox for the link we just sent."
      : null;

  const handlePasswordSubmit = passwordForm.handleSubmit((values) => {
    setPasswordError(null);

    startPasswordTransition(async () => {
      const result = await login(values);

      if (result?.error) {
        setPasswordError(result.error);
      }
    });
  });

  const handleMagicLinkSubmit = magicLinkForm.handleSubmit((values) => {
    setMagicLinkError(null);
    setMagicLinkSent(false);

    startMagicLinkTransition(async () => {
      const result = await sendMagicLink(values);

      if (result?.error) {
        setMagicLinkError(result.error);
        return;
      }

      setMagicLinkSent(true);
    });
  });

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(192,154,69,0.18),_transparent_28%),linear-gradient(180deg,_rgba(17,28,43,0.92),_#0B1622)]" />
      <div className="absolute left-10 top-10 h-48 w-48 rounded-full border border-[#C09A45]/15 bg-[#C09A45]/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#102033] blur-3xl" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between border-b border-white/10 px-8 py-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-[#C09A45]">
              Save Website
            </p>
            <div className="space-y-4">
              <h1 className="max-w-md text-4xl font-semibold leading-tight text-white md:text-5xl">
                Review ministry applications with clarity and trust.
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-300">
                Sign in to continue your review workflow, manage applications,
                and publish donor-ready briefs from one secure workspace.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-[#C09A45]/20 bg-[#0F2031]/80 p-6 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.3em] text-[#C09A45]">
              Access
            </p>
            <p className="mt-3 leading-7">
              Ministry teams can register for an account, while reviewers and
              admins can sign in with password or request a secure magic link.
            </p>
          </div>
        </div>

        <div className="bg-[#0D1A29]/95 px-8 py-10 lg:px-12 lg:py-14">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                Welcome back
              </h2>
              <p className="text-sm text-slate-400">
                Use your password or request a one-time sign-in link.
              </p>
            </div>

            {message ? (
              <div className="rounded-2xl border border-[#C09A45]/30 bg-[#C09A45]/10 px-4 py-3 text-sm text-[#F1D9A1]">
                {message}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
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
                  placeholder="name@organization.org"
                  {...passwordForm.register("email")}
                />
                <FieldError
                  message={passwordForm.formState.errors.email?.message}
                />
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
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30"
                  placeholder="Enter your password"
                  {...passwordForm.register("password")}
                />
                <FieldError
                  message={passwordForm.formState.errors.password?.message}
                />
              </div>

              <FieldError message={passwordError ?? undefined} />

              <button
                type="submit"
                disabled={isPasswordPending}
                className="w-full rounded-2xl bg-[#C09A45] px-4 py-3 text-sm font-semibold text-[#0B1622] transition hover:bg-[#d3ac56] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPasswordPending ? "Signing in..." : "Sign in with password"}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Or
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form className="space-y-4" onSubmit={handleMagicLinkSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-200"
                  htmlFor="magic-email"
                >
                  Email for magic link
                </label>
                <input
                  id="magic-email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#C09A45] focus:ring-2 focus:ring-[#C09A45]/30"
                  placeholder="name@organization.org"
                  {...magicLinkForm.register("email")}
                />
                <FieldError
                  message={magicLinkForm.formState.errors.email?.message}
                />
              </div>

              <FieldError message={magicLinkError ?? undefined} />

              {magicLinkSent ? (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  Magic link sent. Check your inbox to continue.
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isMagicLinkPending}
                className="w-full rounded-2xl border border-[#C09A45]/40 bg-transparent px-4 py-3 text-sm font-semibold text-[#F1D9A1] transition hover:bg-[#C09A45]/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isMagicLinkPending ? "Sending..." : "Email me a magic link"}
              </button>
            </form>

            <p className="text-sm text-slate-400">
              New ministry applicant?{" "}
              <Link
                className="text-[#F1D9A1] hover:text-white"
                href="/register"
              >
                Create your account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
