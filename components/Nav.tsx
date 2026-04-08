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
        fill="#1B4D35"
      />
      <path
        d="M80 6 L142 42 L142 114 L80 150 L18 114 L18 42 Z"
        fill="#236645"
      />
      <line
        stroke="#F5C842"
        strokeLinecap="round"
        strokeWidth="2"
        x1="80"
        x2="80"
        y1="130"
        y2="30"
      />
      <ellipse cx="80" cy="24" fill="#F5C842" rx="3" ry="8" />
      <ellipse
        cx="73"
        cy="40"
        fill="#F5C842"
        rx="2.2"
        ry="9"
        transform="rotate(-35 73 40)"
      />
      <ellipse
        cx="87"
        cy="40"
        fill="#F5C842"
        rx="2.2"
        ry="9"
        transform="rotate(35 87 40)"
      />
      <ellipse
        cx="71"
        cy="54"
        fill="#F5C842"
        rx="2.2"
        ry="10"
        transform="rotate(-38 71 54)"
      />
      <ellipse
        cx="89"
        cy="54"
        fill="#F5C842"
        rx="2.2"
        ry="10"
        transform="rotate(38 89 54)"
      />
      <ellipse
        cx="70"
        cy="68"
        fill="#F5C842"
        rx="2.2"
        ry="10"
        transform="rotate(-40 70 68)"
      />
      <ellipse
        cx="90"
        cy="68"
        fill="#F5C842"
        rx="2.2"
        ry="10"
        transform="rotate(40 90 68)"
      />
      <ellipse
        cx="70"
        cy="82"
        fill="#F5C842"
        rx="2.2"
        ry="10"
        transform="rotate(-40 70 82)"
      />
      <ellipse
        cx="90"
        cy="82"
        fill="#F5C842"
        rx="2.2"
        ry="10"
        transform="rotate(40 90 82)"
      />
      <ellipse
        cx="71"
        cy="95"
        fill="#F5C842"
        rx="2"
        ry="8.5"
        transform="rotate(-37 71 95)"
      />
      <ellipse
        cx="89"
        cy="95"
        fill="#F5C842"
        rx="2"
        ry="8.5"
        transform="rotate(37 89 95)"
      />
      <ellipse
        cx="73"
        cy="107"
        fill="#F5C842"
        opacity="0.8"
        rx="1.8"
        ry="7"
        transform="rotate(-33 73 107)"
      />
      <ellipse
        cx="87"
        cy="107"
        fill="#F5C842"
        opacity="0.8"
        rx="1.8"
        ry="7"
        transform="rotate(33 87 107)"
      />
      <ellipse
        cx="75"
        cy="118"
        fill="#F5C842"
        opacity="0.6"
        rx="1.6"
        ry="5.5"
        transform="rotate(-28 75 118)"
      />
      <ellipse
        cx="85"
        cy="118"
        fill="#F5C842"
        opacity="0.6"
        rx="1.6"
        ry="5.5"
        transform="rotate(28 85 118)"
      />
    </svg>
  );
}

export function SaveBrand() {
  return (
    <div className="flex items-center gap-[10px]">
      <SaveLogo />
      <div>
        <div className="font-public-serif text-[22px] font-semibold leading-none tracking-[0.02em] text-[#1B4D35]">
          SAVE
        </div>
        <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-[#6B8570]">
          Ministry Vetting
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
      className={`fixed left-0 right-0 top-0 z-50 flex h-[68px] items-center justify-between border-b border-[rgba(27,77,53,0.1)] bg-[rgba(249,246,240,0.92)] px-6 backdrop-blur-[16px] transition-shadow md:px-[52px] ${
        scrolled ? "shadow-[0_2px_24px_rgba(27,77,53,0.08)]" : ""
      }`}
    >
      <Link className="no-underline" href="/">
        <SaveBrand />
      </Link>

      <div className="hidden items-center gap-9 md:flex">
        <Link
          className="text-[14px] font-medium text-[#3D5C47] no-underline transition-colors hover:text-[#1B4D35]"
          href="/#how"
        >
          How it works
        </Link>
        <Link
          className="text-[14px] font-medium text-[#3D5C47] no-underline transition-colors hover:text-[#1B4D35]"
          href="/#model"
        >
          The model
        </Link>
        <Link
          className="text-[14px] font-medium text-[#3D5C47] no-underline transition-colors hover:text-[#1B4D35]"
          href="/for-donors"
        >
          For donors
        </Link>
        <Link
          className="rounded-[6px] bg-[#1B4D35] px-[22px] py-[9px] text-[14px] font-semibold text-white no-underline transition duration-200 hover:-translate-y-px hover:bg-[#236645]"
          href="/login?intent=ministry&redirectTo=%2Fportal%2Finquiry"
        >
          Apply now →
        </Link>
      </div>
    </nav>
  );
}
