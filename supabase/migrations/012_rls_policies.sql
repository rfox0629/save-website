create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  role text not null check (role in ('admin', 'reviewer', 'analyst', 'ministry', 'donor'))
);

create index if not exists profiles_organization_id_idx
  on public.profiles (organization_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create schema if not exists app_private;

create or replace function app_private.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles as p
  where p.id = auth.uid()
$$;

create or replace function app_private.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.organization_id
  from public.profiles as p
  where p.id = auth.uid()
$$;

grant usage on schema app_private to authenticated;
grant execute on function app_private.current_profile_role() to authenticated;
grant execute on function app_private.current_organization_id() to authenticated;

alter table public.organizations enable row level security;
alter table public.applications enable row level security;
alter table public.inquiry_responses enable row level security;
alter table public.vetting_responses enable row level security;
alter table public.scores enable row level security;
alter table public.score_components enable row level security;
alter table public.risk_flags enable row level security;
alter table public.reviewer_notes enable row level security;
alter table public.documents enable row level security;
alter table public.external_checks enable row level security;
alter table public.donor_briefs enable row level security;
alter table public.profiles enable row level security;

create policy "profiles_admin_reviewer_read_all"
on public.profiles
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "profiles_users_read_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_admin_manage"
on public.profiles
for all
to authenticated
using (app_private.current_profile_role() = 'admin')
with check (app_private.current_profile_role() = 'admin');

create policy "profiles_users_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = app_private.current_profile_role()
  and organization_id is not distinct from app_private.current_organization_id()
);

create policy "organizations_admin_reviewer_read_all"
on public.organizations
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "organizations_ministry_read_own"
on public.organizations
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and id = app_private.current_organization_id()
);

create policy "organizations_ministry_update_own"
on public.organizations
for update
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and id = app_private.current_organization_id()
)
with check (
  app_private.current_profile_role() = 'ministry'
  and id = app_private.current_organization_id()
);

create policy "applications_admin_reviewer_read_all"
on public.applications
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "applications_ministry_read_own"
on public.applications
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and organization_id = app_private.current_organization_id()
);

create policy "applications_ministry_write_own"
on public.applications
for all
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and organization_id = app_private.current_organization_id()
)
with check (
  app_private.current_profile_role() = 'ministry'
  and organization_id = app_private.current_organization_id()
);

create policy "inquiry_responses_admin_reviewer_read_all"
on public.inquiry_responses
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "inquiry_responses_ministry_read_own"
on public.inquiry_responses
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = inquiry_responses.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "inquiry_responses_ministry_write_own"
on public.inquiry_responses
for all
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = inquiry_responses.application_id
      and a.organization_id = app_private.current_organization_id()
  )
)
with check (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = inquiry_responses.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "vetting_responses_admin_reviewer_read_all"
on public.vetting_responses
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "vetting_responses_ministry_read_own"
on public.vetting_responses
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = vetting_responses.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "vetting_responses_ministry_write_own"
on public.vetting_responses
for all
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = vetting_responses.application_id
      and a.organization_id = app_private.current_organization_id()
  )
)
with check (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = vetting_responses.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "scores_admin_reviewer_read_all"
on public.scores
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "scores_ministry_read_own"
on public.scores
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = scores.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "score_components_admin_reviewer_read_all"
on public.score_components
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "score_components_ministry_read_own"
on public.score_components
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.scores s
    join public.applications a on a.id = s.application_id
    where s.id = score_components.score_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "risk_flags_admin_reviewer_read_all"
on public.risk_flags
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "risk_flags_ministry_read_own"
on public.risk_flags
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = risk_flags.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "reviewer_notes_admin_reviewer_read_all"
on public.reviewer_notes
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "reviewer_notes_admin_reviewer_write_all"
on public.reviewer_notes
for all
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'))
with check (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "reviewer_notes_ministry_read_non_internal_own"
on public.reviewer_notes
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and is_internal = false
  and exists (
    select 1
    from public.applications a
    where a.id = reviewer_notes.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "documents_admin_reviewer_read_all"
on public.documents
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "documents_admin_reviewer_write_all"
on public.documents
for all
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'))
with check (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "documents_ministry_read_own"
on public.documents
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = documents.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "documents_ministry_write_own"
on public.documents
for all
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = documents.application_id
      and a.organization_id = app_private.current_organization_id()
  )
)
with check (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = documents.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "external_checks_admin_reviewer_read_all"
on public.external_checks
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "external_checks_admin_reviewer_write_all"
on public.external_checks
for all
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'))
with check (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "external_checks_ministry_read_own"
on public.external_checks
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = external_checks.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);

create policy "donor_briefs_admin_reviewer_read_all"
on public.donor_briefs
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "donor_briefs_admin_reviewer_write_all"
on public.donor_briefs
for all
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'))
with check (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "donor_briefs_ministry_read_own"
on public.donor_briefs
for select
to authenticated
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from public.applications a
    where a.id = donor_briefs.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);
