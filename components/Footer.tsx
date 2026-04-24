import Link from "next/link";

import { SaveBrand } from "@/components/Nav";

export default function Footer() {
  return (
    <footer className="bg-[#0E2E5C] px-6 pb-10 pt-14 md:px-[52px]">
      <div className="mb-12 flex flex-col gap-10 border-b border-[rgba(255,255,255,0.12)] pb-12 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="[&_svg_path:first-child]:fill-[#0E2E5C] [&_svg_path:nth-child(2)]:fill-[#1A4480]">
            <div className="flex items-center gap-[10px]">
              <SaveBrand
                subtextClassName="text-[rgba(255,255,255,0.58)]"
                textClassName="text-white"
              />
            </div>
          </div>
          <div className="mt-2 text-[13px] text-[rgba(255,255,255,0.5)]">
            Clarity for Kingdom Giving
          </div>
          <div className="mt-2 text-[13px] text-[rgba(255,255,255,0.5)]">
            SAVE: System for Assessing &amp; Verifying Effectiveness
          </div>
          <div className="mt-2 text-[13px] text-[rgba(255,255,255,0.5)]">
            Serving ministries and donors for over 30 years.
          </div>
        </div>

        <div className="flex flex-wrap gap-8 md:gap-16">
          <div>
            <h5 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F5C842]">
              Platform
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link
                  className="text-[14px] text-[rgba(255,255,255,0.6)] no-underline transition-colors hover:text-white"
                  href="/#how"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  className="text-[14px] text-[rgba(255,255,255,0.6)] no-underline transition-colors hover:text-white"
                  href="/#model"
                >
                  The model
                </Link>
              </li>
              <li>
                <Link
                  className="text-[14px] text-[rgba(255,255,255,0.6)] no-underline transition-colors hover:text-white"
                  href="/for-donors"
                >
                  Verified ministries
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F5C842]">
              Apply
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link
                  className="text-[14px] text-[rgba(255,255,255,0.6)] no-underline transition-colors hover:text-white"
                  href="/for-ministries"
                >
                  For ministries
                </Link>
              </li>
              <li>
                <Link
                  className="text-[14px] text-[rgba(255,255,255,0.6)] no-underline transition-colors hover:text-white"
                  href="/for-donors"
                >
                  For donors
                </Link>
              </li>
              <li>
                <Link
                  className="text-[14px] text-[rgba(255,255,255,0.6)] no-underline transition-colors hover:text-white"
                  href="/login?intent=ministry&redirectTo=%2Fportal%2Finquiry"
                >
                  Start application
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-[#F5C842]">
              About
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link
                  className="text-[14px] text-[rgba(255,255,255,0.6)] no-underline transition-colors hover:text-white"
                  href="/about"
                >
                  Our mission
                </Link>
              </li>
              <li>
                <Link
                  className="text-[14px] text-[rgba(255,255,255,0.6)] no-underline transition-colors hover:text-white"
                  href="/login?intent=donor"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="font-mono text-[12px] text-[rgba(255,255,255,0.35)]">
          © 2026 SAVE Foundation. All rights reserved
        </div>
        <div className="text-[12px] text-[rgba(255,255,255,0.35)]">
          No ministry pays for a recommendation.
        </div>
      </div>
    </footer>
  );
}
