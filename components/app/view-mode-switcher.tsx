"use client";

import { useRouter } from "next/navigation";

import {
  getViewModeDestination,
  VIEW_MODE_COOKIE,
  type ViewMode,
} from "@/lib/view-mode-shared";

type ViewModeSwitcherProps = {
  canPreview: boolean;
  currentViewMode: ViewMode;
};

export function ViewModeSwitcher({
  canPreview,
  currentViewMode,
}: ViewModeSwitcherProps) {
  const router = useRouter();

  if (!canPreview) {
    return null;
  }

  function setViewMode(mode: ViewMode) {
    document.cookie = `${VIEW_MODE_COOKIE}=${mode}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    router.push(getViewModeDestination(mode));
    router.refresh();
  }

  return (
    <div className="flex items-center">
      <label className="flex items-center gap-2 text-sm text-[#5E6C62]">
        <span>Viewing as:</span>
        <select
          aria-label="Select preview mode"
          className="rounded-full border border-[#D8D1C3] bg-[#FFFDF8] px-3 py-2 text-sm font-semibold text-[#1B4D35] outline-none transition focus:border-[#1B4D35] focus:ring-2 focus:ring-[#1B4D35]/10"
          onChange={(event) => setViewMode(event.target.value as ViewMode)}
          value={currentViewMode}
        >
          <option value="admin">Admin</option>
          <option value="donor">Donor</option>
          <option value="ministry">Ministry</option>
        </select>
      </label>
    </div>
  );
}
