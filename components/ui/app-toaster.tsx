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
          "!border-[#D8D1C3] !bg-[#FFFDF8] !text-[#1B4D35] !shadow-[0_20px_60px_rgba(27,77,53,0.12)]",
      }}
    />
  );
}
