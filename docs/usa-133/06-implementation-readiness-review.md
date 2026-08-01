# USA-133 · Implementation-readiness review

This file records the Codex readiness pass requested after founder review of
the design source branch.

| | |
|---|---|
| Repository | `rfox0629/save-website` |
| Local dispatcher worktree | `/Users/ryanfox/USAM-Worktrees/usa-133-codex-20260801130935` |
| Clean integration branch | `ryan/usa-133-redesign-save-ministry-donor-and-staff-administration` |
| Integration base | `origin/main` at `76f796b` |
| Design source reviewed | `usa-133/save-standard-redesign` at `8b0c135` |
| Source ancestry | `rescue/save-website-local-work-20260727` plus four USA-133 commits |

## Recommendation

Use a clean cherry-pick of the USA-133 design delta onto the dispatcher issue
branch from `origin/main`.

Do not merge or rebase the source branch wholesale. The source branch is based
on `rescue/save-website-local-work-20260727`, and that rescue base contains
unrelated local work and CI regression risk. The clean branch should include
only the design/prototype/docs delta, excluding generated runtime logs and
leaving the original design branch untouched.

Applied integration hardening:

- Excluded `error.log`, which was runtime output and contained local session
  metadata unrelated to the design deliverable.
- Kept `.github/CODEOWNERS`, `.github/workflows/ci.yml`, and
  `docs/ci-baseline.md` from `origin/main`.
- Retained the shadcn `sidebar` and `chart` Tailwind color aliases while adding
  the SAVE design scales. The source branch removed those aliases; keeping them
  is lower risk for future shadcn/ui additions and existing CSS variables.

## Comparison against `main`

The approved source branch contains four USA-133 commits:

| Commit | Scope |
|---|---|
| `3df1e8b` | SAVE design tokens, shared component system, public/donor/ministry preview surfaces |
| `6accdc2` | Staff preview surfaces, design-language reference, accessibility fixes, first screenshot set |
| `d9abe2b` | Founder review documentation package |
| `8b0c135` | Screenshot index and responsive screenshot recaptures |

Files inherited from `rescue/save-website-local-work-20260727` and excluded
from this clean integration:

| File | Rescue change | Readiness decision |
|---|---|---|
| `.github/CODEOWNERS` | Deleted relative to current `main` | Exclude; preserve current CODEOWNERS |
| `.github/workflows/ci.yml` | Deleted relative to current `main` | Exclude; preserve CI |
| `docs/ci-baseline.md` | Deleted relative to current `main` | Exclude; preserve CI documentation |
| `package.json` | Removed `typecheck` script | Exclude; preserve current script |
| `ChatGPT Image Apr 24, 2026, 02_20_19 PM.png` | Added root image asset | Exclude; unrelated to USA-133 prototype |
| `ChatGPT Image Apr 24, 2026, 11_06_23 AM.png` | Added root image asset | Exclude; unrelated to USA-133 prototype |
| `app/favicon.ico` | Added favicon | Exclude; unrelated to USA-133 readiness |
| `public/wheat.svg` | Added wheat artwork | Exclude; unrelated to USA-133 readiness |
| `docs/save-website-summary.md` | Added broad repo summary | Exclude; unrelated to USA-133 readiness |
| `error.log` | Added local runtime/session log in USA-133 source commit | Exclude; generated output, not design work |

## Verified deliverables

The design package includes:

- 25 screenshots in `docs/usa-133/screenshots/` with an index at
  `docs/usa-133/screenshots/INDEX.md`.
- A working preview index at `/preview`.
- Preview routes for public library/profile, donor, ministry, staff, and
  system/design-token surfaces under `app/(preview)/preview/**`.
- Shared component system in `components/save/`.
- Static fixtures in `lib/preview/data.ts`.
- Design tokens in `app/save-design.css`, imported from `app/globals.css`.

The preview route count is intentionally larger than the brief's required core
screen count: the package includes the required screens plus supporting donor,
ministry, staff, and system views needed for a coherent walkthrough.

## Shared-change review

| File | Change | Regression assessment |
|---|---|---|
| `app/globals.css` | Adds `@import "./save-design.css";` | Low risk. The design CSS defines global custom properties but applies typography/background behavior through `.save-root`, which is used by the preview layout. |
| `tailwind.config.ts` | Adds SAVE color/type/spacing/radius/elevation scales | Moderate risk because it changes shared Tailwind theme values. This integration retains shadcn `sidebar` and `chart` aliases to avoid narrowing current compatibility. Build/lint must stay green before merge. |
| `lib/utils.ts` | Replaces stock `twMerge` with `extendTailwindMerge` for SAVE custom classes | Low to moderate risk. This fixes a real contrast defect where custom `text-*` size/color classes were merged incorrectly. Existing `cn()` call sites still use the same public API. |

## Environment hygiene

`.env.local` is ignored by `.gitignore`. No `.env.local` file is tracked in
Git, and no `.env.local` file is present in this isolated worktree. This issue
did not add or modify production configuration or secrets.

Local route validation requires non-secret placeholder Supabase env vars because
the shared root layout creates a Supabase client before preview routes render.
Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, preview
URLs return 500 before reaching the static fixture UI. With local placeholders,
the preview package renders without credentials or production secrets.

## Capability map

| Designed capability | Existing frontend/backend capability | Frontend-only work needed | Missing schema/backend capability | Founder/security decision |
|---|---|---|---|---|
| Public approved-ministry library | Published donor briefs via `donor_briefs`, `lib/donors.ts`, `/donors`, `/brief/[slug]` | Reframe as ministry library and apply SAVE design system | Rich profile fields, explicit library visibility may need columns | Confirm public vs donor-gated assessment details |
| Public ministry profile | Published brief rendering, scores, risk flags, voice alignment | New relationship-first profile layout and website handoff | Profile media/story fields if not stored in briefs | Confirm what sensitive findings stay private |
| Donor dashboard | Auth role routing and current donor comparison/dashboard | Replace comparison-first dashboard with followed-ministry home | Following graph, unread/update feed | Confirm donor access model remains invitation/approval based |
| Donor ministry detail | Public brief data can seed assessment/trust sections | Build private donor detail around followed ministry | Reports/testimonies/giving history by ministry | Confirm donor-visible provenance labels |
| Donor giving and annual statements | No direct giving/statement route or table | Prototype can be implemented as static/empty state first | Gifts, commitments, statements, provenance/reconciliation tables | Launch records gifts only; no SAVE payment processing initially |
| Donor follows/selects ministries | No follow table or saved list | UI can show call-to-action and empty states | Donor-ministry following table and permissions | Confirm whether staff can view individual follow relationships |
| Ministry overview/status | Applications, organizations, status, profile role org id | New light dashboard/shell | More granular journey/stage fields if current statuses are insufficient | Confirm stage names and approval language |
| Ministry assessment/evidence | Inquiry/vetting forms, documents endpoint/status API | Redesign existing forms into sectioned workspace | Evidence request/reviewer-note state may need normalization | Confirm ministry multi-user roles |
| Ministry findings and roadmap | Scores, score components, risk flags, reviewer notes | Read-only findings view can be built from existing review data | Roadmap items, owners, verification state | Confirm whether ministries keep findings after pause/decline |
| Ministry reports/testimonies | No first-class tables/routes found | Frontend shells and submission forms | Reports, testimonies, consent, staff moderation | Confirm testimony consent/review policy |
| Staff queue/review | `/dashboard`, `/applications/[id]`, `lib/review.ts`, scores, reviewer notes | Redesign and consolidate current dark staff surfaces | SLA/reviewer workload fields if required | Confirm assessor portfolio visibility |
| Staff publishing controls | Donor brief `published` flag and brief editor | Make publishing gates explicit | Separate donor-library visibility/profile-readiness state may be needed | Confirm publish/unpublish reversibility and donor notice |
| Staff donor visibility | Donor requests table/actions exist | Redesign donor request/visibility management | Donor follow/giving aggregates require new models | Confirm staff privacy boundary for donor activity |
| Audit/activity history | Some timestamps and notes exist | Basic UI can show current events | Dedicated audit log for decisions/visibility/moderation | Confirm required audit retention and roles |
| Restricted leader-health treatment | Leadership scoring/voice alignment data exists | Stronger visual privacy treatment in staff UI | Dedicated leader-health records and access policy | Founder/security must define authorized viewers before real data |

## Launch sequence

1. SAVE staff portal foundation: queue, review workspace, assignment,
   decisioning, and explicit publishing controls.
2. Ministry findings and roadmap: expose conclusions, recommendations, and
   next-step ownership back to ministries.
3. Ministry portal redesign: overview, assessment/evidence workspace, public
   profile readiness.
4. Public ministry library and profile: relationship-first public discovery
   from approved/published ministries.
5. Initial donor portal: dashboard, followed-ministry detail, advisor context,
   and empty states for future relationship data.
6. Later schema-backed modules: following graph, giving/statements,
   testimonies, reports, prayer, donor update feeds, and leader-health records.

## Validation

Validation run on 2026-08-01 in the isolated dispatcher worktree:

| Check | Result |
|---|---|
| `npm ci --cache /private/tmp/usa-133-npm-cache` | Passed. The first `npm ci` attempt failed because the dispatcher npm cache at `/Users/ryanfox/.usam-dispatcher/tmp/npm-cache` contains root-owned files; rerunning with a writable temp cache passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed with no warnings or errors. |
| `npm run build` | Passed; Next.js generated 61 static pages. |
| `git diff --check` | Passed. |
| Screenshot inventory | Passed; 25 non-empty PNGs in `docs/usa-133/screenshots/`, all readable as PNG images. |
| Preview route check | Passed with preview-safe local env placeholders; 36 concrete preview URLs returned HTTP 200. |

Route-check command used:

```bash
PORT=3001 \
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-preview-anon \
npm start
```

Then a Node fetch loop checked `/preview`, the public/donor/ministry/staff
preview pages, and all six generated ministry slugs for both public profile and
donor detail routes. Result: `checked=36 failed=0`.

Dependency note: `npm ci` reports 18 audit findings inherited from the current
dependency tree. No dependency upgrades were made in this design/readiness
issue.

## Boundaries

No migrations, Supabase changes, auth, identity, tenancy, memberships, RLS,
payment processing, production data, Workspace V2 changes, production deploy,
or merge to `main` are part of this integration.
