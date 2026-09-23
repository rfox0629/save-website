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

---

## Complete Application run (2026-09-23)

The eight-step Complete Application was completed end to end as **SAVE Pilot
Test Ministry** with fictional data and submitted. Final engine score **83/100**,
no hard stop, two medium risk flags (`family_on_board`, `recent_deficit`) — both
correctly raised by answers deliberately chosen to trigger them.

### `PRODUCTION VERIFIED`

- **S1 reference scoring.** `references` scored **3 of 3** — *"3 valid external
  references were provided."* Before the fix this was 0 of 3 for every ministry.
  The three references persisted under `ref_1_*`…`ref_3_*`, the keys scoring now
  reads.
- **P1 doctrinal affirmation.** `staff_doctrinal_affirmation` scored **3 of 3**.
  Previously unearnable. Together with S1 these are the 6 points no ministry
  could reach.
- **Attestation persistence (#24).** `attests_information_is_true`,
  `attestation_name`, `attestation_title` and `attestation_signed_at` all
  populated from the signed form. The two columns the form never asks about
  remain unwritten, as designed.
- **Conditional fields.** Five exercised, each appearing only on the triggering
  answer: `marriage_sexuality_url`, `family_on_board_relationship`,
  `deficit_explanation`, `ecfa_body`, `ecfa_lapsed`.
- **Save/resume.** A full reload restored every answer from steps 1–7,
  including the `"Yes formal"` ↔ `"Yes, formal structure"` enum round-trip.
- **Submission handoff.** `vetting_submitted`, `submitted_at` set, 6 documents
  stored, external checks 4 → 8, scoring engine ran automatically.

### `MISSING IMPLEMENTATION`

- **Step 8 has no draft save.** Steps 1–7 save on each Next click. Step 8's only
  button is Submit, so uploaded documents, both attestation checkboxes and the
  signatory fields are lost if the ministry leaves the page. A ministry that
  uploads six files and steps away loses all six with no warning.
- **Resume always returns to Step 1.** A part-finished application reopens at the
  beginning; the ministry must click Next seven times to reach where it left off.
- **Yes/No toggles expose no pressed state.** They are `<button>` elements with
  no `aria-pressed` (selection is conveyed by background colour alone), so
  assistive technology cannot tell which option is selected.

### Tooling limitation (not a product defect)

Synthesized keystrokes and mouse clicks are dropped while the Chrome window is
not rendered (`document.visibilityState === "hidden"`, zero-size viewport). Form
entry was completed by setting values through React's native setter and
dispatching real `input`/`change` events, and every value was then verified
against the database rather than trusted from the tool's own success message.
