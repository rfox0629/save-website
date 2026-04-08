alter table public.vetting_responses
add column if not exists submitted_at timestamptz;
