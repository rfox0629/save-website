-- 1. Staff display names. Attribution reads a profile field rather than mutable
--    auth metadata. Historical snapshots are untouched and stay null.
alter table profiles add column if not exists display_name text;

-- 2. Independent review outcome, distinct from approval.
--    `review_outcome` null means never reviewed. 'changes_requested' means an
--    independent review happened and did not approve — a distinction approval
--    columns alone cannot express.
alter table donor_briefs add column if not exists review_outcome text;
alter table donor_briefs add column if not exists review_note text;
alter table donor_briefs add column if not exists reviewed_at timestamptz;
alter table donor_briefs add column if not exists reviewed_by uuid references auth.users(id);
alter table donor_briefs add column if not exists reviewed_actor_id uuid;
alter table donor_briefs add column if not exists reviewed_actor_name text;
alter table donor_briefs add column if not exists reviewed_actor_email text;

alter table donor_briefs drop constraint if exists donor_briefs_review_outcome_check;
alter table donor_briefs add constraint donor_briefs_review_outcome_check
  check (review_outcome is null or review_outcome in ('approved', 'changes_requested'));

-- Requesting changes without saying why is not a review.
alter table donor_briefs drop constraint if exists donor_briefs_changes_need_reason;
alter table donor_briefs add constraint donor_briefs_changes_need_reason
  check (review_outcome is distinct from 'changes_requested'
         or (review_note is not null and btrim(review_note) <> ''));

-- 3. SAVE's formal decision gets the same immutable attribution as every other
--    consequential action. The decision columns themselves already exist.
alter table applications add column if not exists decision_actor_id uuid;
alter table applications add column if not exists decision_actor_name text;
alter table applications add column if not exists decision_actor_email text;
