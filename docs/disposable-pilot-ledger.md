# Disposable pilot assessment — ledger

A running record of what the Phase B disposable assessment found while walking
the real platform end to end as a ministry and as staff.

**Scope guardrails.** The pilot uses **SAVE Pilot Test Ministry** only, with
fictional data throughout. **USA Missionaries and New City Fellowship are not
touched.** Where public facts about a real organisation informed realistic test
answers, the pilot organisation is never represented as that organisation, and
no allegation — legal, moral or financial — is invented about any real person
or ministry.

Entries are classified as:

| Class | Meaning |
| --- | --- |
| `PRODUCTION VERIFIED` | Exercised against production and behaved correctly |
| `BUG FOUND + FIXED` | Defect found, repaired, merged and deployed |
| `MISSING IMPLEMENTATION` | Promised or implied behaviour that does not exist |
| `FOUNDER DECISION REQUIRED` | Product or policy question; not mine to settle |

---

## Reference stage

### S1 — reference scoring read keys nothing wrote — `BUG FOUND + FIXED`

The Complete Application collects three references under `ref_1_*`…`ref_3_*`.
The form, its validation, persistence, save/resume and the staff evidence view
all use that prefix. `lib/scoring/engine.ts` alone read `reference_N_*`, which
nothing has ever written. The mismatch was uniform — all three references, all
four values (name, role, email, relationship).

Because a reference counts only when it carries both a name and an email, the
`references` component scored **0 of 3 for every ministry**, however many
references it supplied. It failed closed, so no ministry was ever wrongly
credited — only wrongly denied.

Repaired in [#25](https://github.com/rfox0629/save-website/pull/25): `ref_${index}_*`
is canonical, `reference_${index}_*` is retained as a fallback only. The
questions, required-reference count, weighting, schema and outreach behaviour
are unchanged. This restores an existing rule that was unreachable; it does not
establish a new rubric.

### S2 — references and Voice Alignment should connect, but never automatically — `FOUNDER DECISION REQUIRED` (decided; not yet built)

Today the Complete Application's three required references and the Voice
Alignment invitation workflow are **two disconnected concepts that share a
word**. A ministry names three references; staff separately type respondent
details by hand. Nothing links them.

**Founder direction (2026-09-17).** They should become connected, on this model:

> Ministry-supplied Reference → staff-reviewed evidence → *optional*
> staff-initiated Voice Alignment request

- A Reference and a Voice Alignment respondent are **not synonymous**. The
  ministry supplies the reference; SAVE decides whether to initiate Voice
  Alignment with that person.
- Submission must **never** automatically send an invitation.
- Staff should eventually be able to initiate the existing Voice Alignment
  request *from* a submitted reference, with name, email and relationship
  prefilled, and must explicitly review and send it.
- Staff may choose one, several, all, or request a further reference.

Deliberately **not** implemented in #25. Recorded here as a product/workflow
item for the reference stage.

---

## Platform-wide

### Regression tests do not gate any merge — `MISSING IMPLEMENTATION`

`package.json` defines `test: vitest run`, but `.github/workflows/ci.yml` runs
only Lint, Typecheck and Build. No test step exists, so the regression coverage
added in #19–#25 runs nowhere on merge. Raised rather than folded into #25.
