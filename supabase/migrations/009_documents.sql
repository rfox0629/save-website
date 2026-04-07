create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  uploaded_at timestamptz not null default timezone('utc', now()),
  uploaded_by uuid references auth.users (id) on delete set null,
  document_type text not null,
  file_name text not null,
  storage_path text not null,
  review_notes text,
  file_size_bytes integer,
  reviewed boolean not null default false,
  reviewer_id uuid references auth.users (id) on delete set null
);

create index if not exists documents_application_id_idx
  on public.documents (application_id);

create index if not exists documents_uploaded_by_idx
  on public.documents (uploaded_by);

create index if not exists documents_reviewer_id_idx
  on public.documents (reviewer_id);
