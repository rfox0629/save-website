import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import type { ReactNode } from "react";

/**
 * The redesigned SAVE surfaces.
 *
 * Fraunces carries warmth and editorial authority in headings; Inter carries
 * precision in the interface and, critically, tabular figures for money and
 * scores. This replaces the three unrelated font pairings currently running
 * across the public site, the portals and the internal tools.
 */
const saveDisplay = Fraunces({
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-save-display",
});

const saveSans = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-save-sans",
});

export const metadata: Metadata = {
  description:
    "The redesigned SAVE platform: public ministry library, donor portal, ministry portal and staff operating system.",
  title: {
    default: "SAVE — Design Preview",
    template: "%s · SAVE",
  },
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${saveDisplay.variable} ${saveSans.variable} save-root`}
    >
      {children}
    </div>
  );
}
