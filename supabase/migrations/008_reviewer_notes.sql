create table if not exists public.reviewer_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  section text,
  note text not null,
  is_internal boolean not null default true
);

create index if not exists reviewer_notes_application_id_idx
  on public.reviewer_notes (application_id);

create index if not exists reviewer_notes_reviewer_id_idx
  on public.reviewer_notes (reviewer_id);

create trigger set_reviewer_notes_updated_at
before update on public.reviewer_notes
for each row
execute function public.set_updated_at();
