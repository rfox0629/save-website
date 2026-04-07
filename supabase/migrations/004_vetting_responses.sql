create table if not exists public.vetting_responses (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  leader_conversion_narrative text,
  leader_marital_status text,
  leader_accountability text,
  decision_making_model text,
  compensation_set_by_board boolean,
  leadership_conflict_notes text,
  board_confrontation_willingness integer check (board_confrontation_willingness between 1 and 5),
  doctrinal_distinctives text,
  doctrinal_non_negotiables text,
  statement_of_faith_alignment text,
  sacramental_practice text,
  governance_model text,
  independent_board_count integer,
  board_meeting_frequency text,
  conflict_of_interest_policy boolean,
  whistleblower_policy boolean,
  annual_ed_review boolean,
  family_on_board boolean,
  program_expense_pct integer,
  overhead_expense_pct integer,
  reserve_fund_level text,
  exec_salary_benchmark text,
  recent_deficit boolean,
  restricted_funds_tracked boolean,
  restricted_funds_misused boolean,
  ministry_fruit_evidence text,
  discipleship_outcomes text,
  beneficiary_feedback text,
  reputation_summary text,
  reference_check_summary text,
  public_controversy_notes text,
  attests_information_is_true boolean,
  attests_doctrinal_alignment boolean,
  attests_financial_integrity boolean,
  attestation_name text,
  attestation_title text,
  attestation_signed_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb
);

create index if not exists vetting_responses_application_id_idx
  on public.vetting_responses (application_id);

create trigger set_vetting_responses_updated_at
before update on public.vetting_responses
for each row
execute function public.set_updated_at();
