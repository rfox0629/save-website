# Screenshots

Captured at 2× from a production build. Review in numbered order.

## Orientation

| | |
|---|---|
| `01-preview-index` | Index of all 17 screens |
| `02-design-language` | Colour, type, components, spacing — rendered from live tokens |

## Public

| | |
|---|---|
| `03-public-library` | Ministry library — the front door |
| `04-public-ministry-profile` | Ministry profile with assessment and provenance |

## Donor Portal

| | |
|---|---|
| `05-donor-dashboard` | Home — relationship feed, position, advisor, prayer |
| `06-donor-giving` | Gift history, annual statements, commitments |
| `07-donor-ministry-detail` | Ministry detail — the relationship view |
| `08-donor-following` | Following and saved for later |
| `09-donor-prayer` | Prayer requests |

## Ministry Portal

| | |
|---|---|
| `10-ministry-dashboard` | Overview — journey and next best action |
| `11-ministry-assessment` | Assessment workflow with inline reviewer notes |
| `12-ministry-evidence` | Evidence upload and per-item status |
| `13-ministry-findings` | Findings — strengths, gaps, risks |
| `14-ministry-roadmap` | Roadmap and implementation |
| `15-ministry-profile-edit` | Profile editing |
| `16-ministry-testimonies` | Testimonies with consent capture |
| `17-ministry-reports` | Twice-yearly reporting |

## Staff Portal

| | |
|---|---|
| `18-staff-queue` | Application queue with SLA and reviewer load |
| `19-staff-review` | Reviewer workspace — evidence, scoring, findings, decision |
| `20-staff-publishing` | Publishing workflow with its gates |
| `21-staff-leaders` | Leader health |
| `22-staff-audit` | Audit history |

## Responsive

| | |
|---|---|
| `23-narrow-donor` | Donor home at 640px |
| `24-narrow-library` | Public library at 640px |
| `25-tablet-ministry` | Ministry overview at 900px |

**A note on these three.** Headless Chrome will not lay out below roughly
640px — it crops rather than reflows — so a true 375/414px capture is not
possible this way. The sub-640 breakpoints were verified in an emulated
414px viewport instead: `document.scrollWidth === clientWidth === 414`, with
no horizontal overflow, the stat row at 2-up, cards single column, and the
navigation strip scrolling inside its own container as designed.
