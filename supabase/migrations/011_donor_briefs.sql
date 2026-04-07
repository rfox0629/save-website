create table if not exists public.donor_briefs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  generated_at timestamptz not null default timezone('utc', now()),
  generated_by uuid references auth.users (id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  slug text unique,
  headline text,
  ministry_description text,
  commendations text[] not null default '{}',
  cautions text[] not null default '{}',
  recommendation_level text,
  pdf_path text
);

create index if not exists donor_briefs_application_id_idx
  on public.donor_briefs (application_id);

create index if not exists donor_briefs_published_idx
  on public.donor_briefs (published);
