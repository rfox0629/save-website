# USA-133 — SAVE Standard Redesign: Founder Review Package

Branch: `usa-133/save-standard-redesign` · Status: prototype complete, no backend/Supabase/auth changes
Preview entry point: `/preview` (static fixtures, no login required — see `lib/preview/data.ts`)

This document is the prose companion to the working prototype already committed on this branch
(`app/save-design.css`, `components/save/*`, `app/(preview)/preview/**`). The prototype is the
primary deliverable; this package explains the reasoning, gaps, and decisions behind it so it can
be reviewed as a system rather than as 25 individual screens.

---

## 1. Current-state audit

**Public site** (`app/(public)/**`, `app/(marketing)/**` where present): warm, editorial, wheat/navy
brand marks, generous whitespace — the strongest asset on the property and the thing the redesign
had to inherit rather than compete with.

**Authenticated portals** (`app/(auth)/dashboard`, `app/(auth)/donors`, `app/(auth)/admin`, and
related routes): dark-background application shells, unrelated typography and spacing scale to the
public site, and no shared component vocabulary — each screen largely hand-rolls its own cards,
badges, and tables. Specific problems found:

- **Visual discontinuity.** A donor clicking from the light marketing site into `/donors` or the
  dashboard lands in a dark, dense, unrelated interface — it reads as a different, less trustworthy
  product, which directly undermines the trust-platform positioning in the issue brief.
- **No shared design tokens.** Colors, radii, and shadows are hardcoded per-screen (96 distinct hex
  values were found in the pre-redesign styling), so consistency drifts screen to screen.
- **No role-driven IA.** Navigation is largely per-page rather than a shared shell driven by role,
  making it hard to reason about what each of ministry/donor/staff can see.
- **Marketplace framing risk.** Existing donor-facing surfaces (e.g. `(public)/donors`,
  `(auth)/donors/compare`) lean transactional/comparison-shopping in tone, which conflicts with the
  issue's explicit direction that SAVE should feel relational, not like a crowdfunding marketplace.
- **No visible ministry journey.** There is no single place a ministry can see "where am I in the
  process" (applied → assessed → findings → roadmap → approved → visible to donors) — status is
  implicit rather than a first-class UI object.
- **No staff publishing gate.** Nothing in the current admin routes clearly models the moment a
  ministry becomes visible in a donor-facing library — visibility appears to be an implicit
  side-effect rather than a deliberate, staff-controlled action.
- **No differentiated privacy treatment** for sensitive leader-health data — it does not appear
  visually or structurally distinct from ordinary ministry records.

These are the problems the new design language and component system (`app/save-design.css`,
`components/save/`) and the 25-screen prototype are built to resolve.

## 2. Unified visual direction

One token set, `app/save-design.css`, shared by every surface:

- **Ink** (warm navy, `--save-ink-*`) — text, authority, primary actions. Replaces black/dark-gray
  application chrome.
- **Paper** (warm neutral, `--save-paper-*`) — the signature light surface. No pure white, no cold
  gray; every neutral carries warmth to match the public site's editorial feel.
- **Brass** (`--save-brass-*`) — reserved *exclusively* for verification/trust signals (the
  `TrustSeal` component, assessment completion). Because it is never used decoratively, it stays
  meaningful.
- **Sage / Clay / Rose** — status colors (healthy/on-track, needs attention, risk/declined) used
  consistently across all three portals so "clay" means the same thing in a ministry's evidence
  queue and a staff reviewer's dashboard.
- **Type**: Fraunces for display/editorial moments (continuity with the public site's headlines),
  Inter for UI text, tabular figures enforced on all money and scores.
- **One radius scale, four elevation levels** — replacing the 20+ ad hoc radii and 25 one-off
  shadows found in the current codebase.

This is implemented, not just specified — every prototype screen consumes these tokens through the
shared component library in `components/save/primitives.tsx`, so a token change propagates
everywhere rather than requiring per-screen edits.

## 3. Information architecture

IA is implemented as data, not layout, in `components/save/navs.tsx` (`donorNav`, `ministryNav`,
`staffNav`), rendered by one shared `AppShell` (`components/save/shell.tsx`) for all three portals
and a separate `PublicShell` for marketing/library surfaces. Desktop renders the nav as a persistent
side rail with grouped sections; the same nav config drives a mobile bottom/drawer treatment in
`AppShell` so mobile and desktop never drift out of sync.

**Donor portal** — Home · Following (badge: unread) · Discover ministries · Giving · Annual
statements · Updates (badge: unread) · Prayer · My SAVE advisor.

**Ministry portal** — Overview · Assessment ("the standard," badge: % complete) · Evidence (badge:
items needing attention) · Findings · Roadmap · Profile · Testimonies · Donor updates · Reports.
Grouped as: root / Assessment / Your public profile — reflecting the actual ministry journey from
"getting assessed" to "maintaining a public presence."

**Staff portal** — Queue (badge: pending count) · Review · Publishing (badge: pending publish
decisions) · Ministries (portfolio) · Leader health (badge: flagged, visually separated) · Donors ·
Reviewers · Audit history. Grouped as: root / Portfolio / Operations.

**Public** — Ministry library (search/filter/discover) and Ministry profile, served by `PublicShell`
so they read as an extension of the marketing site rather than a portal.

## 4. Role and visibility matrix

| Area | Ministry user | Donor | Assessor | SAVE staff/admin |
|---|---|---|---|---|
| Own application & assessment status | Read/write (own org) | — | Read (assigned) | Read/write (all) |
| Evidence upload | Write (own org) | — | Read, comment | Read/write |
| Findings & recommendations | Read (own org) | — | Write (assigned) | Read/write, reassign |
| Roadmap / implementation progress | Read/write (own org) | — | Read | Read/write |
| Public profile content (draft) | Write (own org) | — | — | Approve before publish |
| Donor-library visibility toggle | — | — | — | Write only |
| Ministry library / public profiles | — (sees own as donor would after publish) | Read (published only) | — | Read/write (incl. unpublished) |
| Follow/select ministries | — | Write (own list) | — | Read (aggregate) |
| Reports & testimonies (submit) | Write (own org) | — | — | Review/approve before donor visibility |
| Reports & testimonies (view) | Own org | Read (followed ministries, post-approval only) | — | Read/write, moderate |
| Giving history — SAVE-processed | — | Read (own) | — | Read (aggregate, no PII beyond need) |
| Giving history — ministry-confirmed / donor-reported | Ministry sees own-org totals | Write (own entries) | — | Read (aggregate) |
| Annual consolidated statement | — | Read (own) | — | Read (for support) |
| Leader-health records | Restricted (self, if applicable) | **No access** | **No access** | Restricted: senior staff only, distinct visual treatment |
| Audit/activity history | Own-org actions only | — | Own actions | Full (role-scoped by seniority) |

Open question folded into §9: exact assessor visibility into cross-ministry findings (single-ministry
scoped vs. portfolio-wide) — flagged there rather than assumed.

## 5. End-to-end key workflows

**A. Ministry applies → assessment → approval → donor visibility**
1. Ministry submits application (ministry portal, pre-assessment state of Overview).
2. SAVE staff triage into queue (`/preview/staff`), assign an assessor.
3. Ministry completes evidence collection against the six assessment categories
   (`/preview/ministry/assessment`, `/preview/ministry/evidence`); assessor reviews
   (`/preview/staff/review`).
4. Findings issued (`/preview/ministry/findings`, staff side in `/preview/staff/review`); ministry
   works a roadmap for any gaps (`/preview/ministry/roadmap`).
5. Staff makes an approve/pause/decline/return decision.
6. On approval, staff explicitly flips donor-library visibility (`/preview/staff/publishing`) —
   this is a deliberate publish action, not an automatic side effect of "approved" status, so staff
   can hold a profile back even after approval (e.g. profile content not ready).
7. Ministry becomes visible in `/preview/library` with a public profile.

**B. Donor discovers → follows → receives reports/tracks support**
1. Donor browses `/preview/library` (search/filter, non-transactional card design) or opens a
   profile directly (`/preview/ministry-profile/[slug]`).
2. Donor follows/selects a ministry; it appears in `/preview/donor/following` and on
   `/preview/donor` home.
3. Ministry-approved updates, testimonies, and reports surface on
   `/preview/donor/ministry/[slug]` and the donor's `/preview/donor/updates` feed — only after SAVE
   staff has reviewed/approved them for donor visibility (see workflow C, step 3).
4. Donor logs support via the gift-recording flow (`/preview/donor/giving`), distinguishing
   SAVE-processed, ministry-confirmed, and donor-reported gifts (`GiftRow`/`AssessmentProvenance`
   patterns in `components/save/patterns.tsx`) and rolls up into an annual statement.

**C. Staff reviews ministry → requests changes → approves → publishes**
1. Application lands in `/preview/staff` queue; staff assigns a reviewer.
2. Reviewer works evidence/findings in `/preview/staff/review`; can return items to the ministry for
   more evidence (loop back into workflow A step 3) rather than only binary approve/decline.
3. Ministry-submitted reports/testimonies pass through the same review surface before they become
   visible to donors — staff is a moderation gate, not a rubber stamp.
4. Staff sets the publish decision in `/preview/staff/publishing`, which is the single control point
   for donor-library visibility described in workflow A step 6.
5. All decisions land in `/preview/staff/audit` for accountability.

## 6. High-fidelity screens / prototype

All required core screens exist as working static-fixture prototypes today (Next.js routes, real
component library, no backend):

- Public: `/preview/library`, `/preview/ministry-profile/[slug]`
- Donor: `/preview/donor`, `/preview/donor/following`, `/preview/donor/giving` (incl. annual
  statement), `/preview/donor/ministry/[slug]`, `/preview/donor/updates`, `/preview/donor/prayer`
- Ministry: `/preview/ministry`, `/preview/ministry/assessment`, `/preview/ministry/evidence`,
  `/preview/ministry/findings`, `/preview/ministry/roadmap`, `/preview/ministry/profile`,
  `/preview/ministry/testimonies`, `/preview/ministry/updates`, `/preview/ministry/reports`
- Staff: `/preview/staff` (queue), `/preview/staff/review`, `/preview/staff/publishing`,
  `/preview/staff/ministries`, `/preview/staff/leaders` (restricted treatment),
  `/preview/staff/donors`, `/preview/staff/audit`
- System: `/preview/system` — the design-token/component reference page itself

Start at `/preview` for the indexed tour. Run locally with `npm run dev` (no credentials required).

## 7. Design tokens / component recommendations

Reusable and ready to adopt into a future shared design system:

- **Tokens**: `app/save-design.css` — ink/paper/brass/sage/clay/rose scales, one type scale, one
  radius scale, four elevation levels. Framework-agnostic CSS custom properties; not React-specific.
- **Primitives**: `components/save/primitives.tsx` — Card, Btn, Badge, TrustSeal, Stat, Meter,
  ScoreDial, Table, Field/Input/Select/Textarea, Callout, Tabs, Steps, Monogram, EmptyState.
- **Shell**: `components/save/shell.tsx` — one `AppShell` driven by nav config for all three
  portals, plus `PublicShell` for marketing/library surfaces.
- **Domain patterns**: `components/save/patterns.tsx` — MinistryCard, CategoryBreakdown,
  ImpactGrid, TestimonyCard, UpdateItem, PrayerCard, EvidenceRow, FindingRow, RoadmapRow, GiftRow,
  AssessmentProvenance.
- **Nav-as-data**: `components/save/navs.tsx` — portal IA expressed as config, so IA changes don't
  require touching layout code.

Recommendation: when this moves toward real implementation, promote `app/save-design.css` +
`components/save/` into a shared package boundary early, before Workspace V2 or other surfaces grow
their own competing token set.

## 8. MVP recommendation

**Launch first (v1):**
- Public ministry library + profile (donor trust entry point; no login required)
- Staff: queue, review, publishing/visibility control (this is the gate everything else depends on)
- Ministry: overview/status, assessment, evidence, findings, roadmap (the assessment journey is
  SAVE's core trust mechanism — it has to work before donor-facing features matter)
- Donor: home, following, ministry detail with reports/testimonies (relationship core)
- Donor-reported/manual gift logging (simplest giving-visibility slice — no payment integration
  required)

**Defer to v2:**
- SAVE-processed gift integration (payments) and consolidated annual statements — genuinely new
  integration surface, not just UI
- Leader-health restricted module — needs a real privacy/access-control design pass, not just a
  visual treatment, before it should hold real data
- Prayer feed, "My SAVE advisor" messaging — relationship-depth features that make sense once the
  core loop (discover → follow → report) is proven
- Audit history UI polish beyond a functional log

**Rationale:** the assessment-to-publish loop (staff + ministry) is the trust mechanism the entire
product depends on; it should be correct before investing further in donor relationship depth.
Payments/statements are explicitly out of this issue's authorization boundary anyway (no
Supabase/payments changes), which lines up naturally with deferring that slice.

## 9. Founder decision list

Only genuine open choices — everything else above reflects a reasonable default already taken in
the prototype:

1. **Assessor visibility scope** — should an assessor see only their assigned ministry, or a
   portfolio view across ministries they've worked with historically? Affects the assessor
   experience inside the staff portal, not yet designed as a separate role view.
2. **Gift-recording ownership** — should donor-reported/monthly gift logging be a donor-portal
   self-serve flow (prototyped at `/preview/donor/giving`), a ministry-confirmed flow, or require
   reconciliation between both before it counts toward "ministry-confirmed"? Affects trust
   semantics of the giving-provenance labels.
3. **Leader-health access list** — the issue asks for "visibly stronger privacy treatment" but the
   actual allowed-viewer list (which staff titles, whether board members ever see it) needs a
   founder call before real data enters that module — this is a policy decision, not a visual one.
4. **Publishing reversibility** — can staff un-publish an already-visible ministry (e.g. a finding
   surfaces post-approval), and if so, does that need a donor-facing notice? Affects trust
   messaging, not just the staff UI.
5. **Ministry multi-user roles** — the brief says "ministry users" broadly; is there a
   read-only-staff-at-the-ministry role distinct from the applicant/lead user, or is every ministry
   user equally privileged? Affects row 1 of the role matrix in §4.

---

*No Supabase, auth, tenancy, RLS, payments, or production-data changes were made in producing this
package. Everything above is either documentation or static-fixture UI under `app/(preview)/`.*
