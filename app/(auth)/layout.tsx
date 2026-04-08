import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-auth-serif",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-auth-sans",
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${lora.variable} ${plusJakartaSans.variable} min-h-screen bg-[#F9F6F0] font-[family-name:var(--font-auth-sans)] text-[#1B4D35]`}
    >
      {children}
    </div>
  );
}
