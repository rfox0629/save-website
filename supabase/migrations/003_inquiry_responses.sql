create table if not exists public.inquiry_responses (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  lead_name text,
  years_in_role integer,
  theological_education text,
  ordination_status text,
  board_size integer,
  board_compensated boolean,
  denomination text,
  doctrinal_statement_url text,
  scripture_position text,
  gospel_clarity text,
  baptism_position text,
  annual_revenue_range text,
  funding_sources text[] not null default '{}',
  files_990 boolean,
  audit_level text,
  board_approved_budget boolean,
  annual_reach integer,
  key_metric text,
  has_references boolean,
  legal_action boolean,
  moral_failure boolean,
  financial_investigation boolean,
  funding_rationale text,
  referral_source text,
  raw_data jsonb not null default '{}'::jsonb
);

create index if not exists inquiry_responses_application_id_idx
  on public.inquiry_responses (application_id);

create trigger set_inquiry_responses_updated_at
before update on public.inquiry_responses
for each row
execute function public.set_updated_at();
