# USA-133 · Current UX audit

What follows is an assessment of the SAVE platform as it stands on
`rescue/save-website-local-work-20260727`. Counts are measured against
`app/` and `components/`, not estimated.

---

## 1. There are three visual systems in one product

The application loads three unrelated font pairings and three unrelated
palettes depending on which route you land on.

| Layer | Fonts | Background | Text |
|---|---|---|---|
| `app/layout.tsx` (root) | Geist Sans / Geist Mono | shadcn `--background` (pure white) | shadcn `--foreground` |
| `app/(public)/layout.tsx` | DM Sans / Playfair Display | `#F9F6F0` | `#0E2E5C` |
| `app/(auth)/layout.tsx` | Plus Jakarta Sans / Lora | `#F9F6F0` | `#1A4480` |

A donor who moves from the marketing site to their dashboard crosses two
typographic systems in one click. Nothing about that reads as one company.

## 2. The design tokens exist and are almost entirely bypassed

`app/globals.css` defines a complete OKLCH token set and `tailwind.config.ts`
maps it to semantic Tailwind colours. Then the screens ignore it:

- **1,352 hardcoded hex colour occurrences** across `app/` and `components/`
- **96 distinct hex values**

The most-repeated are `#1A4480` (333×), `#7088A5` (136×), `#D8D1C3` (98×),
`#FFFDF8` (68×), `#0B1622` (53×). Six files carry more than fifty hex literals
each; `app/(public)/page.tsx` alone has 130.

Changing the brand navy today means a find-and-replace across 333 sites with no
guarantee of catching every shade that was meant to move with it.

## 3. Tailwind's stock palette leaks in alongside the brand palette

Status colours are drawn from Tailwind defaults — cold, generic, and clashing
with the warm cream brand surface:

```
52×  text-slate-300      11×  border-amber-200     9×  bg-rose-50
35×  text-slate-400       9×  border-rose-200      9×  bg-amber-50
14×  text-slate-200       8×  border-blue-200      8×  bg-blue-50
```

`app/(auth)/dashboard/page.tsx` maps application status to `blue-50`,
`sky-50`, `rose-50`, `amber-50` and `stone-50`. None of these are SAVE colours.

## 4. No shared shape language

- **20+ distinct border radii**: `rounded-full` (105×), `rounded-2xl` (102×),
  `rounded-[32px]` (42×), `rounded-[2rem]` (29×), `rounded-[28px]` (29×),
  `rounded-[24px]` (22×), `rounded-[1.75rem]`, `rounded-[30px]`, `rounded-[14px]`…
- **25 distinct one-off shadow values**, mostly large and soft:
  `0_18px_40px`, `0_16px_40px`, `0_24px_60px`, `0_12px_32px`.

The heavy blur reads as 2019 "soft UI", not as a financial institution.

## 5. The component library is three files

`components/ui/` contains `button.tsx`, `app-toaster.tsx`, `page-skeleton.tsx`.
Everything else is bespoke per screen. The consequences show up as size:

| File | Lines |
|---|---:|
| `components/forms/vetting-form.tsx` | 1,493 |
| `components/forms/inquiry-form.tsx` | 1,144 |
| `app/(auth)/applications/[id]/page.tsx` | 874 |
| `components/dashboard/voice-alignment-manager.tsx` | 832 |
| `app/(public)/page.tsx` | 716 |

23,475 lines across `app/`, `components/` and `lib/`. Two form files account
for 2,637 of them, largely duplicated markup.

## 6. The internal portal is dark — and it is the whole staff experience

`#0B1622` appears 53 times across twelve files. Those files are not a corner
of the product; they are the SAVE staff surface in its entirety:

```
app/(auth)/applications/[id]/page.tsx
app/(auth)/applications/[id]/brief/page.tsx
app/(auth)/applications/compare/page.tsx
app/(auth)/admin/donor-requests/page.tsx
components/dashboard/review-tools.tsx
components/dashboard/voice-alignment-manager.tsx
components/dashboard/admin-donor-requests-table.tsx
components/brief/brief-editor.tsx
components/brief/brief-preview.tsx
components/brief/score-summary-card.tsx
components/compare/nonprofit-compare.tsx
components/ui/page-skeleton.tsx
```

`lib/save-tier.ts` even ships a `theme: "dark" | "light"` fork so tier badges
render twice. This is the surface the founder identified as wrong, and the
audit agrees: it is the single largest visual liability in the product.

## 7. Navigation is not navigation

There is no persistent application shell anywhere in the product.

- **Ministry portal** (`components/portal/ministry-nav.tsx`): four pills
  floating in a rounded card — Overview, Inquiry, Complete Application,
  Documents. No breadcrumbs, no account menu, no progress indication.
- **Donor portal** (`components/donors/donor-nav.tsx`): **one link.** The
  entire donor navigation is a single "Verified Ministries" pill, an email
  address, and a sign-out button.
- **Staff**: no nav component at all. `/dashboard`, `/applications/[id]`,
  `/admin/donor-requests` and `/map` are reachable only by knowing the URL.

`/map` exists as an internal route-listing page. A sitemap shipped as a product
feature is a navigation failure with a workaround attached.

## 8. The donor experience is a diligence terminal, not a relationship

`components/dashboard/donor-home.tsx` (520 lines) renders published briefs as
comparison cards: tier badge, recommendation pill, risk-flag pill, alignment
label, truncated "signals". The language is investment committee:

> "Suitable for meaningful capital investment."
> "Not suited for capital deployment now."

Measured against the brief, the donor portal is missing:

| Required | Present today |
|---|---|
| Browse ministries | Partial — a brief list |
| Follow ministries | **Absent** |
| Receive updates | **Absent** |
| Track giving | **Absent** |
| Annual statements | **Absent** |
| Read testimonies | **Absent** |
| See impact | **Absent** |
| Prayer requests | **Absent** |
| Save favourites | **Absent** |

Eight of nine donor capabilities do not exist. What exists is a comparison
tool, and comparison is exactly the transactional framing to avoid.

## 9. The ministry portal is a form queue, not a journey

Four routes: `/portal`, `/portal/inquiry`, `/portal/application`,
`/portal/documents`. The assessment is one 1,493-line form. Against the brief:

| Required | Present today |
|---|---|
| Onboarding | Minimal — a welcome flag on `/portal` |
| Assessment progress | A six-step timeline with animated ping |
| Evidence collection | `ministry-document-center.tsx`, upload only |
| Findings | **Absent** |
| Roadmap | **Absent** |
| Implementation | **Absent** |
| Profile editing | **Absent** |
| Testimonies | **Absent** |
| Reports | **Absent** |
| Donor updates | **Absent** |

A ministry currently has no way to see what SAVE concluded about it, no way to
act on it, and no way to speak to its donors.

## 10. The staff portal has no operating system

`/dashboard` is a filtered table with three query parameters. Reviewer
assignment exists only as an API route (`assign-reviewer`) with no UI to drive
it. There is no queue triage, no SLA visibility, no publishing workflow, no
audit view, no leader health, and no donor visibility.

## 11. Smaller defects

- `app/layout.tsx` ships placeholder metadata to production: title
  `"Save Website"`, description `"Project scaffold for Save Website"`.
- Text glyphs used as interface: `✓` rendered as a `<div>` for completed steps,
  `→` inside button labels.
- The current-step indicator in `/portal` uses `animate-ping` — a pulsing halo
  on a status dot, which reads as an alert rather than a state.
- `lib/save-tier.ts` returns Tailwind class strings from a domain module,
  binding business logic to presentation.

---

## Summary

The product does not have a design problem in the decorative sense. It has
**no design system**: 96 colours, 20 radii, 25 shadows, three font pairings,
three background colours and three component files. Every screen re-derives the
interface from scratch, which is why the surfaces do not feel like one company
and why the two largest files are forms.

The redesign therefore starts with tokens and components, not with screens.
