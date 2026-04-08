alter table public.applications
add column if not exists immersive_discernment_status text,
add column if not exists immersive_discernment_notes text;

alter table public.donor_briefs
add column if not exists rationale text;
