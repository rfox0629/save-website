import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge only knows Tailwind's stock scales. The SAVE design language
 * adds custom font sizes (`text-caption`, `text-title`, `text-display-md`…)
 * and custom colour scales (`text-ink-900`, `bg-paper-100`…). Without the
 * declarations below, twMerge cannot tell a size class from a colour class and
 * silently drops one of them — which stripped `text-paper-50` off primary
 * buttons and left navy text on a navy background.
 */
const SAVE_FONT_SIZES = [
  "micro",
  "label",
  "caption",
  "title",
  "display-sm",
  "display-md",
  "display-lg",
  "display-xl",
] as const;

const SAVE_COLORS = [
  "ink",
  "paper",
  "brass",
  "sage",
  "clay",
  "risk",
  "surface",
  "hairline",
] as const;

const SAVE_SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
  "raised",
  "sunken",
  "strong",
] as const;

const saveColorClasses = SAVE_COLORS.flatMap((color) => [
  color,
  ...SAVE_SHADES.map((shade) => `${color}-${shade}`),
]);

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...SAVE_FONT_SIZES] }],
      "text-color": [{ text: saveColorClasses }],
      "bg-color": [{ bg: saveColorClasses }],
      "border-color": [{ border: saveColorClasses }],
      shadow: [{ shadow: ["e1", "e2", "e3", "e4"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
