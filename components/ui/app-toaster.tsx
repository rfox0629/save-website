"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      closeButton
      position="top-right"
      richColors
      toastOptions={{
        className:
          "!border-[#D8D1C3] !bg-[#FFFDF8] !text-[#1A4480] !shadow-[0_20px_60px_rgba(26,68,128,0.12)]",
      }}
    />
  );
}
