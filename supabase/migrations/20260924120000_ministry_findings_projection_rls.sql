-- A ministry may read its own findings and roadmap, and only once a reviewer
-- has deliberately shared them. Enforced here rather than in the projection so
-- that a future surface cannot accidentally widen the boundary.

-- Findings: non-internal reviewer notes, own organization, and only after the
-- explicit share action. The previous policy omitted the share gate, so a
-- ministry-facing note would have been readable the moment it was written.
drop policy if exists reviewer_notes_ministry_read_non_internal_own on reviewer_notes;

create policy reviewer_notes_ministry_read_shared_own on reviewer_notes
for select
using (
  app_private.current_profile_role() = 'ministry'
  and is_internal = false
  and exists (
    select 1
    from applications a
    where a.id = reviewer_notes.application_id
      and a.organization_id = app_private.current_organization_id()
      and a.findings_shared_at is not null
  )
);

-- Roadmap: no ministry policy existed at all, so the share toggle could never
-- have delivered anything.
drop policy if exists roadmap_items_ministry_read_shared_own on roadmap_items;

create policy roadmap_items_ministry_read_shared_own on roadmap_items
for select
using (
  app_private.current_profile_role() = 'ministry'
  and exists (
    select 1
    from applications a
    where a.id = roadmap_items.application_id
      and a.organization_id = app_private.current_organization_id()
      and a.findings_shared_at is not null
  )
);
