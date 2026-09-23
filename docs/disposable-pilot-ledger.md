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

| Class                       | Meaning                                            |
| --------------------------- | -------------------------------------------------- |
| `PRODUCTION VERIFIED`       | Exercised against production and behaved correctly |
| `BUG FOUND + FIXED`         | Defect found, repaired, merged and deployed        |
| `MISSING IMPLEMENTATION`    | Promised or implied behaviour that does not exist  |
| `FOUNDER DECISION REQUIRED` | Product or policy question; not mine to settle     |

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

> Ministry-supplied Reference → staff-reviewed evidence → _optional_
> staff-initiated Voice Alignment request

- A Reference and a Voice Alignment respondent are **not synonymous**. The
  ministry supplies the reference; SAVE decides whether to initiate Voice
  Alignment with that person.
- Submission must **never** automatically send an invitation.
- Staff should eventually be able to initiate the existing Voice Alignment
  request _from_ a submitted reference, with name, email and relationship
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

## Scoring baseline — submitted pilot (2026-09-23)

The submitted disposable pilot is the fixed reference point for any future
scoring change. Recorded here so a later recalibration can be measured against
a known result rather than a remembered one.

| Category       | Score        |
| -------------- | ------------ |
| **Total**      | **83 / 100** |
| Leadership     | 20           |
| Doctrine       | 15           |
| Fruit          | 16           |
| Governance     | 13           |
| Financial      | 12           |
| External trust | 7            |

- Hard stop: **none**
- Medium risk flags: `family_on_board`, `recent_deficit`
- `references`: **3 / 3** (S1, [#25](https://github.com/rfox0629/save-website/pull/25))
- `staff_doctrinal_affirmation`: **3 / 3** (P1, [#24](https://github.com/rfox0629/save-website/pull/24))

**Do not recalibrate against this yet.** Scoring weights, the fruit
length/keyword rules, and Findings A, A2 and B remain untouched by founder
direction. This record exists so that when they are revisited, the change in
output is visible rather than inferred.

---

## Attribution integrity — Findings G and L (2026-09-23)

### G — a staff departure destroyed evidence — `BUG FOUND + FIXED`

`reviewer_notes.reviewer_id` cascaded from `auth.users`: deleting a staff
identity deleted their reviewer notes outright — the evidence itself, not the
byline. Every other person column was `set null`, which kept the row and erased
who acted, including `applications.decision_made_by`.

Repaired in [#30](https://github.com/rfox0629/save-website/pull/30) with
immutable attribution snapshots plus soft deactivation (`profiles.deactivated_at`).
The live foreign key resolves the current identity; the snapshot
(`<role>_actor_id/name/email`) is written at the action and never afterwards.
Eleven historical staff actions carry snapshots.
`organizations.assigned_reviewer_id` deliberately does not: it is a current
assignment, not a historical event.

**Proved in production:** deleting a reviewer's identity leaves the note intact,
the live id released to null, and the snapshot id, email and note text retained.
A deactivated admin holding the same live session reads 0 applications, 0 vetting
responses, 0 notes and 0 briefs, where an active one reads 3.

### L — an authorless brief was approvable by anyone — `BUG FOUND + FIXED`

The gate was `generated_by === approver`. A null author makes that comparison
false, so the two-person requirement vanished exactly when authorship was
missing. Approval now fails closed: an author must be identifiable from the live
foreign key or the snapshot, and the author can never approve their own brief.

### Assessment decisions have no distinct action — `FOUNDER DECISION REQUIRED`

`applications.decision_made_by` exists, has a foreign key, and **has never been
written by any code path**. Investigating why found the reason: there is no
distinct assessment-decision mutation. `approved` and `declined` are reachable
only through the generic eight-status selector, and `hard_stop` and
`under_review` are written automatically by the pipeline.

Attribution was therefore deliberately **not** added for it — snapshotting a
write that never happens would repeat the defect. Recording who decided requires
a real decision action first. This connects to Finding O (the generic status
selector) and to the observation that `vetting_submitted` is transient: an
application passes through it in seconds on its way to `under_review`.

### Attribution was barely recorded at all — `PRODUCTION VERIFIED` (as a baseline)

Before this work, exactly **one row** in the entire database carried a person
attribution (`inquiry_events.actor_id`). Fourteen rows of external checks, six
documents, three applications, two briefs, two scores and two risk flags all had
none. Those rows are historically irrecoverable and are recorded as such — no
actor was inferred from timestamps, assignments, membership or likely users.

### Evidence provenance — `BUG FOUND + FIXED`

`documents.uploaded_by` was written only by `/portal/documents`, never by the
Complete Application, so the pilot's six documents record no supplier. The
row-level policy scoped documents by organisation but never constrained the
column, so a client could also name someone else. A `before insert` trigger now
records the session's own user, fixing both paths and making a client-supplied id
irrelevant. The six existing documents remain unattributed rather than
backfilled on assumption.

### Two defects found by verification rather than review

- `reviewer_notes.reviewer_id` was `NOT NULL`, so `on delete set null` could not
  execute and the delete errored instead — failing safe, but blocking staff
  offboarding. The column is now nullable; without that the foreign-key change
  was inert.
- `getCurrentProfile` selected only `id, role, organization_id`, so the new
  deactivation gate would have read `undefined` and silently never fired.

### New City Fellowship — single approved correction

The brief was `published = true` with neither author nor approver. Set to
`published = false`. Donor visibility proved `false` before and `false` after —
the donor-facing gate filters on `approved_by is not null`, so it was never
donor-visible. No author, approver or snapshot was added, and no other New City
record was touched.

---

## Finding T — no explicit SAVE assessment-decision action exists — `FOUNDER DECISION REQUIRED`

`approved` and `declined` are reached through the generic later-stage status
selector, the same control used for ordinary workflow progression. Automated
processes write other statuses independently: the scoring pipeline sets
`under_review` or `hard_stop`, and the external-check orchestrator sets
`under_review`. The inquiry stage has its own three actions and is not involved.

So there is no authoritative decision event for `applications.decision_made_by`
to attach to. The column exists, carries a foreign key, and has never been
written by any code path in the product's history. `decision`, `decision_date`
and `decision_notes` are likewise unwritten.

Attribution was deliberately **not** added for it in
[#30](https://github.com/rfox0629/save-website/pull/30): snapshotting a write
that never happens would repeat the defect that work existed to fix.

**Founder direction (2026-09-23):** do not populate `decision_made_by`, do not
treat a generic status mutation as a formal SAVE decision, and do not redesign
this yet. The decision action will be defined after the real reviewer workflow
has been exercised.

Related: Finding O (the generic eight-status selector reappears after approval),
and the observation that `vetting_submitted` is transient — an application passes
through it in seconds on its way to `under_review`.

---

## Scoring baselines — before and after the unsupported-credit repair

**Historical pre-repair baseline: 83 / 100.** The score the submitted pilot
received on 2026-09-23 before the repair below. Retained as the historical
record of what the engine produced at submission.

**Corrected mechanical score: 78 / 100.** The same submitted answers and the same
recorded external checks, scored once unsupported default credit is removed.

| Category       | Pre-repair | Corrected |
| -------------- | ---------- | --------- |
| Leadership     | 20         | 20        |
| Doctrine       | 15         | 15        |
| Fruit          | 16         | **13**    |
| Governance     | 13         | 13        |
| Financial      | 12         | 12        |
| External trust | 7          | **5**     |
| **Total**      | **83**     | **78**    |

Only two components changed. `self_score_honesty` 3 → 0 and `irs_clean` 2 → 0.
Nothing was rebalanced and the five points were not redistributed.

**78 is a mechanical score, not a SAVE assessment or recommendation.** No
reviewer judgment, relational diligence or decision is reflected in it.

### The repair — `BUG FOUND + FIXED`

Both components awarded credit for judgements nobody had made, and said so in
their own rationales:

- `self_score_honesty` gave 3/3 "pending manual review";
- `irs_clean` gave 2/2 "pending analyst review", **while SAVE's own IRS TEOS
  check had flagged "EIN not found in IRS database"**.

A pending judgment is not positive evidence. Both now award zero with an
accurate rationale, and IRS credit is read from the recorded check: `pass` earns
the two points, `flag`/`fail` earns nothing as adverse evidence, and anything
unrecorded reads as not established.

This required the scoring engine to load `external_checks` for the first time —
it previously scored external trust without ever reading SAVE's own external
evidence, which is why the contradiction was possible.

### `FOUNDER DECISION REQUIRED` — narrative scoring rewards presence, not quality

`theory_of_change` (5/5), `spiritual_measurement_method` (4/4) and
`leadership_conflict_notes` (3/3) are awarded on text length and keyword
presence. `theory_of_change` requires over 200 characters containing one of a
handful of words; `spiritual_measurement_method` requires over 100 characters;
`leadership_conflict_notes` requires only that text exists, so "None." appears to
earn the same three points as a described and mediated conflict.

Deliberately unchanged by founder direction: how narrative evidence should
contribute will be decided after relational diligence is exercised.
