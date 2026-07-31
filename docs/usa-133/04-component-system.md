# USA-133 · Component system

Three files, composed by all 17 screens. The rule: **if a screen needs a shape
that is not here, the shape belongs here first.**

```
components/save/
  primitives.tsx   generic building blocks
  shell.tsx        application and public chrome
  patterns.tsx     SAVE domain components
  navs.tsx         the three portals' IA, as data
```

---

## primitives.tsx

Nothing in this file knows what a ministry is.

**Surface** — `Card` (tones: `flat`, `raised`, `sunken`, `seal`),
`CardHeader`, `CardBody`, `CardFooter`, `Divider`.

**Action** — `Btn`. Six variants (`primary`, `secondary`, `ghost`, `brass`,
`quiet`, `danger`) × three sizes. Renders `<button>` or a Next `<Link>`
depending on whether `href` is passed, so no screen hand-rolls a link that
looks like a button.

**Status** — `Badge` (six tones), `TrustSeal`, `SealMark`.

**Typography** — `PageTitle` (eyebrow + title + description + actions),
`SectionTitle`.

**Data** — `Stat`, `StatRow`, `Meter`, `ScoreDial`, `DataList`/`DataRow`,
`Table`/`Th`/`Td`.

**Forms** — `Field` (label, required mark, hint, help), `Input`, `Select`,
`Textarea`. One control height, one focus treatment, labels always above.

**Feedback** — `Callout` (five tones), `EmptyState`.

**Wayfinding** — `Tabs`, `Steps`, `Monogram`.

**Formatting** — `formatMoney`, `formatDate`. Centralised so a figure never
renders two ways in two places.

## shell.tsx

`AppShell` is one component serving all three portals. A portal is a nav
config, not a layout:

```tsx
<AppShell
  account={DONOR_ACCOUNT}
  groups={donorNav("home")}
  persona="donor"
  topBar={<TopBar breadcrumb={[{ label: "Home" }]} actions={…} />}
>
```

It provides the fixed 252px rail with grouped navigation and badges, the
account chip, the mobile header with its scrolling nav strip, and the content
container. `TopBar` adds breadcrumb, status and page actions.

`PublicShell` is the marketing equivalent — sticky header, nav, footer.

Changing a portal's IA is a data change in `navs.tsx`. No page layout moves.

## patterns.tsx

Where SAVE's domain lives.

| Component | Used by |
|---|---|
| `MinistryCard` | Public library, donor saved list |
| `MinistryRow` | Donor home, following, staff lists |
| `CategoryBreakdown` | Public profile, donor detail, staff review, findings |
| `ConfidenceMark` | Inside category breakdown |
| `ImpactGrid` | Public profile, donor detail, ministry profile edit, reports, publishing |
| `TestimonyCard` | Public profile, donor home, donor detail, testimonies |
| `UpdateItem` | Donor home, donor updates, donor detail, public profile |
| `PrayerCard` | Donor home, donor prayer, donor detail |
| `EvidenceRow` | Ministry evidence, ministry overview, staff review |
| `FindingRow` | Ministry findings, ministry overview, staff review |
| `RoadmapRow` | Ministry roadmap |
| `GiftRow` | Donor giving |
| `AssessmentProvenance` | Public profile, donor detail, staff publishing |
| `TierExplainer` | Public profile, donor detail |

`CategoryBreakdown` appearing on four surfaces is the point. A donor and a
reviewer look at the same rendering of the same assessment — the reviewer just
has controls next to it. That is what makes the assessment feel like a single
object rather than four reports.

---

## The reuse test

Screens are composition, not markup. The ministry overview page is 250 lines
and contains no styling decisions — it arranges `Steps`, `StatRow`, `Callout`,
`Card`, `Meter`, `FindingRow`, `EvidenceRow`, `DataList` and `Btn`.

Compare with the audit: `vetting-form.tsx` is 1,493 lines and
`inquiry-form.tsx` is 1,144, largely the same markup written twice. The
redesigned assessment screen is 300 lines because the form primitives carry the
repetition.

---

## One bug worth recording

`cn()` wraps `tailwind-merge`, which only knows Tailwind's stock scales. Given
the custom `text-caption` (font size) and `text-paper-50` (colour), it could
not tell them apart, treated them as one group, and silently dropped the
colour — leaving navy text on a navy button at **1.5:1**.

The fix is in `lib/utils.ts`: `extendTailwindMerge` now declares the SAVE font
sizes and colour scales explicitly. Any design system that adds custom scales
to Tailwind and uses `tailwind-merge` has this bug until it does this, and it
fails silently, which is why the contrast sweep in
`docs/usa-133/05-mvp-recommendation.md` is worth keeping in CI.
