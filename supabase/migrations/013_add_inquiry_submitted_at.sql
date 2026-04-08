alter table public.inquiry_responses
add column if not exists submitted_at timestamptz;
