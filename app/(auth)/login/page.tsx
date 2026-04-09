"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { login, sendMagicLink } from "@/app/actions/auth";
import { SaveBrand } from "@/components/Nav";

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

  return <p className="text-sm text-[#9B2C2C]">{message}</p>;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isMagicLinkPending, startMagicLinkTransition] = useTransition();

  const redirectTo = searchParams.get("redirectTo") ?? "/portal";
  const message =
    searchParams.get("message") === "check-email"
      ? "Check your inbox for a secure sign-in link."
      : null;

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

  const handlePasswordSubmit = passwordForm.handleSubmit((values) => {
    setPasswordError(null);

    startPasswordTransition(async () => {
      const result = await login({
        ...values,
        redirectTo,
      });

      if (result?.error) {
        setPasswordError(result.error);
        toast.error(result.error);
      }
    });
  });

  const handleMagicLinkSubmit = magicLinkForm.handleSubmit((values) => {
    setMagicLinkError(null);
    setMagicLinkSent(false);

    startMagicLinkTransition(async () => {
      const result = await sendMagicLink({
        ...values,
        redirectTo,
      });

      if (result?.error) {
        setMagicLinkError(result.error);
        toast.error(result.error);
        return;
      }

      setMagicLinkSent(true);
      toast.success("Magic link sent. Check your inbox to continue.");
    });
  });

  return (
    <main className="min-h-screen bg-[#F9F6F0] px-6 py-8 md:px-[52px]">
      <header className="mx-auto flex max-w-6xl items-center py-4">
        <Link className="no-underline" href="/">
          <SaveBrand />
        </Link>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 py-6 lg:grid-cols-[1fr_460px]">
        <section className="rounded-[32px] border border-[#D8D1C3] bg-[#FFFDF8] p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)] md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6B8570]">
            SAVE Platform
          </p>
          <h1
            className="mt-6 max-w-[640px] text-5xl leading-[1.05] text-[#1B4D35] md:text-6xl"
            style={{ fontFamily: "var(--font-auth-serif)" }}
          >
            Sign in to continue your ministry application.
          </h1>
          <p className="mt-6 max-w-[560px] text-lg leading-8 text-[#4C5E52]">
            Access your ministry dashboard, continue the inquiry, and move
            through the SAVE process with a secure account.
          </p>

          <div className="mt-10 rounded-[28px] border border-[#D8D1C3] bg-[#F4EFE4] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6B8570]">
              Access
            </p>
            <p className="mt-3 max-w-[480px] text-base leading-8 text-[#4C5E52]">
              Ministries can sign in with email and password or request a magic
              link. New organizations can create an account and begin the SAVE
              application process in one step.
            </p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#D8D1C3] bg-white p-8 shadow-[0_25px_80px_rgba(27,77,53,0.08)] md:p-10">
          <div className="space-y-2">
            <h2
              className="text-4xl text-[#1B4D35]"
              style={{ fontFamily: "var(--font-auth-serif)" }}
            >
              Welcome back
            </h2>
            <p className="text-sm leading-7 text-[#5D7264]">
              Sign in with your password or request a secure one-time link.
            </p>
          </div>

          {message ? (
            <div className="mt-6 rounded-2xl border border-[#C9BA98] bg-[#F4EFE4] px-4 py-3 text-sm text-[#1B4D35]">
              {message}
            </div>
          ) : null}

          <form className="mt-8 space-y-5" onSubmit={handlePasswordSubmit}>
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
                placeholder="name@organization.org"
                {...passwordForm.register("email")}
              />
              <FieldError
                message={passwordForm.formState.errors.email?.message}
              />
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
                autoComplete="current-password"
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
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
              className="w-full rounded-2xl bg-[#1B4D35] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#236645] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPasswordPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#D8D1C3]" />
            <span className="text-xs uppercase tracking-[0.3em] text-[#8A968F]">
              Or
            </span>
            <div className="h-px flex-1 bg-[#D8D1C3]" />
          </div>

          <form className="space-y-5" onSubmit={handleMagicLinkSubmit}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-[#1B4D35]"
                htmlFor="magic-email"
              >
                Email for magic link
              </label>
              <input
                id="magic-email"
                type="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-[#D8D1C3] bg-[#FFFDF8] px-4 py-3 text-[#1B4D35] outline-none transition placeholder:text-[#8A968F] focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
                placeholder="name@organization.org"
                {...magicLinkForm.register("email")}
              />
              <FieldError
                message={magicLinkForm.formState.errors.email?.message}
              />
            </div>

            <FieldError message={magicLinkError ?? undefined} />

            {magicLinkSent ? (
              <div className="rounded-2xl border border-[#C9BA98] bg-[#F4EFE4] px-4 py-3 text-sm text-[#1B4D35]">
                Magic link sent. Check your inbox to continue.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isMagicLinkPending}
              className="w-full rounded-2xl border border-[#1B4D35] bg-transparent px-4 py-3 text-sm font-semibold text-[#1B4D35] transition hover:bg-[#F4EFE4] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isMagicLinkPending ? "Sending..." : "Email me a magic link"}
            </button>
          </form>

          <p className="mt-8 text-sm text-[#5D7264]">
            New ministry?{" "}
            <Link
              className="font-semibold text-[#1B4D35] underline-offset-4 hover:underline"
              href="/register"
            >
              Create your account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
