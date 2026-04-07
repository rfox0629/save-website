import { DM_Sans } from "next/font/google";
import type { ReactNode } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-auth",
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${dmSans.variable} min-h-screen bg-[#0B1622] font-[family-name:var(--font-auth)] text-white`}
    >
      {children}
    </div>
  );
}
