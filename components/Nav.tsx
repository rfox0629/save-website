"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function SaveLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image
        alt="SAVE logo"
        className="object-contain"
        fill
        priority
        sizes="40px"
        src="/save-logo-mark.png"
      />
    </div>
  );
}

export function SaveBrand({
  subtextClassName = "text-[#7088A5]",
  textClassName = "text-[#1A4480]",
}: {
  subtextClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <SaveLogo />
      <div>
        <div
          className={`font-public-serif text-[24px] font-semibold leading-none tracking-[0.01em] ${textClassName}`}
        >
          SAVE
        </div>
        <div
          className={`mt-1 text-[11px] font-medium uppercase tracking-[0.14em] ${subtextClassName}`}
        >
          The SAVE Standard
        </div>
      </div>
    </div>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 flex h-[68px] items-center justify-between border-b border-[rgba(26,68,128,0.1)] bg-[rgba(249,246,240,0.92)] px-6 backdrop-blur-[16px] transition-shadow md:px-[52px] ${
        scrolled ? "shadow-[0_2px_24px_rgba(26,68,128,0.08)]" : ""
      }`}
    >
      <Link className="no-underline" href="/">
        <SaveBrand />
      </Link>

      <div className="hidden items-center gap-9 md:flex">
        <Link
          className="text-[14px] font-medium text-[#3D5576] no-underline transition-colors hover:text-[#1A4480]"
          href="/#how"
        >
          How it works
        </Link>
        <Link
          className="text-[14px] font-medium text-[#3D5576] no-underline transition-colors hover:text-[#1A4480]"
          href="/#model"
        >
          The model
        </Link>
        <Link
          className="text-[14px] font-medium text-[#3D5576] no-underline transition-colors hover:text-[#1A4480]"
          href="/for-donors"
        >
          For donors
        </Link>
        <Link
          className="rounded-[6px] bg-[#1A4480] px-[22px] py-[9px] text-[14px] font-semibold text-white no-underline transition duration-200 hover:-translate-y-px hover:bg-[#2A5FA0]"
          href="/login?intent=ministry&redirectTo=%2Fportal%2Finquiry"
        >
          Apply now →
        </Link>
      </div>
    </nav>
  );
}
