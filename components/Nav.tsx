"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function SaveLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 160 156"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M80 0 L148 39 L148 117 L80 156 L12 117 L12 39 Z"
        fill="#0E2E5C"
      />
      <path
        d="M80 6 L142 42 L142 114 L80 150 L18 114 L18 42 Z"
        fill="#1A4480"
      />
      <path
        d="M40 123C47 99 59 81 73 66C87 52 101 41 118 31"
        stroke="#F5C842"
        strokeLinecap="round"
        strokeWidth="7.5"
      />
      <ellipse cx="58" cy="92" fill="#F5C842" rx="5.5" ry="20" transform="rotate(12 58 92)" />
      <ellipse cx="76" cy="73" fill="#F5C842" rx="5.5" ry="27" transform="rotate(17 76 73)" />
      <ellipse cx="96" cy="57" fill="#F5C842" rx="5.5" ry="28" transform="rotate(20 96 57)" />
      <ellipse cx="112" cy="45" fill="#F5C842" rx="5.2" ry="22" transform="rotate(18 112 45)" />
      <ellipse cx="69" cy="99" fill="#F5C842" rx="4.8" ry="18" transform="rotate(-66 69 99)" />
      <ellipse cx="86" cy="85" fill="#F5C842" rx="4.8" ry="20" transform="rotate(-64 86 85)" />
      <ellipse cx="101" cy="69" fill="#F5C842" rx="4.8" ry="18" transform="rotate(-62 101 69)" />
      <ellipse cx="115" cy="57" fill="#F5C842" rx="4.2" ry="14" transform="rotate(-60 115 57)" />
      <ellipse cx="125" cy="49" fill="#F5C842" rx="3.5" ry="9" transform="rotate(-57 125 49)" />
      <ellipse cx="129" cy="39" fill="#F5C842" rx="2.6" ry="6.5" transform="rotate(-76 129 39)" />
    </svg>
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
    <div className="flex items-center gap-[10px]">
      <SaveLogo />
      <div>
        <div
          className={`font-public-serif text-[22px] font-semibold leading-none tracking-[0.02em] ${textClassName}`}
        >
          SAVE
        </div>
        <div
          className={`mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] ${subtextClassName}`}
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
