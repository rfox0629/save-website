alter table public.donor_briefs
  add column if not exists include_voice_alignment boolean not null default false;
