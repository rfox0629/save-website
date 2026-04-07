create table if not exists public.external_checks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  checked_at timestamptz not null default timezone('utc', now()),
  checked_by uuid references auth.users (id) on delete set null,
  source text not null,
  status text not null,
  summary text,
  raw_result jsonb not null default '{}'::jsonb,
  score_impact integer
);

create index if not exists external_checks_application_id_idx
  on public.external_checks (application_id);

create index if not exists external_checks_checked_by_idx
  on public.external_checks (checked_by);
