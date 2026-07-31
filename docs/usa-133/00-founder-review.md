# USA-133 · SAVE Standard Complete Product Redesign

**Founder review package**

| | |
|---|---|
| **Branch** | `usa-133/save-standard-redesign` |
| **Base** | `rescue/save-website-local-work-20260727` |
| **Repository** | `rfox0629/save-website` |
| **Commits** | `3df1e8b`, `6accdc2`, plus this documentation commit |
| **Preview** | `npm run dev` → **http://localhost:3000/preview** |
| **Screenshots** | `docs/usa-133/screenshots/` (25 images) |
| **Status** | Typecheck clean · ESLint clean · production build passes (62 routes) |

No pull request has been opened and nothing has been merged or deployed.

---

## What was built

**17 high-fidelity screens**, all working code in the repository, all rendering
from one design language and one component system.

| Surface | Screens |
|---|---|
| Public | Ministry library · Ministry profile |
| Donor Portal | Home · Following · Giving & annual statements · Ministry detail · Updates · Prayer |
| Ministry Portal | Overview · Assessment workflow · Evidence · Findings · Roadmap · Profile editing · Testimonies · Donor updates · Reports |
| Staff Portal | Application queue · Reviewer workspace · Publishing · Ministry portfolio · Leader health · Donor visibility · Audit history |

Plus `/preview` (index) and `/preview/system` (the design language, rendered
from live tokens).

Every screen in the brief's deliverable list is present, and the brief's three
portals are each complete against their stated requirements.

---

## The audit, in one paragraph

The product does not have a decorative problem. It has **no design system**.
Measured: 1,352 hardcoded hex colours across 96 distinct values; 20+ border
radii; 25 one-off shadows; three unrelated font pairings across three route
groups; three files in `components/ui/`. Every screen re-derives the interface
from scratch, which is why `vetting-form.tsx` is 1,493 lines and
`inquiry-form.tsx` is 1,144 — largely the same markup written twice. The dark
internal theme you flagged (`#0B1622`, 53 occurrences) is not a corner of the
product; it is the entire SAVE staff experience. Full detail in
[`01-ux-audit.md`](01-ux-audit.md).

Two findings are worth pulling out because they are product gaps, not styling:

- **The donor portal is missing eight of nine capabilities** in your brief.
  Following, updates, giving, statements, testimonies, impact, prayer and
  favourites do not exist. What exists is a comparison tool — precisely the
  transactional framing to avoid.
- **A ministry cannot see what SAVE concluded about it.** No findings, no
  roadmap, no implementation tracking. This is the highest-value single
  addition in the redesign.

---

## Design rationale

**Mission first.** SAVE exists so affluent donors find ministries they can
trust. The interface therefore has one job: *make trust legible.* Every
decision below serves that.

**Warm paper, not cold gray.** The signature decision. Every neutral carries
warmth, because cold grays read as software and warm paper reads as a document
worth trusting. This is what most separates SAVE from Salesforce.

**Brass is earned.** Brass marks verification and nothing else. If brass
appears, SAVE has assessed something. Using it as a generic accent would
weaken the one visual signal the product cannot afford to weaken.

**The assessment is one object.** `CategoryBreakdown` renders identically on
the public profile, the donor detail view, the ministry's findings and the
reviewer's workspace. A donor and a reviewer see the same thing; the reviewer
just has controls beside it. Four different renderings of one assessment would
undermine it.

**A score without provenance is just a number.** Wherever a score appears to a
donor, `AssessmentProvenance` appears near it: who assessed, when, when
reassessment is due, and "no ministry pays SAVE for a recommendation."

**Relationship, not marketplace.** The donor portal leads with *what has
happened* — a feed of updates from ministries they follow — not with a grid of
options. The advisor is a person with a name and a tenure, not a support
ticket. Prayer has its own destination. Comparison tooling was deliberately
removed from navigation and demoted to an action.

**SAVE controls the assessment; the ministry controls the story.** Made visible
in the ministry portal's navigation and stated explicitly on the profile
screen. It is why donors can trust the score.

**The ministry portal is a journey, not a form queue.** It opens with a stepper
and one next best action, never an empty dashboard. Findings lead with
strengths. The copy says plainly that the ministry keeps the findings and the
roadmap whichever way the decision goes, and that there is no fee either way.

Full detail: [`03-design-language.md`](03-design-language.md),
[`02-information-architecture.md`](02-information-architecture.md),
[`04-component-system.md`](04-component-system.md).

---

## MVP recommendation

Full detail in [`05-mvp-recommendation.md`](05-mvp-recommendation.md). The
headline and the one non-obvious call:

**Launch** — tokens and components; public library and profile; donor home,
following, ministry detail, giving and statements; ministry overview,
assessment, evidence, findings, profile, testimonies; staff queue, reviewer
workspace, publishing, audit.

**V2** — prayer; roadmap and implementation; ministry reports; donor updates
authoring; leader health; reviewer load balancing; donor access workflow.

**Future** — multi-user ministry accounts; visits and introductions;
reassessment automation; multi-currency; DAF integrations; peer benchmarking.

**The non-obvious call:** the staff portal ships in Launch, ahead of most donor
features. SAVE cannot publish a trustworthy assessment faster than its
reviewers can produce one, and they are currently working in a dark interface
with no queue, no assignment UI and no audit view.

---

## Accessibility

All 16 foreground/background pairs the system produces clear WCAG AA (4.5:1),
including small text. Three tokens were darkened to get there.

One defect found and fixed that is worth your attention because it failed
silently: `tailwind-merge` did not know the custom colour and font-size scales,
so it dropped `text-paper-50` from primary buttons, leaving **navy text on a
navy fill at 1.5:1**. Fixed in `lib/utils.ts`. I recommend keeping the contrast
sweep in CI — it is what caught it.

---

## Technical boundaries — all respected

No migrations run. No Supabase changes. No auth, tenancy or RLS changes. No
production deploy. No merge to main. Workspace V2 untouched.

Two things to be aware of:

1. **`app/globals.css` and `tailwind.config.ts` were modified.** The Tailwind
   config now includes the SAVE scales; `fontSize.sm` moved 14px → 13.5px and
   `rounded-lg` moved from `var(--radius)` to 12px. Legacy screens hardcode
   their colours so they are largely unaffected, and the production build
   passes all 62 routes — but this is a shared file, not preview-only.
2. **A local `.env.local` was created** pointing at a non-running local
   Supabase so the app boots without credentials. It is gitignored and contains
   no real secrets.

---

## Outstanding founder decisions

**1. The tier names.** `High Confidence Opportunity`, `Strong Opportunity`,
`Proceed with Discernment`, `Not Recommended` are investment-committee
language, as is the copy in `donor-home.tsx`: *"Suitable for meaningful capital
investment"*, *"Not suited for capital deployment now."* You asked for this not
to feel transactional. I kept your tier names because they are your product
vocabulary and renaming them unilaterally would be the wrong call — but I
think they work against the mission. A relationship-first alternative:
*Ready for partnership · Strong and worth knowing · Worth a conversation ·
Not ready.* **Your call.**

**2. What donor access actually gates.** I designed it as personally granted,
never purchased, with an approval queue in the staff portal — because that
reinforces trust. Confirm this matches your intent, and tell me what a
non-approved visitor sees on a ministry profile. I currently show the
assessment summary and category scores publicly, gating financial detail,
leadership assessment and full findings. That line is a judgement call.

**3. Does SAVE handle money, or only record it?** The donor giving screen shows
gift history, receipts, annual statements and pledge tracking. It does not
process payment. If SAVE is the payment path, that is a materially larger build
(and a compliance conversation). If SAVE records gifts made directly to
ministries, the current design is right. **This changes the Launch scope.**

**4. Prayer in Launch or V2?** I placed it in V2 on sequencing grounds — it
needs the following graph to be meaningful. But it is the part of the
relationship that costs nothing and may matter most to your donors. Easy to
promote if you disagree.

**5. Update frequency caps.** I designed a two-per-month ceiling on ministry
donor updates, on the reasoning that donors should read every one rather than
skim forty. This is a product policy, not a design detail.

**6. Reassessment cadence.** The fixtures assume two years, with an early
reassessment available once every roadmap item is verified. Confirm the real
cadence — several screens surface it.

**7. Four new data models.** Following, giving and statements, testimonies, and
prayer have no backing schema today. Launch implies that migration work, which
is outside this ticket's boundaries and needs your go-ahead before anyone
starts.

---

## How to review

```bash
git checkout usa-133/save-standard-redesign
npm install
npm run dev
```

Then open **http://localhost:3000/preview** — it indexes all 17 screens.

Suggested order: `/preview/library` (the front door) → `/preview/donor` (the
relationship dashboard, and the biggest departure from today) →
`/preview/ministry/findings` (the highest-value addition) → `/preview/staff`
(the surface that is currently dark) → `/preview/system` (the design language).

Or read `docs/usa-133/screenshots/` in numbered order.
