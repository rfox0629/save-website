-- Historical attribution must outlive the person.
--
-- Two defects motivate this migration.
--
-- Finding G: `reviewer_notes.reviewer_id` cascaded from `auth.users`, so
-- deleting a staff identity deleted their reviewer notes outright — the
-- evidence, not merely the byline. Every other person column is `set null`,
-- which keeps the row but erases who acted.
--
-- Finding L: a donor brief whose `generated_by` is null passed the
-- self-approval check, because `null = <approver>` is false. The two-person
-- gate disappeared exactly when authorship was missing.
--
-- The model is immutable attribution snapshots plus soft deactivation. The live
-- foreign key still resolves the current identity; the snapshot is the durable
-- historical record, written once at the moment of the action and never
-- updated. Staff leave by deactivation rather than deletion, so the identity
-- row survives and the foreign keys never fire.
--
-- Convention: for a live actor column `<role>_by` / `<role>_id`, the snapshot
-- columns are `<role>_actor_id`, `<role>_actor_name`, `<role>_actor_email`.
-- `inquiry_events.actor_id` uses `actor_snapshot_*` to avoid `actor_actor_id`.
--
-- This migration is additive except for one deliberate change: the
-- `reviewer_notes` delete rule.

-- 1. Soft deactivation ------------------------------------------------------

alter table public.profiles
  add column if not exists deactivated_at timestamptz;

comment on column public.profiles.deactivated_at is
  'When set, this profile retains its history but has no staff capability. Offboarding deactivates rather than deleting, so attribution and evidence survive.';

-- 2. Attribution snapshots --------------------------------------------------
-- Eleven historical staff actions. `applications.decision_made_by` is
-- deliberately excluded: no distinct assessment-decision mutation exists yet,
-- and a snapshot of a write that never happens would repeat the defect this
-- migration exists to fix.

alter table public.reviewer_notes
  add column if not exists reviewer_actor_id uuid,
  add column if not exists reviewer_actor_name text,
  add column if not exists reviewer_actor_email text;

alter table public.donor_briefs
  add column if not exists generated_actor_id uuid,
  add column if not exists generated_actor_name text,
  add column if not exists generated_actor_email text,
  add column if not exists approved_actor_id uuid,
  add column if not exists approved_actor_name text,
  add column if not exists approved_actor_email text;

alter table public.scores
  add column if not exists override_actor_id uuid,
  add column if not exists override_actor_name text,
  add column if not exists override_actor_email text;

alter table public.risk_flags
  add column if not exists resolved_actor_id uuid,
  add column if not exists resolved_actor_name text,
  add column if not exists resolved_actor_email text;

alter table public.external_checks
  add column if not exists checked_actor_id uuid,
  add column if not exists checked_actor_name text,
  add column if not exists checked_actor_email text;

alter table public.inquiry_events
  add column if not exists actor_snapshot_id uuid,
  add column if not exists actor_snapshot_name text,
  add column if not exists actor_snapshot_email text;

alter table public.diligence_engagements
  add column if not exists created_actor_id uuid,
  add column if not exists created_actor_name text,
  add column if not exists created_actor_email text;

alter table public.roadmap_items
  add column if not exists created_actor_id uuid,
  add column if not exists created_actor_name text,
  add column if not exists created_actor_email text;

alter table public.voice_alignment_requests
  add column if not exists invited_actor_id uuid,
  add column if not exists invited_actor_name text,
  add column if not exists invited_actor_email text;

alter table public.documents
  add column if not exists reviewer_actor_id uuid,
  add column if not exists reviewer_actor_name text,
  add column if not exists reviewer_actor_email text;

comment on column public.donor_briefs.generated_actor_id is
  'Immutable snapshot of the brief author at the moment of authorship. Approval is refused when neither this nor generated_by identifies an author.';

-- `organizations.assigned_reviewer_id` deliberately gets no snapshot: it is the
-- current assignment, not a historical event. Assignment history, if it is ever
-- needed, belongs in its own event model rather than in snapshot columns.

-- 3. Reviewer notes must survive the reviewer -------------------------------

alter table public.reviewer_notes
  drop constraint if exists reviewer_notes_reviewer_id_fkey;

alter table public.reviewer_notes
  add constraint reviewer_notes_reviewer_id_fkey
  foreign key (reviewer_id) references auth.users (id) on delete set null;

-- 4. Deactivated staff hold no staff role -----------------------------------
-- 47 row-level policies across 19 tables read this function, so a deactivated
-- profile loses staff access everywhere at once.

create or replace function app_private.current_profile_role()
returns text
language sql
stable
security definer
set search_path to 'public'
as $function$
  select p.role
  from public.profiles as p
  where p.id = auth.uid()
    and p.deactivated_at is null
$function$;

-- 5. Backfill only what authoritative data establishes -----------------------
-- Exactly one historical row carries a live actor that still resolves. Every
-- other attribution column was never written and stays empty: those rows are
-- historically irrecoverable, not migration failures. No actor is inferred from
-- timestamps, assignments, organisation membership or likely users.

update public.inquiry_events as e
set actor_snapshot_id = e.actor_id,
    actor_snapshot_email = u.email,
    actor_snapshot_name = coalesce(
      u.raw_user_meta_data ->> 'full_name',
      u.raw_user_meta_data ->> 'name'
    )
from auth.users as u
where u.id = e.actor_id
  and e.actor_id is not null
  and e.actor_snapshot_id is null;

-- 6. Evidence provenance: the uploader is the authenticated uploader ---------
-- `documents.uploaded_by` was written by the ministry document centre and not
-- by the Complete Application, so the pilot's six documents record no supplier
-- at all. The row-level policy scopes documents to the ministry's own
-- organisation but never constrains `uploaded_by`, so a client could also name
-- someone else.
--
-- The database decides instead of the client: an authenticated insert always
-- records the session's own user. Service-role inserts (seeds, backfills) have
-- no `auth.uid()` and keep whatever they supply.
--
-- This is evidence provenance rather than staff attribution, so it deliberately
-- gets no immutable snapshot columns.

create or replace function public.set_document_uploader()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if auth.uid() is not null then
    new.uploaded_by := auth.uid();
  end if;

  return new;
end;
$function$;

drop trigger if exists documents_set_uploader on public.documents;

create trigger documents_set_uploader
  before insert on public.documents
  for each row
  execute function public.set_document_uploader();

-- 7. A note must be able to outlive its author ------------------------------
-- `reviewer_notes.reviewer_id` was NOT NULL, so `on delete set null` could not
-- execute: deleting a reviewer raised a constraint violation and the delete
-- failed outright. That protected the evidence but blocked offboarding, which
-- is not the intended behaviour. The live id becomes nullable so the foreign
-- key can release it; the snapshot keeps saying who wrote the note.

alter table public.reviewer_notes
  alter column reviewer_id drop not null;

comment on column public.reviewer_notes.reviewer_id is
  'The reviewer''s live identity, released to null if that identity is deleted. Attribution lives in reviewer_actor_id/name/email, which are never cleared.';
