# USA-133 · SAVE Standard Complete Product Redesign

Start here: **[00-founder-review.md](00-founder-review.md)**

| Document | Contents |
|---|---|
| [00-founder-review.md](00-founder-review.md) | Branch, commits, screenshots, rationale, MVP, open decisions |
| [01-ux-audit.md](01-ux-audit.md) | What is broken today, measured |
| [02-information-architecture.md](02-information-architecture.md) | New IA — desktop, tablet, mobile |
| [03-design-language.md](03-design-language.md) | Colour, type, spacing, radius, elevation, motion |
| [04-component-system.md](04-component-system.md) | The reusable component library |
| [05-mvp-recommendation.md](05-mvp-recommendation.md) | Launch / V2 / Future and build order |

Screenshots are in [`screenshots/`](screenshots/), numbered in review order —
see [`screenshots/INDEX.md`](screenshots/INDEX.md).

## Running the preview

```bash
npm install
npm run dev
```

Open <http://localhost:3000/preview>.

The preview renders from static fixtures in `lib/preview/data.ts`. It does not
touch Supabase, auth, tenancy or RLS, so it runs without credentials.
