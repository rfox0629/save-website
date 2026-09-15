-- Phase B: publishing gates, findings/roadmap, and relational-diligence tier rule.
--
-- Completing an assessment and publishing it are separate decisions:
--  * donor_briefs.approved_by / approved_at  -> second-reviewer approval gate
--  * organizations.library_visible           -> explicit publish-to-donor-library
-- Findings can be shared to the ministry independently of donor publication:
--  * applications.findings_shared_at
-- The top trust tier normally requires completed in-person relational diligence;
-- a documented SAVE-admin exception is recorded (never a silent bypass):
--  * applications.relational_diligence_exception

alter table public.donor_briefs
  add column if not exists approved_by uuid references auth.users (id) on delete set null,
  add column if not exists approved_at timestamptz;

alter table public.organizations
  add column if not exists library_visible boolean not null default false;

alter table public.applications
  add column if not exists findings_shared_at timestamptz,
  add column if not exists relational_diligence_exception text;

-- Staff-side roadmap: findings turned into owned, dated implementation items.
-- Internal/staff-owned for now; ministry projection comes later behind
-- applications.findings_shared_at.
create table if not exists public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  detail text,
  category text,
  owner text,
  due_date date,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'verified', 'waived')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists roadmap_items_application_id_idx
  on public.roadmap_items (application_id);

create trigger set_roadmap_items_updated_at
before update on public.roadmap_items
for each row
execute function public.set_updated_at();

alter table public.roadmap_items enable row level security;

create policy "roadmap_items_admin_reviewer_read_all"
on public.roadmap_items
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "roadmap_items_admin_reviewer_write_all"
on public.roadmap_items
for all
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'))
with check (app_private.current_profile_role() in ('admin', 'reviewer'));
