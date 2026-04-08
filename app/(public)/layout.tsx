import { DM_Sans, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

import PublicChrome from "@/components/PublicChrome";

const publicSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const publicSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-public-serif",
});

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${publicSans.variable} ${publicSerif.variable} font-public-sans bg-[#F9F6F0] text-[#1A2E20]`}
    >
      <PublicChrome>{children}</PublicChrome>
    </div>
  );
}
