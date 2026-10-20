-- Staff are provisioned directly in the database — there is no in-product staff
-- account creation flow to hook — so "part of setup" has to mean the database
-- refuses a staff profile without a name.
--
-- Attribution prefers profiles.display_name, so a staff profile created without
-- one produces a snapshot that records only an email. That is recoverable while
-- the person is still here and permanent once they leave: the whole point of the
-- snapshot is that it outlives them.
--
-- NOT VALID is deliberate. Existing rows are left exactly as they are, honouring
-- the rule that historical nulls stay null, while every insert and every update
-- from now on is checked. An existing staff member with no name keeps acting
-- until someone sets one; a newly provisioned one cannot be created at all.
alter table profiles drop constraint if exists profiles_active_staff_need_display_name;

alter table profiles add constraint profiles_active_staff_need_display_name
  check (
    role not in ('admin', 'reviewer')
    or deactivated_at is not null
    or (display_name is not null and btrim(display_name) <> '')
  )
  not valid;

comment on constraint profiles_active_staff_need_display_name on profiles is
  'An active admin or reviewer must have a display name, so their attribution snapshots name a person rather than only an email. NOT VALID: pre-existing rows keep their nulls deliberately.';
