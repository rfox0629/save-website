-- A ministry could read its own donor brief at any stage, including a working
-- draft carrying cautions written for donors and never shown to the ministry.
-- The portal already filters on published, so nothing in the product depended
-- on the wider access — it was reachable only by querying the API directly with
-- a ministry token.
--
-- Until a deliberate "sent to the ministry for sign-off" state exists, a
-- ministry sees a brief on the same terms a donor does: published, and approved
-- by a second reviewer. No sign-off state is invented here.

drop policy if exists donor_briefs_ministry_read_own on donor_briefs;
drop policy if exists donor_briefs_ministry_read_own_published on donor_briefs;

create policy donor_briefs_ministry_read_own_published on donor_briefs
for select
using (
  app_private.current_profile_role() = 'ministry'
  and published = true
  and approved_by is not null
  and exists (
    select 1
    from applications a
    where a.id = donor_briefs.application_id
      and a.organization_id = app_private.current_organization_id()
  )
);
