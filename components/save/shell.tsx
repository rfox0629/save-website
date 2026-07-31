import Link from "next/link";
import type { ReactNode } from "react";

import { Badge, Monogram, SealMark } from "@/components/save/primitives";
import { cn } from "@/lib/utils";

/* ==========================================================================
   SAVE application shell
   One shell, three portals. Donor, Ministry and Staff differ only by the nav
   config passed in — never by bespoke layout code.
   ========================================================================== */

export type NavItem = {
  active?: boolean;
  badge?: number | string;
  href: string;
  icon: ReactNode;
  label: string;
};

export type NavGroup = {
  items: NavItem[];
  label?: string;
};

export type ShellPersona = "donor" | "ministry" | "staff";

const PERSONA_LABEL: Record<ShellPersona, string> = {
  donor: "Donor",
  ministry: "Ministry",
  staff: "SAVE Staff",
};

/* ------------------------------------------------------------------ Brand -- */

export function SaveWordmark({
  className,
  inverse = false,
  sublabel,
}: {
  className?: string;
  inverse?: boolean;
  sublabel?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md",
          inverse
            ? "bg-paper-50/10 text-brass-400"
            : "bg-ink-900 text-brass-400",
        )}
      >
        <SealMark className="h-[18px] w-[18px]" />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "save-display block text-lg font-semibold tracking-[0.02em]",
            inverse ? "text-paper-50" : "text-ink-900",
          )}
        >
          SAVE
        </span>
        {sublabel ? (
          <span
            className={cn(
              "save-eyebrow mt-1 block",
              inverse ? "text-paper-50/50" : "text-ink-400",
            )}
          >
            {sublabel}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/* -------------------------------------------------------------- Side rail -- */

function SideNav({
  footer,
  groups,
  persona,
}: {
  footer?: ReactNode;
  groups: NavGroup[];
  persona: ShellPersona;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-6">
        <Link href="/preview">
          <SaveWordmark sublabel={PERSONA_LABEL[persona]} />
        </Link>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-6">
        {groups.map((group, index) => (
          <div key={group.label ?? index}>
            {group.label ? (
              <p className="save-eyebrow mb-2 px-2.5 text-ink-400">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition duration-150",
                      item.active
                        ? "bg-ink-100 text-ink-900"
                        : "text-ink-500 hover:bg-paper-200 hover:text-ink-800",
                    )}
                    href={item.href}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center [&_svg]:h-4 [&_svg]:w-4",
                        item.active
                          ? "text-ink-700"
                          : "text-ink-300 group-hover:text-ink-500",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          "save-numeric rounded-sm px-1.5 py-0.5 text-micro font-semibold",
                          item.active
                            ? "bg-ink-200 text-ink-800"
                            : "bg-surface-sunken text-ink-500",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {footer ? (
        <div className="border-t border-hairline p-3">{footer}</div>
      ) : null}
    </div>
  );
}

function AccountChip({
  name,
  role,
  tone = "ink",
}: {
  name: string;
  role: string;
  tone?: "ink" | "sage" | "brass";
}) {
  return (
    <button
      className="save-focus-ring flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition hover:bg-paper-200"
      type="button"
    >
      <Monogram name={name} size="sm" tone={tone} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-caption font-semibold text-ink-800">
          {name}
        </span>
        <span className="block truncate text-micro font-medium uppercase tracking-[0.08em] text-ink-400">
          {role}
        </span>
      </span>
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0 text-ink-300"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          d="M4.5 5.5 7 3l2.5 2.5M4.5 8.5 7 11l2.5-2.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.3"
        />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ Shell -- */

export function AppShell({
  account,
  children,
  groups,
  persona,
  topBar,
}: {
  account: { name: string; role: string };
  children: ReactNode;
  groups: NavGroup[];
  persona: ShellPersona;
  topBar?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper-100">
      {/* Mobile: the rail collapses to a bottom tab bar (see MobileTabBar). */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-rail border-r border-hairline bg-paper-50 lg:block">
        <SideNav
          footer={
            <AccountChip
              name={account.name}
              role={account.role}
              tone={
                persona === "donor"
                  ? "brass"
                  : persona === "ministry"
                    ? "sage"
                    : "ink"
              }
            />
          }
          groups={groups}
          persona={persona}
        />
      </aside>

      <div className="lg:pl-rail">
        <MobileBar account={account} groups={groups} persona={persona} />
        {topBar}
        <main className="mx-auto max-w-shell px-5 pb-24 pt-7 md:px-8 lg:px-10 lg:pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Mobile chrome. A single sticky header plus a scrollable nav strip keeps the
 * same IA on small screens without a hamburger that hides the whole product.
 */
function MobileBar({
  account,
  groups,
  persona,
}: {
  account: { name: string; role: string };
  groups: NavGroup[];
  persona: ShellPersona;
}) {
  const items = groups.flatMap((group) => group.items);

  return (
    <div className="bg-paper-50/95 sticky top-0 z-20 border-b border-hairline backdrop-blur lg:hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <SaveWordmark sublabel={PERSONA_LABEL[persona]} />
        <Monogram name={account.name} size="sm" />
      </div>
      <div className="flex gap-1 overflow-x-auto px-3 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Link
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-1.5 text-caption font-semibold transition",
              item.active
                ? "bg-ink-100 text-ink-900"
                : "text-ink-500 hover:bg-paper-200",
            )}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Contextual page bar: breadcrumb + page-level actions. */
export function TopBar({
  actions,
  breadcrumb,
  status,
}: {
  actions?: ReactNode;
  breadcrumb: { href?: string; label: string }[];
  status?: ReactNode;
}) {
  return (
    <div className="bg-paper-100/90 sticky top-0 z-10 hidden border-b border-hairline backdrop-blur lg:block">
      <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-10 py-3.5">
        <nav className="flex min-w-0 items-center gap-2 text-caption">
          {breadcrumb.map((crumb, index) => (
            <span className="flex items-center gap-2" key={crumb.label}>
              {index > 0 ? (
                <span className="text-ink-300" aria-hidden="true">
                  /
                </span>
              ) : null}
              {crumb.href ? (
                <Link
                  className="truncate font-medium text-ink-500 transition hover:text-ink-800"
                  href={crumb.href}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate font-semibold text-ink-800">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
          {status ? <span className="ml-1.5">{status}</span> : null}
        </nav>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

/* --------------------------------------------------------- Public chrome -- */

export function PublicShell({
  children,
  cta,
  nav,
}: {
  children: ReactNode;
  cta?: ReactNode;
  nav: { active?: boolean; href: string; label: string }[];
}) {
  return (
    <div className="min-h-screen bg-paper-100">
      <header className="bg-paper-100/90 sticky top-0 z-30 border-b border-hairline backdrop-blur-md">
        <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-5 py-4 md:px-8">
          <Link href="/preview/library">
            <SaveWordmark sublabel="The SAVE Standard" />
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {nav.map((item) => (
              <Link
                className={cn(
                  "text-sm font-medium transition",
                  item.active
                    ? "text-ink-900"
                    : "text-ink-500 hover:text-ink-800",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">{cta}</div>
        </div>
      </header>
      {children}
      <PublicFooter />
    </div>
  );
}

function PublicFooter() {
  return (
    <footer className="mt-section border-t border-hairline bg-paper-200">
      <div className="mx-auto max-w-content px-5 py-12 md:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <SaveWordmark sublabel="The SAVE Standard" />
            <p className="mt-4 text-sm leading-relaxed text-ink-500">
              SAVE assesses Christian ministries against a single published
              standard so donors can give with conviction and ministries can be
              known for their fruit.
            </p>
            <Badge className="mt-5" tone="sage">
              No ministry pays for a recommendation
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {[
              {
                links: [
                  "Ministry library",
                  "The standard",
                  "How assessment works",
                ],
                title: "Discover",
              },
              {
                links: ["For donors", "Request access", "Annual statements"],
                title: "Give",
              },
              {
                links: ["For ministries", "Apply", "Assessment guide"],
                title: "Serve",
              },
            ].map((column) => (
              <div key={column.title}>
                <p className="save-eyebrow mb-3.5 text-brass-600">
                  {column.title}
                </p>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link}>
                      <span className="text-sm text-ink-500 transition hover:text-ink-800">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-hairline pt-6 text-caption text-ink-400 md:flex-row">
          <span>© 2026 SAVE Foundation</span>
          <span>Serving ministries and donors for over 30 years</span>
        </div>
      </div>
    </footer>
  );
}
