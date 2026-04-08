alter table public.applications
add column if not exists ai_summary_generated_at timestamptz;
