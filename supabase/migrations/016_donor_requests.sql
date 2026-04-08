create table if not exists public.donor_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  full_name text not null,
  email text not null,
  organization text,
  referral_source text not null,
  giving_focus text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined'))
);

alter table public.donor_requests enable row level security;

create policy "donor_requests_admin_read_all"
on public.donor_requests
for select
to authenticated
using (app_private.current_profile_role() = 'admin');

create policy "donor_requests_admin_write_all"
on public.donor_requests
for all
to authenticated
using (app_private.current_profile_role() = 'admin')
with check (app_private.current_profile_role() = 'admin');
