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

---

## Relational diligence stage (2026-09-23)

Voice Alignment and Time With Leadership exercised end to end against the
disposable pilot. All diligence content is clearly labelled disposable test
data: **no site visit, meal or conversation actually took place.**

### `PRODUCTION VERIFIED`

- **Voice Alignment end to end.** Six invitations created by deliberate staff
  action (3 external from the ministry's own submitted references, 3 internal),
  six recipient responses submitted through the public token links, all
  persisted, collection status reached "Ready for Summary", synthesis generated.
- **The approved model held.** Nothing auto-sent. Each invitation required a
  staff member to choose to create it, exactly as directed.
- **Respondent privacy holds.** The page promises feedback "is never attributed
  back to the person who gave it". Verified: no DOM element contains both a
  respondent's name and their own response text — names appear only in the
  invitation roster, responses render unattributed, and the synthesis names
  nobody. (With three respondents per type, inference remains possible; the
  promise is non-attribution, not anonymity.)
- **Synthesis is genuinely triangulated.** It independently surfaced succession
  planning and administrative capacity as converging internal/external concerns,
  which is what the respondents actually raised.
- **Attribution snapshots on live staff actions.** Every invitation and
  engagement recorded `invited_actor_email` / `created_actor_email`. Finding G's
  work proving itself on real actions rather than in tests.
- **Diligence captures relational substance.** Onsite visit, shared meal and
  reference conversation each recorded with narrative, leadership character,
  culture and organisational health readings, per-reading confidence markers,
  strengths, concerns, visibility and private notes.

### `BUG FOUND` — donor excerpt leaks between engagements

The engagement form never resets after a save (`setOpen(false)` only), and the
donor excerpt is submitted regardless of visibility even though it is only
rendered when visibility is "summary shareable".

Combined, a donor-facing excerpt written for one engagement silently attaches to
the next. In this pilot the **reference conversation, explicitly marked internal
only, carries the shared meal's donor excerpt verbatim** — text never entered for
it, invisible to the reviewer because the field was not rendered, and describing
an event that did not happen in that engagement.

Consequences: stale donor-facing text on the wrong record; donor-publishable text
on a record marked internal only; and a reviewer cannot see or clear it.

Not fixed — reported for direction.

### `MISSING IMPLEMENTATION`

- **Follow-up items cannot be captured.** `diligence_engagements.follow_ups`
  exists and the API accepts `followUps`, but the form has no field for them. All
  three engagements recorded zero follow-ups despite follow-up being part of the
  intended diligence record.
- **No reference → Voice Alignment prefill.** As already known, staff retyped all
  three submitted references by hand. Recorded rather than worked around.
- **No email is sent anywhere in the product.** There is no mail provider, SMTP,
  or send call in the codebase. `createVoiceAlignmentRequest` inserts a row and
  returns an invite URL; a human must deliver every link. The UI language of
  "invitations sent" describes manual delivery. Extends Finding F.
- **No reference → diligence link.** A reference conversation cannot be
  associated with the submitted reference it followed up; the connection was
  noted in free text.

### What the relational evidence says about the mechanical score

Six voice responses and three diligence engagements, against the corrected
mechanical **78/100**:

- **Supported.** Leadership character is corroborated by six independent sources
  with no dissenting account — the strongest-evidenced part of the score.
  Financial disclosure (the 2024 deficit) was described consistently by three
  unconnected people and was volunteered before being asked.
- **Supported, but not by the mechanism that scored it.** Fruit narrative
  components scored on text length and keywords; the relational evidence happens
  to corroborate the substance (a volunteer discipled in a group now leads one;
  field staff report no pressure to inflate numbers). The score was right by
  accident, not by measurement.
- **Confirmed as a real weakness.** The family-on-board flag is genuine: the
  board chair and the spouse both raised the arrangement unprompted as something
  to resolve.
- **Unchanged.** External trust remains weak on evidence, not on judgment: the
  IRS EIN is still not found and the website is still unreachable.
- **Incomplete — the significant gap.** Succession and key-person risk were named
  independently by at least four sources and by SAVE's own site visit. **No
  scoring component measures organisational durability or key-person risk at
  all.** The mechanical score cannot express the single most consistent concern
  the relational evidence produced.

So: materially **supported** on character and disclosure, **incomplete** on
durability, and **not improved** on external verification. Recorded as evidence,
not converted into a score.

---

## Records carried forward (2026-09-23)

### `MISSING IMPLEMENTATION` — outbound invitation delivery

The product generates invitation links but sends no email. There is no mail
provider, no SMTP configuration and no send call anywhere in the codebase;
`createVoiceAlignmentRequest` inserts a row and returns a URL. Staff must
deliver every link by hand, and the interface language of invitations being
"sent" describes that manual delivery.

Deliberately **not solved here.** Controlled links are sufficient to finish the
disposable assessment, and introducing an email provider inside an integrity
repair would be the wrong change at the wrong time.

### Correction to an earlier claim in this ledger

The relational diligence entry above recorded "no reference → diligence link" as
a missing capability. That was wrong at the data layer:
`diligence_engagements.linked_voice_alignment_request_id` exists and the API
accepts `linkedVoiceAlignmentRequestId`. What is missing is only the
reviewer-facing field, so in this pilot the connection was written into free
text. Recorded as a UI gap, not an absent contract.

### The scoring position, preserved deliberately

The corrected mechanical score is **78/100**, and relational diligence surfaced
material evidence that sits outside the scoring model entirely:

- leadership character and disclosure are strongly corroborated;
- fruit substance is independently corroborated even though the mechanical
  method that scored it is weak;
- the family-on-board concern is corroborated;
- external verification remains weak;
- succession and key-person risk were raised independently by four voices plus
  SAVE's own Time With Leadership evidence;
- **no scoring component represents organizational durability or key-person
  risk.**

No succession score has been added. The 78 is unchanged. The twelve narrative
points are not recalibrated. This is held as evidence for the later rubric
review rather than converted into a number now — the gap is the finding, and
scoring it immediately would hide the fact that the model could not see it.

### Proposed correction for the leaked pilot row

Reported before any change and still unmodified:

- **row** `56770ed7-a9bd-4031-914e-7a99e986e122`
- kind `reference_conversation`, visibility `internal_only`, occurred 2026-09-19
- **value** "SAVE shared a meal in a volunteer's home. The people this ministry
  serves know its leader personally, and its volunteers speak for themselves."

The value is demonstrably inherited: it is byte-identical to the `shared_meal`
engagement's excerpt, it was never entered against this engagement, and it is
the only internal-only row in the pilot carrying donor copy.

**Smallest correction:** set `donor_excerpt` to null on that one row by id. No
other column changes, no other row touched, and no migration — the code fix
prevents recurrence, so this is a one-row cleanup of a value that should never
have been written rather than a schema concern. Awaiting direction; the rest of
the pilot evidence stays exactly as entered, imperfect internal answers included.

---

## Findings, roadmap and Brief (2026-09-24)

### `PRODUCTION VERIFIED` — the donor-excerpt repair, in production

Verified against the deployed build, not the test suite:

- a new engagement opens with every field at its default;
- saving resets the form — kind, narrative, follow-ups, visibility and excerpt all cleared;
- cancelling resets it identically;
- an internal-only engagement cannot persist a donor excerpt. Proven below the
  UI: a crafted API request carrying `visibility: "internal_only"` together with
  an explicit `donorExcerpt` returned 200 and stored `donor_excerpt` as **null**;
- switching `summary_shareable → internal_only` clears the excerpt server-side,
  by the same invariant;
- follow-up items complete create → save → reload → edit, persisting as a string
  array and rendering on the engagement.

The approval-revocation path is intact and is now *stronger* than before. It
compares the new excerpt with the previous one; previously, switching to
internal-only preserved the stale excerpt so the values matched and **no
revocation fired**. Clearing it now produces `null !== previous`, so a
donor-facing change is correctly treated as material. Behavioural proof of an
actual revocation needs an approved brief, which is outside this stop line.

### Correction of software-generated contamination

One row corrected, by explicit founder approval:
`diligence_engagements.id = 56770ed7-a9bd-4031-914e-7a99e986e122`,
`donor_excerpt` set to NULL. No other column, no other row.

**This is not an edit of reviewer testimony.** The value was written by the
defect, not by a reviewer: before the write its md5 was
`67a05bda2789da00f2163dee0c763945`, byte-identical to the `shared_meal`
engagement's excerpt, and it had never been entered against this engagement.

Proven afterwards: that row's excerpt is null; the source `shared_meal`
engagement retains its own legitimate excerpt unchanged; and every narrative,
private note, strength and concern across all pilot engagements hashes exactly as
it did before the write. The imperfect internal Voice Alignment answers remain
exactly as entered.

### Findings and roadmap

Eight reviewer findings recorded through the production workflow, each attributed
to `pilot-admin@savestandard.org` and each `is_internal = true`: leadership
integrity, fruit, governance/family-on-board, succession, external verification,
financial position, the scope of the mechanical score, and a provenance note
recording that all relational evidence here is simulated.

Six roadmap items, each a concrete action with an owner, a category and a date,
rather than a restatement of a concern: a written succession and delegation plan;
replacing the family board-secretary seat; supplying EIN documentation and
restoring a reachable website; a dated stipend schedule; a minimum bookkeeping
and minute-taking standard; and an independent financial review.

### `MISSING IMPLEMENTATION` — the ministry never receives findings or roadmap

Sharing findings writes `applications.findings_shared_at` and the interface then
states: "The ministry can see its findings and this roadmap."

**It cannot.** There is no authenticated ministry surface for either. The real
portal offers inquiry, vetting, documents and application only; the findings and
roadmap pages that exist are `/preview/*` design mockups backed by hardcoded
data. `roadmap_items` carries no ministry RLS policy at all, so even a direct
read is refused.

The gate therefore fails closed, which is the safe direction — but the reviewer
is told delivery happened when nothing was delivered. A reviewer could believe a
ministry has been given its findings when it has not.

### `MISSING IMPLEMENTATION` — the findings layer cannot see relational evidence

`generateReviewerSummary` loads inquiry responses, the Complete Application,
external checks and reviewer notes. It never reads `diligence_engagements`,
`voice_alignment_responses` or `voice_alignment_summaries`.

So the summary that feeds both the reviewer view and the donor projection is
structurally blind to Voice Alignment and Time With Leadership. Relational
evidence reaches it only if a reviewer retypes it into a note by hand, which is
what was done here. Anything a reviewer omits is invisible to every downstream
surface.

### `MISSING IMPLEMENTATION` — the Brief caps cautions at two

`toBriefFormData` pads commendations to three with `.slice(0, 3)` and cautions to
two, and the editor offers no way to add more. This file has three material
cautions — succession, external verification and the family board seat — so the
form would have forced a reviewer to drop one of them. The Brief was therefore
saved through the same authenticated API route the editor posts to, carrying all
three.

The commendations `.slice(0, 3)` is also a latent data-loss path: a brief stored
with more than three commendations is silently truncated when opened in the
editor, and the truncation is persisted on the next save.

### Information boundaries — results

Proven at the database, not merely in the interface. `diligence_engagements`,
`roadmap_items`, `voice_alignment_responses` and `voice_alignment_summaries` all
have RLS enabled with admin/reviewer policies **only** — no ministry policy and
no donor policy. `reviewer_notes` permits a ministry to read only rows where
`is_internal = false`; `createReviewerNote` hardcodes `is_internal: true`, so no
reviewer note can reach a ministry.

The donor surface is double-gated: `getPublishedBriefBySlug` requires
`published = true` **and** `approved_by IS NOT NULL`. Fetched without a session,
the public brief URL returns the application shell with no headline, no cautions
and no ministry name.

The generated Brief was inspected for leakage and contains none: no respondent
name, no verbatim Voice Alignment response, no private note, and no reviewer-note
fragment. Including Voice Alignment in a Brief exposes only the parsed synthesis,
which names nobody — `resolvePublicVoiceAlignment` returns the summary alone and
never the individual responses.

One structural observation worth recording: donor-facing strengths and risks are
read from `ai_summary`, the same reviewer summary generated from internal
reviewer notes. There is no separately authored donor summary. Nothing reaches a
donor without publication and second-reviewer approval, so this is a matter of
provenance rather than exposure — but donor-facing copy does derive from internal
material rather than being independently curated.

### The Brief

Generated through the authenticated staff workflow. `generated_by` moved from
null to the acting reviewer, with the immutable snapshot alongside it
(`generated_actor_id`, `generated_actor_email = pilot-admin@savestandard.org`) —
the Finding G and L repairs exercised on a real action. `generated_actor_name` is
null because that profile carries no display name.

It is unpublished, unapproved, and waiting for an independent reviewer. Because
`resolveBriefAuthorId` returns the author, the same identity cannot approve it.

Recommendation level was authored from the evidence as **Recommended with
Conditions** rather than left at the seeded "Recommended". The mechanical 78/100
is presented as one input and explicitly not as SAVE's assessment; succession
survives into the Brief despite having no scoring component; the family-board
concern carries its context; and the Brief opens by stating plainly that SAVE did
not visit this ministry, share a meal with anyone connected to it, or hold any
real-world conversation with a reference.

One engagement — a `video_call` dated 2026-09-24 and labelled VERIFICATION
RECORD — exists only to verify the repair. It is not diligence evidence and is
excluded from the findings, the roadmap and the Brief.

---

## Independent review and the decision lifecycle (2026-09-24)

### Test-generated duplication, corrected

One roadmap row was deleted: `6df7b98f-814d-4fc4-af63-ddfb6b3033b5`.

Proof before deletion. Both rows carried the same title, the same `detail` hash
`a4ab0dd46a379c768bfeb93af67bfdbf`, the same owner, due date and status, so they
were duplicates rather than two distinct asks. The discriminator was `category`:
every form submission during that session stored `category` as null because of a
React state problem in the automation, while the deliberate API submission sent
`category: "financial"` explicitly. The surviving row `4500e469` carries
`financial`; the deleted row carried null and was written 57 seconds later, when
a stalled browser tab finally flushed a save that had already been reported as
failed. Exactly one title was duplicated, nothing references `roadmap_items`, and
the delete matched on id, title, null category and exact timestamp together.

Seven roadmap rows remain, all six substantive items intact.

**This is test-generated duplication, not an editorial change to the
assessment.** No reviewer judgement was altered.

**Not a product defect.** The roadmap Save control is disabled for the whole
request (`disabled={pending || !title.trim()}`), so a person cannot easily
double-submit by clicking twice. The duplicate arose because automation issued
the action twice — once through a stalled tab and once through the API. No
deduplication was built, since there is no evidence of a normal product risk.

### Draft donor Brief access, closed

No state representing ministry Brief review or sign-off exists anywhere.
`donor_briefs` has no such column, and `applications` has only
`findings_shared_at`, which covers findings and roadmap.

A ministry could previously read its own donor brief at any stage, including a
working draft carrying cautions written for donors. The portal already filtered
on `published`, so nothing in the product depended on the wider access — it was
reachable only by querying the API directly with a ministry token.

Until a deliberate sign-off state exists, a ministry now sees a brief on the same
terms a donor does: published, and approved by a second reviewer. Verified as the
ministry identity: draft briefs visible **0**, findings 4, roadmap 7, internal
diligence 0, Voice Alignment 0. No sign-off state was invented.

### `PRODUCTION VERIFIED` — the independence gate

Attempted in production as the brief's own author: refused with "You wrote this
brief, so you cannot be its second reviewer." The brief remains unapproved.

Approval does **not** publish. It writes `approved_at`, `approved_by` and the
approver snapshot only; publishing is a separate action gated on approval. There
is no coupling defect to report.

Deactivation protection is intact: `requireReviewerMutationAccess` rejects a
deactivated profile before any role check, so a session outliving offboarding
cannot approve. An authorless brief fails closed in `canApproveBrief`, covered by
nine unit tests.

### `BLOCKED` — the approval action itself

`pilot-reviewer@savestandard.org` exists, has role exactly `reviewer`, is not
deactivated, and has never signed in. Acting as that identity requires its
password, which is not something to handle, so the approve action was not
performed. What the identity *can reach* was exercised directly under RLS: the
Complete Application, inquiry, 6 documents, 14 external checks, scores, risk
flags, the Voice Alignment synthesis, 5 Time With Leadership engagements, all 12
reviewer notes, the roadmap and the briefs.

No agreement was manufactured. The recommendation remains the first reviewer's
proposal.

### `MISSING IMPLEMENTATION` — a reviewer can only agree

The second reviewer has exactly two actions: "Approve as second reviewer" and
"Withdraw approval". There is no way to request changes, record a disagreement,
attach a condition, note what was examined, or say that a caution is overstated
or a commendation unsupported. A reviewer who disagrees can only decline to
click, which is indistinguishable from not having looked yet.

Nothing records *that* a review happened, only that approval did.

### Reviewer access to respondent-level Voice Alignment

Staff reviewers can read individual Voice Alignment responses with respondent
names attached — six of them here. This is the product's actual permission model
rather than something loosened for the test. The promise that feedback is "never
attributed back to the person who gave it" holds against ministries and donors,
not against SAVE staff. Worth deciding deliberately rather than by default.

### `FOUNDER DECISION REQUIRED` — the smallest decision lifecycle

Grounded in what this pilot actually needed, not the eight-status selector.

The pilot produced four distinct things that the product currently conflates:
a reviewer's *proposed* recommendation ("Recommended with Conditions"), an
independent reviewer's *judgement of that proposal*, SAVE's *formal decision*
about the ministry, and the act of *publishing* to donors. Today only the first
and last have real actions, and approval silently stands in for the middle two.

Most of the state already exists:

| Stage | State today | Gap |
| --- | --- | --- |
| Reviewer recommendation | `donor_briefs.recommendation_level` | no "submitted for review" moment |
| Independent review | `approved_by`, `approved_at`, snapshots | approve only — no request-changes, no reason |
| Formal SAVE decision | `applications.decision`, `decision_date`, `decision_notes`, `decision_made_by` | **columns exist and are read in two places, but nothing ever writes them** |
| Publication | `published`, `published_at` | none |

The decision columns are already rendered on the staff page, and
`decision_notes` is already rendered to the **ministry** in its portal. The read
surfaces are built and waiting.

**Proposed smallest model — two additions, no new tables:**

1. A review outcome on the brief: `review_outcome` (`approved` |
   `changes_requested`) with `review_note` and the existing approver snapshot.
   Requesting changes returns the brief to its author with a reason, and records
   that an independent review happened even when it did not end in approval.
2. One explicit decision action writing the four `applications.decision*`
   columns, available only after an independent review has approved, and
   separate from publishing.

Publication then requires: a decision recorded, and a brief approved. A ministry
sees the decision through the surface that already exists.

Deliberately excluded: any new status enum, any workflow engine, and any change
to scoring. Not implemented — proposal only.
