create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  legal_name text not null,
  dba_name text,
  ein text unique,
  year_founded integer,
  state_of_incorporation text,
  entity_type text,
  primary_focus text[] not null default '{}',
  geographic_scope text[] not null default '{}',
  countries text[] not null default '{}',
  website_url text,
  status text not null default 'inquiry_submitted',
  assigned_reviewer_id uuid references auth.users (id) on delete set null,
  notes text
);

create index if not exists organizations_status_idx
  on public.organizations (status);

create index if not exists organizations_assigned_reviewer_id_idx
  on public.organizations (assigned_reviewer_id);

create trigger set_organizations_updated_at
before update on public.organizations
for each row
execute function public.set_updated_at();
