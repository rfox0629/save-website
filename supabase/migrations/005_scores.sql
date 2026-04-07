create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  calculated_at timestamptz not null default timezone('utc', now()),
  calculated_by text not null default 'engine',
  total_score integer,
  leadership_score integer,
  doctrine_score integer,
  governance_score integer,
  financial_score integer,
  fruit_score integer,
  external_trust_score integer,
  is_hard_stop boolean not null default false,
  hard_stop_reason text,
  override_by uuid references auth.users (id) on delete set null,
  override_notes text
);

create index if not exists scores_application_id_idx
  on public.scores (application_id);

create index if not exists scores_calculated_at_idx
  on public.scores (calculated_at desc);
