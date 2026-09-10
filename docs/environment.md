# SAVE environment contract

The application reads exactly three Supabase environment variables. Nothing else
is consumed by application code — do not add integration-synced variants
(`SUPABASE_URL`, `POSTGRES_*`, etc.); they will be ignored and cause confusion.

| Variable | Used by | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server clients | Inlined into the client bundle at build time — a production deploy is required after changing it |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server clients | Public by design; RLS is the security boundary |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client (`lib/supabase/admin.ts`), scoring engine, public brief rendering | Secret — server only, never exposed to the client |

AI reviewer summaries additionally require:

| Variable | Used by |
| --- | --- |
| `ANTHROPIC_API_KEY` | `lib/ai/reviewerSummary.ts` and the AI summary API routes |

## Backends

| Environment | Supabase project |
| --- | --- |
| Production / Preview / Development (Vercel) | `puewobcjsgfiwcooxsmg` (save-platform, provisioned 2026-09-10) |
| Local development | Local Supabase (`supabase start`, `http://127.0.0.1:54321`) via `.env.local` |

History: the original production project (`lcxgfnjfnhohlqivldkp`) was deleted
around late July 2026; every environment variable that referenced it has been
removed. The full schema lives in `supabase/migrations/` (23 migrations,
applied in filename order) and includes the New City Fellowship demo seed.
