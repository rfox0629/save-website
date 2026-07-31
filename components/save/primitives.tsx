import Link from "next/link";
import type { ComponentProps, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ==========================================================================
   SAVE primitives
   Every redesigned screen composes from this file. If a screen needs a shape
   that is not here, the shape belongs here first.
   ========================================================================== */

/* --------------------------------------------------------------- Surface -- */

export type CardProps = {
  children: ReactNode;
  className?: string;
  /** Anchor target, so in-page tabs can jump to a card. */
  id?: string;
  /** `flat` for dense lists, `raised` for standalone cards, `seal` for verified. */
  tone?: "flat" | "raised" | "seal" | "sunken";
  as?: ElementType;
};

export function Card({
  as: Tag = "div",
  children,
  className,
  id,
  tone = "raised",
}: CardProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "rounded-xl border",
        tone === "flat" && "border-hairline bg-surface",
        tone === "raised" && "border-hairline bg-surface shadow-e2",
        tone === "sunken" && "border-hairline bg-surface-sunken",
        tone === "seal" &&
          "border-brass-200 bg-brass-50 shadow-[0_1px_2px_rgba(138,99,24,0.06)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  action,
  children,
  className,
  description,
  title,
}: {
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 border-b border-hairline px-6 py-5",
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink-900">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 max-w-prose text-sm text-ink-500">{description}</p>
        ) : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className,
  flush = false,
}: {
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return <div className={cn(!flush && "px-6 py-5", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-surface-sunken px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* --------------------------------------------------------------- Buttons -- */

const BUTTON_BASE =
  "save-focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-all duration-200 ease-save disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0";

const BUTTON_VARIANT = {
  primary:
    "bg-ink-700 text-paper-50 shadow-e1 hover:bg-ink-800 active:translate-y-px",
  secondary:
    "border border-hairline-strong bg-surface text-ink-800 shadow-e1 hover:border-ink-300 hover:bg-paper-100 active:translate-y-px",
  ghost: "text-ink-600 hover:bg-ink-50 hover:text-ink-800",
  brass:
    "bg-brass-700 text-paper-50 shadow-e1 hover:bg-brass-800 active:translate-y-px",
  quiet: "text-ink-500 hover:text-ink-800 underline underline-offset-4",
  danger:
    "border border-risk-100 bg-risk-50 text-risk-700 hover:bg-risk-100 active:translate-y-px",
} as const;

const BUTTON_SIZE = {
  sm: "h-8 px-3 text-caption",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

export type ButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  size?: keyof typeof BUTTON_SIZE;
  variant?: keyof typeof BUTTON_VARIANT;
} & Omit<ComponentProps<"button">, "size">;

export function Btn({
  children,
  className,
  href,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = cn(
    BUTTON_BASE,
    BUTTON_VARIANT[variant],
    BUTTON_SIZE[size],
    className,
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type="button" {...props}>
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- Status -- */

const BADGE_TONE = {
  neutral: "border-hairline bg-surface-sunken text-ink-600",
  ink: "border-ink-200 bg-ink-50 text-ink-700",
  sage: "border-sage-100 bg-sage-50 text-sage-700",
  brass: "border-brass-200 bg-brass-50 text-brass-700",
  clay: "border-clay-100 bg-clay-50 text-clay-700",
  risk: "border-risk-100 bg-risk-50 text-risk-700",
} as const;

export type BadgeTone = keyof typeof BADGE_TONE;

export function Badge({
  children,
  className,
  dot = false,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  dot?: boolean;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-[3px] text-caption font-semibold",
        BADGE_TONE[tone],
        className,
      )}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      ) : null}
      {children}
    </span>
  );
}

/**
 * The verification mark. This is the only place brass is allowed to carry
 * meaning, and it always means "SAVE assessed this."
 */
export function TrustSeal({
  className,
  size = "md",
  tier,
  year,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tier: string;
  year?: number | string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border border-brass-200 bg-brass-50 font-semibold text-brass-700",
        size === "sm" && "px-2 py-1 text-micro",
        size === "md" && "px-2.5 py-1.5 text-caption",
        size === "lg" && "px-3 py-2 text-sm",
        className,
      )}
    >
      <SealMark
        className={cn(
          size === "sm" && "h-3 w-3",
          size === "md" && "h-3.5 w-3.5",
          size === "lg" && "h-4 w-4",
        )}
      />
      <span className="tracking-[0.02em]">{tier}</span>
      {year ? (
        <span className="save-numeric font-medium text-brass-700 opacity-80">
          {year}
        </span>
      ) : null}
    </span>
  );
}

export function SealMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        d="M8 1 2.5 3.2v4.4c0 3.3 2.3 6.4 5.5 7.4 3.2-1 5.5-4.1 5.5-7.4V3.2L8 1Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M8 1 2.5 3.2v4.4c0 3.3 2.3 6.4 5.5 7.4 3.2-1 5.5-4.1 5.5-7.4V3.2L8 1Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.2"
      />
      <path
        d="m5.6 8 1.7 1.7 3.2-3.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ------------------------------------------------------------ Typography -- */

export function PageTitle({
  actions,
  children,
  description,
  eyebrow,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="save-eyebrow mb-2.5 text-brass-700">{eyebrow}</p>
        ) : null}
        <h1 className="save-display text-display-md font-semibold text-ink-900">
          {children}
        </h1>
        {description ? (
          <p className="mt-2 max-w-prose text-base text-ink-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </div>
  );
}

export function SectionTitle({
  action,
  children,
  description,
}: {
  action?: ReactNode;
  children: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-title font-semibold text-ink-900">{children}</h2>
        {description ? (
          <p className="mt-1 max-w-prose text-sm text-ink-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ Data -- */

/** A single figure. Used across every portal so numbers always read alike. */
export function Stat({
  caption,
  delta,
  label,
  value,
}: {
  caption?: ReactNode;
  delta?: { direction: "up" | "down" | "flat"; label: string };
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="save-eyebrow text-ink-400">{label}</p>
      <p className="save-numeric save-display mt-2.5 text-display-sm font-semibold text-ink-900">
        {value}
      </p>
      {delta ? (
        <p
          className={cn(
            "mt-1.5 inline-flex items-center gap-1 text-caption font-medium",
            delta.direction === "up" && "text-sage-600",
            delta.direction === "down" && "text-clay-600",
            delta.direction === "flat" && "text-ink-400",
          )}
        >
          {delta.direction === "up"
            ? "↑"
            : delta.direction === "down"
              ? "↓"
              : "—"}
          {delta.label}
        </p>
      ) : null}
      {caption ? (
        <p className="mt-1.5 text-caption text-ink-400">{caption}</p>
      ) : null}
    </div>
  );
}

export function StatRow({ children }: { children: ReactNode }) {
  return (
    <Card className="grid grid-cols-2 gap-x-6 gap-y-7 px-6 py-6 md:grid-cols-4">
      {children}
    </Card>
  );
}

/** Horizontal progress. Doubles as an assessment-completeness meter. */
export function Meter({
  label,
  tone = "ink",
  value,
  valueLabel,
}: {
  label?: ReactNode;
  tone?: "ink" | "sage" | "brass" | "clay";
  value: number;
  valueLabel?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div>
      {label || valueLabel ? (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-caption font-medium text-ink-600">{label}</span>
          <span className="save-numeric text-caption font-semibold text-ink-800">
            {valueLabel ?? `${pct}%`}
          </span>
        </div>
      ) : null}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-300">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-save",
            tone === "ink" && "bg-ink-700",
            tone === "sage" && "bg-sage-600",
            tone === "brass" && "bg-brass-500",
            tone === "clay" && "bg-clay-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** The SAVE score, rendered as a ring. Restrained, never gamified. */
export function ScoreDial({
  label,
  score,
  size = 132,
}: {
  label?: ReactNode;
  score: number;
  size?: number;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const stroke =
    score >= 85
      ? "var(--save-sage-600)"
      : score >= 70
        ? "var(--save-brass-500)"
        : "var(--save-clay-600)";

  return (
    <div className="relative shrink-0" style={{ height: size, width: size }}>
      <svg
        className="-rotate-90"
        height={size}
        viewBox="0 0 128 128"
        width={size}
      >
        <circle
          cx="64"
          cy="64"
          fill="none"
          r={radius}
          stroke="var(--save-paper-300)"
          strokeWidth="8"
        />
        <circle
          cx="64"
          cy="64"
          fill="none"
          r={radius}
          stroke={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="save-numeric save-display text-display-sm font-semibold leading-none text-ink-900">
          {score}
        </span>
        {label ? (
          <span className="save-eyebrow mt-1.5 text-ink-400">{label}</span>
        ) : null}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Lists -- */

export function DataList({ children }: { children: ReactNode }) {
  return <dl className="divide-y divide-hairline">{children}</dl>;
}

export function DataRow({
  label,
  value,
}: {
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="save-numeric text-sm font-medium text-ink-900">{value}</dd>
    </div>
  );
}

/* ---------------------------------------------------------------- Tables -- */

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        {children}
      </table>
    </div>
  );
}

export function Th({
  align = "left",
  children,
}: {
  align?: "left" | "right";
  children?: ReactNode;
}) {
  return (
    <th
      className={cn(
        "save-eyebrow border-b border-hairline px-6 py-3 font-semibold text-ink-400",
        align === "right" && "text-right",
      )}
      scope="col"
    >
      {children}
    </th>
  );
}

export function Td({
  align = "left",
  children,
  className,
  numeric = false,
}: {
  align?: "left" | "right";
  children?: ReactNode;
  className?: string;
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "border-b border-hairline px-6 py-4 align-middle text-sm text-ink-700",
        align === "right" && "text-right",
        numeric && "save-numeric",
        className,
      )}
    >
      {children}
    </td>
  );
}

/* ----------------------------------------------------------------- Forms -- */

export function Field({
  children,
  help,
  hint,
  label,
  required = false,
}: {
  children: ReactNode;
  help?: ReactNode;
  hint?: ReactNode;
  label: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink-800">
          {label}
          {required ? (
            <span className="ml-1 text-brass-700" title="Required">
              *
            </span>
          ) : null}
        </span>
        {hint ? (
          <span className="text-caption text-ink-400">{hint}</span>
        ) : null}
      </div>
      {children}
      {help ? <p className="mt-1.5 text-caption text-ink-400">{help}</p> : null}
    </label>
  );
}

const CONTROL =
  "save-focus-ring w-full rounded-md border border-hairline-strong bg-surface px-3.5 text-sm text-ink-900 shadow-e1 transition placeholder:text-ink-300 hover:border-ink-300";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cn(CONTROL, "h-10", props.className)} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return (
    <textarea {...props} className={cn(CONTROL, "py-2.5", props.className)} />
  );
}

export function Select(props: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={cn(CONTROL, "h-10 appearance-none pr-9", props.className)}
    />
  );
}

/* -------------------------------------------------------------- Feedback -- */

export function Callout({
  children,
  className,
  title,
  tone = "ink",
}: {
  children?: ReactNode;
  className?: string;
  title?: ReactNode;
  tone?: "ink" | "sage" | "brass" | "clay" | "risk";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border-l-2 px-5 py-4",
        tone === "ink" && "border-l-ink-600 bg-ink-50",
        tone === "sage" && "border-l-sage-600 bg-sage-50",
        tone === "brass" && "border-l-brass-500 bg-brass-50",
        tone === "clay" && "border-l-clay-500 bg-clay-50",
        tone === "risk" && "border-l-risk-600 bg-risk-50",
        className,
      )}
    >
      {title ? (
        <p className="text-sm font-semibold text-ink-900">{title}</p>
      ) : null}
      {children ? (
        <div className={cn("text-sm text-ink-600", title && "mt-1")}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface-sunken text-ink-300">
        <SealMark className="h-5 w-5" />
      </div>
      <p className="text-base font-semibold text-ink-800">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------- Wayfinding */

export function Tabs({
  items,
}: {
  items: { active?: boolean; count?: number; href: string; label: string }[];
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-hairline">
      {items.map((item) => (
        <Link
          className={cn(
            "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-3 text-sm font-medium transition",
            item.active
              ? "border-b-ink-700 text-ink-900"
              : "border-b-transparent text-ink-500 hover:border-b-ink-200 hover:text-ink-700",
          )}
          href={item.href}
          key={item.href}
        >
          {item.label}
          {typeof item.count === "number" ? (
            <span
              className={cn(
                "save-numeric rounded-sm px-1.5 py-0.5 text-micro font-semibold",
                item.active
                  ? "bg-ink-100 text-ink-700"
                  : "bg-surface-sunken text-ink-400",
              )}
            >
              {item.count}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

/** Multi-step journey indicator. Ministry onboarding + assessment use this. */
export function Steps({
  steps,
}: {
  steps: { label: string; state: "done" | "current" | "todo"; meta?: string }[];
}) {
  return (
    <ol className="flex flex-col gap-0 md:flex-row md:gap-0">
      {steps.map((step, index) => (
        <li
          className="relative flex flex-1 gap-3.5 pb-6 md:flex-col md:pb-0 md:pr-6"
          key={step.label}
        >
          <div className="flex flex-col items-center md:w-full md:flex-row">
            <span
              className={cn(
                "z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-caption font-semibold",
                step.state === "done" &&
                  "border-sage-600 bg-sage-600 text-paper-50",
                step.state === "current" &&
                  "border-ink-700 bg-surface text-ink-800 ring-4 ring-ink-100",
                step.state === "todo" &&
                  "border-hairline-strong bg-surface text-ink-300",
              )}
            >
              {step.state === "done" ? (
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 14 14"
                  aria-hidden="true"
                >
                  <path
                    d="m3 7.2 2.8 2.8L11 4.4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            {index < steps.length - 1 ? (
              <span
                className={cn(
                  "absolute left-[13px] top-7 h-full w-px md:left-auto md:top-[13px] md:ml-3 md:h-px md:w-[calc(100%-28px)] md:flex-1",
                  step.state === "done" ? "bg-sage-500" : "bg-paper-300",
                )}
              />
            ) : null}
          </div>
          <div className="min-w-0 md:mt-3">
            <p
              className={cn(
                "text-sm font-semibold",
                step.state === "todo" ? "text-ink-400" : "text-ink-900",
              )}
            >
              {step.label}
            </p>
            {step.meta ? (
              <p className="mt-0.5 text-caption text-ink-400">{step.meta}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Avatar / ministry monogram. No photo dependency. */
export function Monogram({
  className,
  name,
  size = "md",
  tone = "ink",
}: {
  className?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "ink" | "sage" | "brass" | "clay";
}) {
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={cn(
        "save-display inline-flex shrink-0 items-center justify-center rounded-lg font-semibold",
        size === "sm" && "h-8 w-8 text-caption",
        size === "md" && "h-11 w-11 text-base",
        size === "lg" && "h-14 w-14 text-title",
        size === "xl" && "h-20 w-20 text-display-sm",
        tone === "ink" && "bg-ink-100 text-ink-700",
        tone === "sage" && "bg-sage-100 text-sage-700",
        tone === "brass" && "bg-brass-100 text-brass-700",
        tone === "clay" && "bg-clay-100 text-clay-700",
        className,
      )}
    >
      {initials || "SV"}
    </span>
  );
}

/* -------------------------------------------------------------- Utilities -- */

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-t border-hairline", className)} />;
}

export function formatMoney(
  amount: number,
  { cents = false }: { cents?: boolean } = {},
) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: cents ? 2 : 0,
    minimumFractionDigits: cents ? 2 : 0,
    style: "currency",
  }).format(amount);
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
