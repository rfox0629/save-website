create table if not exists public.score_components (
  id uuid primary key default gen_random_uuid(),
  score_id uuid not null references public.scores (id) on delete cascade,
  category text not null,
  criterion text not null,
  max_points integer not null,
  awarded_points integer not null,
  rationale text
);

create index if not exists score_components_score_id_idx
  on public.score_components (score_id);

create index if not exists score_components_category_idx
  on public.score_components (category);
