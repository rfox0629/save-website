-- Time With Leadership: relational diligence engagements.
--
-- One narrative-first record per real encounter with a ministry's leadership
-- (onsite visit, shared meal, internal leadership review, reference
-- conversation). This operationalizes SAVE's differentiator: meaningful
-- in-person time with leadership, including time around the table and outside
-- formal presentations, where leadership, culture, character, and
-- organizational health become clearer.
--
-- Internal by default. Raw narratives and private notes never leave the staff
-- portal; a separately-crafted donor_excerpt is the only thing eligible to
-- reach a published brief, and only after a second-reviewer publishing gate.

create table if not exists public.diligence_engagements (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,

  -- What kind of encounter this was.
  kind text not null check (
    kind in (
      'internal_leadership_review',
      'onsite_visit',
      'shared_meal',
      'reference_conversation',
      'video_call',
      'other'
    )
  ),

  -- When / where / who.
  occurred_on date,
  location text,
  save_participants text[] not null default '{}',
  -- [{ "name": "...", "role": "..." }]
  ministry_participants jsonb not null default '[]'::jsonb,

  -- The long-form relational account, written first.
  narrative text,

  -- Three discernment lenses, each distilled from the narrative with a
  -- confidence mark drawn from the same vocabulary the scoring engine uses.
  leadership_character_observations text,
  culture_observations text,
  org_health_observations text,
  character_confidence text check (character_confidence in ('low', 'medium', 'high')),
  culture_confidence text check (culture_confidence in ('low', 'medium', 'high')),
  org_health_confidence text check (org_health_confidence in ('low', 'medium', 'high')),

  -- Distillation. follow_ups: [{ "item": "...", "owner": "...", "due": "...", "done": false }]
  strengths text[] not null default '{}',
  concerns text[] not null default '{}',
  follow_ups jsonb not null default '[]'::jsonb,

  -- Flow and privacy.
  status text not null default 'scheduled'
    check (status in ('scheduled', 'completed', 'written_up')),
  visibility text not null default 'internal_only'
    check (visibility in ('internal_only', 'summary_shareable')),
  -- Crafted separately for donors; never the raw narrative. Only surfaces on a
  -- published brief when visibility = 'summary_shareable' and the brief passes
  -- its second-reviewer gate.
  donor_excerpt text,
  -- Always internal, regardless of visibility.
  private_notes text,

  -- A reference_conversation may link to the structured voice-alignment request
  -- that captured the external reference's input.
  linked_voice_alignment_request_id uuid
    references public.voice_alignment_requests (id) on delete set null,

  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists diligence_engagements_application_id_idx
  on public.diligence_engagements (application_id);

create index if not exists diligence_engagements_organization_id_idx
  on public.diligence_engagements (organization_id);

create index if not exists diligence_engagements_status_idx
  on public.diligence_engagements (status);

create trigger set_diligence_engagements_updated_at
before update on public.diligence_engagements
for each row
execute function public.set_updated_at();

alter table public.diligence_engagements enable row level security;

-- Internal-only: SAVE staff (admin/reviewer) have full access. Ministries and
-- donors have NO direct access to this table. Anything donor-facing reaches
-- them only through the SAVE Brief (the crafted donor_excerpt), and anything
-- ministry-facing reaches them only through a separate findings projection.
create policy "diligence_engagements_admin_reviewer_read_all"
on public.diligence_engagements
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "diligence_engagements_admin_reviewer_write_all"
on public.diligence_engagements
for all
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'))
with check (app_private.current_profile_role() in ('admin', 'reviewer'));
