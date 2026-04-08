insert into storage.buckets (id, name, public)
values ('ministry-documents', 'ministry-documents', false)
on conflict (id) do update
set public = excluded.public;

create policy "storage_ministry_documents_admin_reviewer_read_all"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'ministry-documents'
  and app_private.current_profile_role() in ('admin', 'reviewer')
);

create policy "storage_ministry_documents_admin_reviewer_write_all"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'ministry-documents'
  and app_private.current_profile_role() in ('admin', 'reviewer')
)
with check (
  bucket_id = 'ministry-documents'
  and app_private.current_profile_role() in ('admin', 'reviewer')
);

create policy "storage_ministry_documents_ministry_read_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'ministry-documents'
  and app_private.current_profile_role() = 'ministry'
  and (storage.foldername(name))[1] = app_private.current_organization_id()::text
);

create policy "storage_ministry_documents_ministry_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'ministry-documents'
  and app_private.current_profile_role() = 'ministry'
  and (storage.foldername(name))[1] = app_private.current_organization_id()::text
);

create policy "storage_ministry_documents_ministry_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'ministry-documents'
  and app_private.current_profile_role() = 'ministry'
  and (storage.foldername(name))[1] = app_private.current_organization_id()::text
)
with check (
  bucket_id = 'ministry-documents'
  and app_private.current_profile_role() = 'ministry'
  and (storage.foldername(name))[1] = app_private.current_organization_id()::text
);
