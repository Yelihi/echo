-- Preserve base-table owner RLS when reading across recording kinds.
create view public.recording_management_records
with (security_invoker = true)
as
select a.id, a.user_id, a.object_path, a.size_bytes, a.created_at,
  coalesce(a.roleplay_session_id, a.memorization_session_id) as session_id,
  'connected'::text as status
from public.accepted_recordings a
union all
select d.id, d.user_id, d.object_path, d.size_bytes, d.created_at,
  null::uuid as session_id,
  case when exists (
    select 1 from public.cleanup_failure_logs f
    where f.user_id = d.user_id and f.bucket_id = d.bucket_id
      and f.object_path = d.object_path
  ) then 'delete-failed' else 'orphaned' end as status
from public.draft_recordings d
where not exists (
  select 1 from public.accepted_recordings a
  where a.bucket_id = d.bucket_id and a.object_path = d.object_path
);

revoke all on public.recording_management_records from anon;
grant select on public.recording_management_records to authenticated;

create index cleanup_failure_logs_object_idx
  on public.cleanup_failure_logs (user_id, bucket_id, object_path);
