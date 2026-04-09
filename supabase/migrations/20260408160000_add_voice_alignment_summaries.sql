create table if not exists public.voice_alignment_summaries (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  summary jsonb not null,
  status text not null check (status in ('aligned', 'partially_aligned', 'misaligned', 'insufficient_data')),
  generated_at timestamptz not null default timezone('utc', now())
);

create index if not exists voice_alignment_summaries_organization_id_idx
  on public.voice_alignment_summaries (organization_id);

alter table public.voice_alignment_requests enable row level security;
alter table public.voice_alignment_responses enable row level security;
alter table public.voice_alignment_summaries enable row level security;
