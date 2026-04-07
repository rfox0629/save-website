create table if not exists public.risk_flags (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  flagged_at timestamptz not null default timezone('utc', now()),
  flagged_by text not null default 'engine',
  severity text not null check (severity in ('low', 'medium', 'high', 'hard_stop')),
  category text not null,
  flag_code text not null,
  description text not null,
  resolved boolean not null default false,
  resolved_by uuid references auth.users (id) on delete set null,
  resolved_at timestamptz,
  resolution_notes text
);

create index if not exists risk_flags_application_id_idx
  on public.risk_flags (application_id);

create index if not exists risk_flags_severity_idx
  on public.risk_flags (severity);

create index if not exists risk_flags_resolved_idx
  on public.risk_flags (resolved);
