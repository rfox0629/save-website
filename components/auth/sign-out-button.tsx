"use client";

import { useTransition } from "react";

import { logout } from "@/app/actions/auth";

export function SignOutButton({
  className,
  label = "Sign out",
}: {
  className?: string;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className={className}
      disabled={isPending}
      onClick={() => startTransition(async () => logout())}
      type="button"
    >
      {isPending ? "Signing out..." : label}
    </button>
  );
}
