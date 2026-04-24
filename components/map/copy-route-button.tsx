"use client";

import { useState } from "react";

type CopyRouteButtonProps = {
  value: string;
};

export function CopyRouteButton({ value }: CopyRouteButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="rounded-full border border-[#E3DCCF] bg-[#FBF8F2] px-3 py-1 text-xs font-medium text-[#7088A5] transition hover:border-[#D4C6AE] hover:text-[#1A4480] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A4480]/15"
      aria-label={`Copy route ${value}`}
      onClick={handleCopy}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
