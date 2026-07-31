# USA-133 · The SAVE design language

Live reference: **`/preview/system`** — rendered from the same tokens the
product uses, so it cannot drift from what ships.

Source of truth: `app/save-design.css` (tokens), `tailwind.config.ts` (scales).

---

## Five principles

These decide the judgement calls that a spec cannot enumerate.

**1. Warm paper, not cold gray.** Every neutral in the system carries warmth.
Cold grays read as software; warm paper reads as a document worth trusting.
This is the single decision that most separates SAVE from Salesforce.

**2. Ink is navy.** Navy carries text and primary action. It is authority, not
decoration. It never appears as a background wash or a gradient.

**3. Brass is earned.** Brass marks verification and nothing else. If brass
appears on a screen, SAVE has assessed something. Using it as a generic accent
would destroy the one visual signal the product cannot afford to weaken.

**4. Whitespace over density.** Whitespace is the premium signal. When a screen
feels cramped, the answer is to remove content, not to shrink it.

**5. Numbers are typeset, not printed.** Money, scores, dates and counts are
always tabular figures. A donor must be able to compare down a column.

---

## Colour

Six ramps replace the 96 hardcoded hex values found in the audit.

| Ramp | Role | Anchor |
|---|---|---|
| `ink` | Text, primary action, authority | `ink-700` `#1d4378` |
| `paper` | Surfaces and rules — the warm signature | `paper-100` `#faf8f4` |
| `brass` | Verification only | `brass-700` `#8a6318` |
| `sage` | Healthy, approved, on track | `sage-600` `#3b6b53` |
| `clay` | Attention, in progress, needs work | `clay-600` `#a85a2e` |
| `risk` | Declined, hard stop — warm, never neon | `risk-700` `#8e2f2f` |

Semantic aliases sit on top so screens name intent rather than value:
`--save-bg`, `--save-surface`, `--save-surface-sunken`, `--save-hairline`,
`--save-text`, `--save-text-secondary`, `--save-text-muted`.

### Accessibility

Every foreground/background pair the system produces was measured. All sixteen
clear WCAG AA (4.5:1), including small text:

```
14.26:1  body text on page             9.63:1  primary button label
14.75:1  body text on raised           5.28:1  brass button label
 4.96:1  secondary text on page       12.12:1  secondary button label
 4.66:1  secondary text on sunken      4.94:1  trust seal
 4.65:1  muted text on page            7.84:1  sage badge
 6.32:1  clay badge                    7.18:1  risk badge
 8.86:1  ink badge                     6.56:1  neutral badge
 4.80:1  eyebrow on sunken             5.10:1  eyebrow on page
```

Three tokens were darkened during this work to reach that bar: `ink-400`
(3.38 → 4.65), and all brass text and the brass button fill moved from
`brass-600` to `brass-700` (3.40 → 4.80). **Status is always colour plus text**
— colour alone never carries meaning.

### Contrast with the old palette

The old brand navy `#1A4480` and cream `#F9F6F0` are preserved in spirit and
tightened in execution: navy becomes a ten-step ink ramp so secondary text has
somewhere to live, and the cream becomes a six-step paper ramp so surfaces can
sit on each other without borders doing all the work. The old gold `#F5C842`
was too bright to carry text at any size; brass is the same idea at a weight
that can.

---

## Typography

**Fraunces** for display, **Inter** for interface. This replaces the three
unrelated pairings currently in the product (Geist, DM Sans + Playfair,
Plus Jakarta + Lora).

Fraunces is a warm editorial serif with optical sizing — it carries authority
without the wedding-invitation quality of Playfair. Inter carries the interface
and, critically, has genuine tabular figures for money and scores.

One scale. Every size ships with its line height and tracking so no screen has
to invent typography:

| Token | Size / line | Use |
|---|---|---|
| `display-xl` | 56/60 | Marketing hero |
| `display-lg` | 44/48 | Section hero |
| `display-md` | 34/40 | Page title |
| `display-sm` | 26/32 | Card hero, stat value |
| `title` | 20/28 | Section heading |
| `lg` | 17/26 | Lead paragraph |
| `base` | 15/24 | Body |
| `sm` | 13.5/20 | Dense body, table cell |
| `caption` | 13/18 | Metadata |
| `label` | 12/16 | Form label |
| `micro` | 11/14 | Eyebrow, badge |

Two utility classes carry the character: `.save-display` (Fraunces with optical
sizing) and `.save-numeric` (tabular figures). The whole system is scoped under
`.save-root`, so legacy surfaces keep their existing typography until they
migrate.

---

## Spacing, radius, elevation

**Spacing** — 4px base. Card padding 24. Page gutters 20 / 32 / 40 by
breakpoint. Section rhythm 72. Named tokens: `gutter`, `gutter-lg`, `section`,
`rail` (252px).

**Radius** — six steps replacing 20+ ad hoc values:

```
sm 6    controls, badges, small marks
md 8    buttons, inputs
lg 12   inner panels, callouts
xl 16   cards          ← the default
2xl 20  feature cards
full    pills, avatars, meters
```

**Elevation** — four levels replacing 25 one-off shadows. All warm-tinted
(`rgba(15,38,71,…)`, never neutral black) and close to the page:

```
e1  0 1px 2px /.05                          resting controls
e2  + 0 6px 16px -8px /.12                  cards            ← the default
e3  + 0 12px 32px -12px /.16                hover, popovers
e4  + 0 24px 56px -20px /.20                modals
```

The old shadows (`0 24px 60px`) were three times this blur. Reducing them is
most of what separates "premium" from "soft".

---

## Motion

Restrained and consistent: 150–200ms on a single `ease-save` curve
(`cubic-bezier(0.22, 1, 0.36, 1)`). Cards lift 2px on hover; buttons drop 1px
on press; meters animate width over 500ms. Nothing pulses, nothing bounces.
The `animate-ping` halo on the current portal's step indicator is removed — a
status is not an alert.

---

## Iconography

A small custom set for anything carrying brand meaning — principally
`SealMark`, the shield-and-check that is the verification mark — with
`lucide-react` for conventional interface icons. Icons are 16px at 1.2–1.5
stroke, always paired with a label in navigation.
