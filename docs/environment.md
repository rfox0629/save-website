# SAVE environment contract

The application reads exactly three Supabase environment variables. Nothing else
is consumed by application code — do not add integration-synced variants
(`SUPABASE_URL`, `POSTGRES_*`, etc.); they will be ignored and cause confusion.

| Variable                        | Used by                                                                        | Notes                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Browser + server clients                                                       | Inlined into the client bundle at build time — a production deploy is required after changing it |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server clients                                                       | Public by design; RLS is the security boundary                                                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | Admin client (`lib/supabase/admin.ts`), scoring engine, public brief rendering | Secret — server only, never exposed to the client                                                |

The AI features (reviewer summaries, voice-alignment synthesis, reputation
checks, document analysis) additionally require:

| Variable         | Used by                                   | Notes                          |
| ---------------- | ----------------------------------------- | ------------------------------ |
| `OPENAI_API_KEY` | `lib/ai/openai.ts` and every AI call site | Secret — server only           |
| `OPENAI_MODEL`   | `lib/ai/openai.ts`                        | Optional; defaults to `gpt-4o` |

`ANTHROPIC_API_KEY` is no longer read by any code path — the AI features moved
to OpenAI in USA-133 Phase A.

## Backends

| Environment                                 | Supabase project                                                             |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| Production / Preview / Development (Vercel) | `puewobcjsgfiwcooxsmg` (save-platform, provisioned 2026-09-10)               |
| Local development                           | Local Supabase (`supabase start`, `http://127.0.0.1:54321`) via `.env.local` |

History: the original production project (`lcxgfnjfnhohlqivldkp`) was deleted
around late July 2026; every environment variable that referenced it has been
removed. The full schema lives in `supabase/migrations/` (23 migrations,
applied in filename order) and includes the New City Fellowship demo seed.

## Provisioning a staff account

Staff are created directly in Supabase; there is no in-product staff signup. A
display name is required by a database constraint, because attribution reads
`profiles.display_name` and a profile without one produces snapshots that name
only an email — which is permanent once that person leaves.

Create the auth user in Supabase Auth, then insert the profile **with the name in
the same statement**:

```sql
insert into profiles (id, role, display_name)
values ('<auth-user-uuid>', 'reviewer', 'Their Name');
```

Omitting `display_name` fails on
`profiles_active_staff_need_display_name`. A staff member can change their own
name later from the staff header.

Existing accounts created before this constraint may still have a null name.
They keep acting, and their past attribution snapshots are left alone — an
absent snapshot is honest, a backfilled one is not.
