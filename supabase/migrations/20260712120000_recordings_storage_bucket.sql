insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recordings',
  'recordings',
  false,
  52428800,
  array['audio/webm', 'audio/mp4', 'audio/m4a', 'audio/aac', 'audio/wav']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "recording objects owner can read" on storage.objects;
create policy "recording objects owner can read"
on storage.objects for select to authenticated
using (
  bucket_id = 'recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "recording objects owner can insert" on storage.objects;
create policy "recording objects owner can insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);
