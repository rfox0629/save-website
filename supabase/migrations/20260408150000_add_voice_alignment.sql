create table if not exists public.voice_alignment_requests (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  request_type text not null check (request_type in ('internal', 'external')),
  respondent_name text not null,
  respondent_email text not null,
  relationship text,
  invite_token text not null unique default gen_random_uuid()::text,
  invited_by uuid references auth.users (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'responded')),
  created_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz
);

create index if not exists voice_alignment_requests_application_id_idx
  on public.voice_alignment_requests (application_id);

create index if not exists voice_alignment_requests_invite_token_idx
  on public.voice_alignment_requests (invite_token);

create table if not exists public.voice_alignment_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.voice_alignment_requests (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  request_type text not null check (request_type in ('internal', 'external')),
  respondent_name text not null,
  respondent_email text not null,
  role_relationship text,
  years_context_known text,
  leader_character text,
  org_strengths text,
  growth_areas text,
  internal_culture text,
  trust_recommendation text,
  concerns text,
  org_leader_description text,
  positive_observations text,
  concerns_inconsistencies text,
  support_recommendation text,
  additional_comments text,
  submitted_at timestamptz not null default timezone('utc', now())
);

create index if not exists voice_alignment_responses_application_id_idx
  on public.voice_alignment_responses (application_id);
