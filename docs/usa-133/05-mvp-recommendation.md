# USA-133 · MVP recommendation

## The sequencing argument

SAVE's constraint is not engineering capacity. It is that **the product has to
be trustworthy before it can be busy.** A donor giving six figures on the
strength of an assessment needs the assessment to look and read as though a
serious institution produced it. Everything that serves that ships first;
everything that serves scale waits.

That produces one non-obvious call: **the staff portal ships in Launch, ahead
of most donor features.** SAVE cannot publish a trustworthy assessment faster
than its reviewers can produce one, and today they are working in a dark
interface with no queue, no assignment UI and no audit view. Fixing that raises
throughput and quality at the same time.

---

## Launch

*Everything needed for a donor to find a ministry, trust the assessment, and
begin a relationship — and for SAVE to produce assessments at a defensible
standard.*

**Foundation**
- Design tokens and the component system — this is not optional groundwork, it
  is the reason the rest is affordable
- Retire the dark internal theme; delete the `theme: "dark" | "light"` fork in
  `lib/save-tier.ts`
- Replace the placeholder root metadata

**Public**
- Ministry library with search and filters
- Ministry profile: impact, assessment, leadership, testimonies, provenance
- The standard explained

**Donor Portal**
- Home: relationship feed, position, advisor
- Following and saved
- Ministry detail
- Giving history and annual statement PDFs
- Updates

**Ministry Portal**
- Overview with journey and next best action
- Assessment, section at a time, saving continuously
- Evidence with per-item status and reviewer notes
- Findings — a ministry seeing what SAVE concluded is the single highest-value
  addition in this entire redesign
- Profile editing and testimonies

**Staff Portal**
- Application queue with stage, assignment, SLA
- Reviewer workspace: evidence, scoring with audited overrides, findings,
  decision
- Publishing workflow with the second-reviewer and ministry sign-off gates
- Audit history

**Deliberately excluded from Launch:** prayer, roadmap tracking, reports,
donor updates authoring, leader health, comparison tooling. Each is real value;
none is required for the first trustworthy transaction.

---

## V2

*Deepen the relationship once it exists.*

- **Prayer** — requests, "I'm praying", answered-prayer threads. Held back only
  because it needs Launch's following graph to be meaningful.
- **Roadmap and implementation** — turning findings into owned, dated items
  with SAVE verification. The mechanism that makes reassessment cheap.
- **Ministry reports** — twice-yearly narrative, impact and financials
- **Donor updates authoring**, with the two-per-month cap
- **Leader health** — check-in cadence and watch list
- **Reviewer assignment and load balancing** as a managed surface
- **Donor access request workflow** in the staff portal
- Notification preferences; annual statement automation
- Comparison as an action inside Following and the staff queue

---

## Future

*Only worth building once volume justifies it.*

- Multi-user ministry accounts with per-section delegation
- Donor visits and introductions as a scheduled workflow
- Reassessment automation driven by roadmap completion
- Multi-currency and international donor tax receipting
- Public API for donor-advised fund integrations
- Ministry-to-ministry peer benchmarking
- Impact verification via third-party field audits

---

## Suggested build order

1. Tokens + component system + shell *(unblocks everything)*
2. Staff portal *(raises assessment throughput and quality)*
3. Public library + ministry profile *(the front door)*
4. Ministry portal: assessment, evidence, findings
5. Donor portal: home, following, ministry detail
6. Donor giving and statements
7. Ministry profile editing and testimonies
8. Publishing workflow end to end

Steps 1 and 2 have no donor-visible output, which will feel slow. They are what
makes steps 3–8 take weeks instead of months.

---

## Wiring the preview to real data

The preview renders from `lib/preview/data.ts`. The fixture shapes deliberately
mirror the real domain — six assessment categories matching
`lib/scoring/categories/`, four SAVE tiers matching `lib/save-tier.ts` — so
adoption is a data-source swap per screen rather than a rewrite:

| Screen | Real source |
|---|---|
| Library, ministry profile | `lib/donors.ts`, `lib/brief.ts` |
| Donor detail | `lib/brief.ts`, `lib/voice-alignment.ts` |
| Ministry assessment | `lib/inquiry.ts`, `lib/vetting.ts` |
| Ministry evidence | `app/api/applications/[id]/documents/…` |
| Staff queue and review | `lib/review.ts`, `lib/scoring/*` |
| Publishing | `lib/brief.ts` |

Four things have no backing model yet and need one: **following**, **giving and
statements**, **testimonies**, and **prayer**. Those are new tables, and they
are the schema work Launch implies.

---

## Guardrails worth keeping

Two checks caught real defects during this work and should run in CI:

- **Token contrast sweep** — every foreground/background pair the system
  produces, asserted at 4.5:1. This caught the navy-on-navy button.
- **Hardcoded hex lint** — fail the build on raw hex in `app/` and
  `components/`. The audit found 1,352 occurrences; without a lint they return.
