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

## Scoring baseline — submitted pilot (2026-09-23)

The submitted disposable pilot is the fixed reference point for any future
scoring change. Recorded here so a later recalibration can be measured against
a known result rather than a remembered one.

| Category | Score |
| --- | --- |
| **Total** | **83 / 100** |
| Leadership | 20 |
| Doctrine | 15 |
| Fruit | 16 |
| Governance | 13 |
| Financial | 12 |
| External trust | 7 |

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

## Staff review stage (2026-09-23)

Reviewer assigned and the submitted evidence examined through the real staff
workspace as `pilot-admin@savestandard.org`. No score was overridden and no
answer changed.

### `PRODUCTION VERIFIED`

- **Reviewer assignment.** Assigned through the real UI; persisted to
  `organizations.assigned_reviewer_id`. Only the pilot organisation row changed —
  the application row, status and score were untouched.
- **Complete Application evidence (Finding R).** All eight sections render the
  ministry's answers verbatim, labelled "Read-only ministry evidence — scoring,
  risk flags and SAVE-assisted analysis appear separately below."
- **References (Finding S).** All three render with name, role, email and
  relationship, and score 3/3.
- **Documents.** All six listed; a signed link returns HTTP 200,
  `application/pdf`, `%PDF-1.4`. Short-lived signed URLs work.
- **Document analysis.** 990, Bylaws and Doctrinal analyses ran against the real
  uploaded files and correctly identified them as fictional placeholders without
  real content — the analysis read the documents rather than the form.
- **AI summary (P2).** Generated from the submitted evidence; the payload keeps
  `ministry_submitted` and `save_derived_context` separate, and the UI labels the
  output "SAVE's synthesis, not the ministry's testimony". The summary surfaced
  the IRS and website flags as top risks.

### `FOUNDER DECISION REQUIRED` — five points are awarded without evidence

Two scoring components award credit for judgements nobody has made:

| Component | Awarded | Rationale as displayed |
| --- | --- | --- |
| `self_score_honesty` | 3 / 3 | "Default reviewer honesty credit applied **pending manual review**" |
| `irs_clean` | 2 / 2 | "Default IRS/external-check credit applied **pending analyst review**" |

No reviewer had reviewed anything when these were awarded. Worse, `irs_clean`
contradicts SAVE's own evidence: the **IRS TEOS check flagged "EIN not found in
IRS database"**, and the Website check flagged "Website returned error or is
unreachable", while the engine granted full external-check credit.

Without these two defaults the composite would be **78/100** rather than 83/100.
The engine's own AI summary lists the IRS flag as a top risk, so SAVE's analysis
and SAVE's score currently disagree with each other.

Recorded, not corrected — scoring policy is frozen by founder direction.

### `FOUNDER DECISION REQUIRED` — presence-based scoring

`theory_of_change` (5/5), `spiritual_measurement_method` (4/4) and
`leadership_conflict_notes` (3/3) are awarded because text "was provided". The
rationale strings say so explicitly. A ministry writing "None." in the conflict
field appears to earn the same three points as one describing a mediated
conflict. This is the known fruit length/keyword calibration issue reaching
components outside the fruit category.

### `MISSING IMPLEMENTATION` — no reviewer-role account exists

Only two staff identities exist, both `admin`: `pilot-admin@savestandard.org`
and `ryan@usamissionaries.org`. There is no account with the `reviewer` role, so
reviewer-versus-admin scoping cannot be exercised, and the second-reviewer gate
on a donor brief cannot be tested without involving a real founder account. A
disposable `reviewer`-role identity is needed before the publishing gate can be
verified end to end.

### Reviewer observations, not defects

- `references` scored 3/3 from what the ministry submitted, while the
  `References` external check is still "Pending — No result recorded". SAVE has
  credited references it has not yet contacted. Defensible as "references
  supplied", but submitted evidence and verified evidence are not the same thing.
- `leader_marital_status` awards 4/4 for "Married and stable". That is a rubric
  policy question rather than a defect.
- Four external checks are adverse (IRS TEOS, Website, Bylaws Analysis,
  Doctrinal Analysis) and three remain Pending (Form 990, Candid, References).
