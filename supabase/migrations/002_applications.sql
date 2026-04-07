create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  cycle_year integer,
  status text not null default 'inquiry_submitted',
  decision text,
  decision_date timestamptz,
  decision_notes text,
  decision_made_by uuid references auth.users (id) on delete set null
);

create index if not exists applications_organization_id_idx
  on public.applications (organization_id);

create index if not exists applications_status_idx
  on public.applications (status);

create index if not exists applications_cycle_year_idx
  on public.applications (cycle_year);

create trigger set_applications_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();
