-- Inquiry-stage history.
--
-- The inquiry stage now has real staff actions (approve, request more information,
-- decline) and a ministry can resubmit after a request. None of that history can be
-- preserved by the existing tables: `inquiry_responses.submitted_at` is overwritten on
-- resubmission, and reviewer notes are both the wrong home for a ministry-facing message
-- and are deleted outright when a staff account is removed.
--
-- This is the smallest audit-safe addition: one append-only record per inquiry-stage
-- event. Nothing here is ever updated or deleted in normal operation.
--
-- `staff_note` is internal (the reason, or what SAVE needs). `ministry_message` is the
-- deliberate ministry-facing text. They are separate columns so an internal note can
-- never be shown to a ministry by accident.

create table if not exists public.inquiry_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  kind text not null check (
    kind in ('submitted', 'more_info_requested', 'approved', 'rejected')
  ),
  occurred_at timestamptz not null default timezone('utc', now()),
  -- Set null rather than cascade: removing a staff login must not erase the record of
  -- what SAVE decided (Finding G).
  actor_id uuid references auth.users (id) on delete set null,
  staff_note text,
  ministry_message text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists inquiry_events_application_id_idx
  on public.inquiry_events (application_id, occurred_at desc);

alter table public.inquiry_events enable row level security;

-- Staff read their queue's history directly. Ministries never read this table: the
-- portal serves the latest request through a server action that selects only the
-- ministry-facing columns, so `staff_note` cannot leak through a policy mistake.
create policy inquiry_events_admin_reviewer_read_all
  on public.inquiry_events
  for select
  to authenticated
  using (app_private.current_profile_role() = any (array['admin', 'reviewer']));
