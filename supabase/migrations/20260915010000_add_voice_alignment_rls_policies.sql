-- Voice alignment: make the intended access model explicit.
--
-- RLS was enabled on these three tables (20260408160000) but no policies were
-- ever added, leaving an implicit deny-all. Every code path that touches them
-- (admin review, AI summary generation, and the public tokened reference
-- invite/response flow) uses the service-role client, which bypasses RLS — so
-- the app functions, but the intent was undocumented and the linter flagged it.
--
-- Intended model, now explicit: SAVE staff (admin/reviewer) manage voice
-- alignment; ministries, donors, and anonymous callers have NO direct table
-- access. Reference feedback is confidential to SAVE (like internal reviewer
-- notes) and must never be ministry-visible. The public reference form reaches
-- these tables only through the service-role client, not RLS.

-- voice_alignment_requests
create policy "voice_alignment_requests_admin_reviewer_read_all"
on public.voice_alignment_requests
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "voice_alignment_requests_admin_reviewer_write_all"
on public.voice_alignment_requests
for all
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'))
with check (app_private.current_profile_role() in ('admin', 'reviewer'));

-- voice_alignment_responses (confidential reference feedback)
create policy "voice_alignment_responses_admin_reviewer_read_all"
on public.voice_alignment_responses
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "voice_alignment_responses_admin_reviewer_write_all"
on public.voice_alignment_responses
for all
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'))
with check (app_private.current_profile_role() in ('admin', 'reviewer'));

-- voice_alignment_summaries
create policy "voice_alignment_summaries_admin_reviewer_read_all"
on public.voice_alignment_summaries
for select
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'));

create policy "voice_alignment_summaries_admin_reviewer_write_all"
on public.voice_alignment_summaries
for all
to authenticated
using (app_private.current_profile_role() in ('admin', 'reviewer'))
with check (app_private.current_profile_role() in ('admin', 'reviewer'));
