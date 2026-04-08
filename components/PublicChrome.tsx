"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

export default function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBriefPage =
    pathname.startsWith("/brief/") ||
    (pathname.startsWith("/donors/") && pathname !== "/donors/request-access");

  return (
    <>
      {!isBriefPage ? <Nav /> : null}
      {children}
      {!isBriefPage ? <Footer /> : null}
    </>
  );
}
