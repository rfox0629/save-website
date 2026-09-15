import type { Config } from "tailwindcss";

/**
 * SAVE design language.
 *
 * The `save-*` scales are the redesign's single source of colour truth. The
 * shadcn semantic tokens below are kept so existing surfaces keep compiling
 * while screens migrate over.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "var(--save-ink-950)",
          900: "var(--save-ink-900)",
          800: "var(--save-ink-800)",
          700: "var(--save-ink-700)",
          600: "var(--save-ink-600)",
          500: "var(--save-ink-500)",
          400: "var(--save-ink-400)",
          300: "var(--save-ink-300)",
          200: "var(--save-ink-200)",
          100: "var(--save-ink-100)",
          50: "var(--save-ink-50)",
        },
        paper: {
          500: "var(--save-paper-500)",
          400: "var(--save-paper-400)",
          300: "var(--save-paper-300)",
          200: "var(--save-paper-200)",
          100: "var(--save-paper-100)",
          50: "var(--save-paper-50)",
        },
        brass: {
          800: "var(--save-brass-800)",
          700: "var(--save-brass-700)",
          600: "var(--save-brass-600)",
          500: "var(--save-brass-500)",
          400: "var(--save-brass-400)",
          200: "var(--save-brass-200)",
          100: "var(--save-brass-100)",
          50: "var(--save-brass-50)",
        },
        sage: {
          700: "var(--save-sage-700)",
          600: "var(--save-sage-600)",
          500: "var(--save-sage-500)",
          100: "var(--save-sage-100)",
          50: "var(--save-sage-50)",
        },
        clay: {
          700: "var(--save-clay-700)",
          600: "var(--save-clay-600)",
          500: "var(--save-clay-500)",
          100: "var(--save-clay-100)",
          50: "var(--save-clay-50)",
        },
        risk: {
          700: "var(--save-rose-700)",
          600: "var(--save-rose-600)",
          100: "var(--save-rose-100)",
          50: "var(--save-rose-50)",
        },
        surface: {
          DEFAULT: "var(--save-surface)",
          raised: "var(--save-surface-raised)",
          sunken: "var(--save-surface-sunken)",
        },
        hairline: {
          DEFAULT: "var(--save-hairline)",
          strong: "var(--save-hairline-strong)",
        },

        // --- Retained shadcn semantic tokens ---
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },

      fontFamily: {
        // `--font-save-sans` is scoped to redesigned surfaces; `--font-sans`
        // keeps legacy screens on Geist until they migrate.
        sans: [
          "var(--font-save-sans)",
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
        ],
        display: ["var(--font-save-display)", "ui-serif", "Georgia"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },

      /**
       * One scale. Every size below is paired with its line height and
       * tracking so no screen has to invent typography.
       */
      fontSize: {
        micro: ["11px", { lineHeight: "14px", letterSpacing: "0.1em" }],
        label: ["12px", { lineHeight: "16px", letterSpacing: "0.08em" }],
        caption: ["13px", { lineHeight: "18px" }],
        sm: ["13.5px", { lineHeight: "20px" }],
        base: ["15px", { lineHeight: "24px" }],
        lg: ["17px", { lineHeight: "26px" }],
        title: ["20px", { lineHeight: "28px", letterSpacing: "-0.011em" }],
        "display-sm": [
          "26px",
          { lineHeight: "32px", letterSpacing: "-0.016em" },
        ],
        "display-md": [
          "34px",
          { lineHeight: "40px", letterSpacing: "-0.019em" },
        ],
        "display-lg": [
          "44px",
          { lineHeight: "48px", letterSpacing: "-0.022em" },
        ],
        "display-xl": [
          "56px",
          { lineHeight: "60px", letterSpacing: "-0.025em" },
        ],
      },

      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },

      boxShadow: {
        e1: "var(--save-e1)",
        e2: "var(--save-e2)",
        e3: "var(--save-e3)",
        e4: "var(--save-e4)",
      },

      spacing: {
        gutter: "24px",
        "gutter-lg": "40px",
        section: "72px",
        rail: "252px",
      },

      maxWidth: {
        prose: "68ch",
        shell: "1400px",
        content: "1120px",
      },

      transitionTimingFunction: {
        save: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
