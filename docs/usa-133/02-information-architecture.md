# USA-133 · Information architecture

## The organising idea

SAVE has four audiences and today they share one undifferentiated route tree.
The new IA gives each a **surface** with its own shell, and makes the boundary
between them explicit:

```
Public          anyone            discovery and the standard
Donor Portal    invited donors    a private relationship dashboard
Ministry Portal applicants        the assessment journey and public profile
Staff Portal    SAVE team         the operating system
```

The rule that keeps these coherent: **a ministry looks the same everywhere it
appears.** Only the affordances around it change. On the public library it has
a "View assessment" button; in the donor portal it has "Give"; in the staff
portal it has "Open". The ministry itself renders from the same components.

---

## Public

```
/                          Home
/library                   Ministry library          ← the front door
/library#standard          How assessment works
/ministry/[slug]           Ministry profile
/for-ministries            Apply
/for-donors                Request donor access
/about
```

The library replaces the current homepage as the primary entry. A donor's first
question is "who is worth knowing?", not "what is SAVE?" — the standard is
explained beneath the ministries, not before them.

## Donor Portal

```
/donor                     Home — the relationship feed
/donor/following           Following + saved for later
/donor/discover            → /library
──────── Giving
/donor/giving              Gift history
/donor/giving#statements   Annual statements
──────── Relationship
/donor/updates             Updates from followed ministries
/donor/prayer              Prayer requests
/donor/ministry/[slug]     Ministry detail (relationship view)
/donor/advisor             Your SAVE advisor
```

Three groups, in this order, because they are the three things a relationship
consists of: **who you walk with**, **what you have given**, and **what is
happening**. Comparison tooling is deliberately not in the navigation. It
exists as an action, not a destination — the current `/donors/compare` framing
is the single most transactional thing in the product.

## Ministry Portal

```
/ministry                  Overview — journey + next best action
──────── Assessment
/ministry/assessment       The standard (six categories)
/ministry/evidence         Evidence
/ministry/findings         Findings
/ministry/roadmap          Roadmap & implementation
──────── Your public profile
/ministry/profile          Profile editing
/ministry/testimonies      Testimonies
/ministry/updates          Donor updates
/ministry/reports          Reports
```

The split between the two groups is the product's most important boundary:
**SAVE controls the assessment, the ministry controls the story.** Making that
visible in the navigation stops a ministry wondering why it cannot edit its own
score, and it is why donors can trust the score at all.

Onboarding is not a separate route. It is the Overview screen in its first
state — a journey stepper plus one next action — so a ministry never lands on
an empty dashboard.

## Staff Portal

```
/staff                     Application queue
/staff/review              Reviewer workspace
/staff/publishing          Publishing workflow
──────── Portfolio
/staff/ministries          Published ministries + reassessment schedule
/staff/leaders             Leader health
/staff/donors              Donor visibility and access requests
──────── Operations
/staff#reviewers           Reviewer assignment and load
/staff/audit               Audit history
```

Work first, portfolio second, operations third. The queue is the home screen
because a reviewer's question on opening the product is always "what needs me
today?".

---

## Responsive behaviour

The shell is one component (`components/save/shell.tsx`) with three
breakpoints. There is no separate mobile IA — the same navigation renders in a
different form factor, so nothing is hidden on a phone that exists on a laptop.

### Desktop — 1280px and up

- 252px fixed left rail, always visible, grouped with section labels
- Sticky contextual top bar: breadcrumb, status, page actions
- Content max-width 1400px, page gutters 40px
- Two-column body: main column plus a 320–360px rail

### Tablet — 768 to 1279px

- Left rail collapses to the sticky header
- Navigation becomes a horizontally scrollable strip under the wordmark —
  **every destination stays reachable**, which a hamburger would not do
- Body collapses to a single column; rail cards move below the main content
- Tables keep their own `overflow-x` container so the page never scrolls
  sideways

### Mobile — below 768px

- Same sticky header and scrolling nav strip
- Single column, 20px gutters
- Stat rows go 4-up → 2-up
- Card headers stack their action beneath the title
- Trailing metadata in list rows is hidden below `sm`, keeping the row to name
  plus one number

The decision worth naming: **no hamburger menu.** A donor with four ministries
and a staff reviewer with a queue both need to see where they are. A scrolling
strip costs a little horizontal space and preserves the whole IA.

---

## What happens to the existing routes

Nothing is deleted. The redesign is additive under `/preview` so the running
product is untouched. When the redesign is adopted, the mapping is:

| Today | Becomes |
|---|---|
| `/donors` | `/donor` (dashboard) |
| `/donors/[slug]` | `/ministry/[slug]` public, `/donor/ministry/[slug]` signed in |
| `/donors/compare` | An action inside `/donor/following` |
| `/brief/[slug]` | Redirect to `/ministry/[slug]` |
| `/portal` | `/ministry` |
| `/portal/inquiry` + `/portal/application` | `/ministry/assessment` |
| `/portal/documents` | `/ministry/evidence` |
| `/dashboard` | `/staff` |
| `/applications/[id]` | `/staff/review` |
| `/applications/[id]/brief` | `/staff/publishing` |
| `/applications/compare` | An action inside `/staff` |
| `/map` | Retired — the navigation replaces it |
