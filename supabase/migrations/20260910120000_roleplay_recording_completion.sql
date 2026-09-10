create function public.commit_roleplay_recording(
  p_user_id uuid, p_session_id uuid, p_line_id uuid, p_recording_id uuid,
  p_object_path text, p_mime_type text, p_size_bytes bigint, p_duration_ms integer
)
returns void language plpgsql security definer set search_path = public as $$
declare
  s public.roleplay_sessions%rowtype;
  existing public.accepted_recordings%rowtype;
  expected_line uuid;
begin
  select * into s from public.roleplay_sessions
    where id = p_session_id and user_id = p_user_id for update;
  if not found or s.status = 'deleted' then raise exception 'Session unavailable'; end if;

  select * into existing from public.accepted_recordings where id = p_recording_id;
  if found then
    if existing.user_id = p_user_id and existing.roleplay_session_id = p_session_id
      and existing.roleplay_line_id = p_line_id and existing.object_path = p_object_path then return; end if;
    raise exception 'Recording request conflict';
  end if;
  if s.status = 'completed' then raise exception 'Session already completed'; end if;
  select l.id into expected_line from public.roleplay_session_lines l
    where l.session_id = s.id and l.speaker_order = s.selected_learner_speaker_order
      and not exists (select 1 from public.accepted_recordings r where r.roleplay_line_id = l.id)
    order by l.line_order limit 1;
  if expected_line is distinct from p_line_id then raise exception 'Unexpected recording target'; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'recordings' and name = p_object_path)
    then raise exception 'Uploaded audio missing'; end if;

  insert into public.accepted_recordings (
    id, user_id, roleplay_session_id, roleplay_line_id, bucket_id, object_path,
    mime_type, size_bytes, duration_ms
  ) values (p_recording_id, p_user_id, p_session_id, p_line_id, 'recordings', p_object_path,
    p_mime_type, p_size_bytes, p_duration_ms);
  update public.roleplay_sessions set status = 'in_progress', started_at = coalesce(started_at, now()),
    current_line_order = (select line_order from public.roleplay_session_lines where id = p_line_id)
    where id = s.id;
end;
$$;

create function public.finish_roleplay_recording(p_user_id uuid, p_session_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare s public.roleplay_sessions%rowtype;
begin
  select * into s from public.roleplay_sessions
    where id = p_session_id and user_id = p_user_id for update;
  if not found or s.status = 'deleted' then raise exception 'Session unavailable'; end if;
  if s.status = 'completed' then return; end if;
  if not exists (select 1 from public.roleplay_session_lines
      where session_id = s.id and speaker_order = s.selected_learner_speaker_order)
    or exists (select 1 from public.roleplay_session_lines l
      where l.session_id = s.id and l.speaker_order = s.selected_learner_speaker_order
        and not exists (select 1 from public.accepted_recordings r where r.roleplay_line_id = l.id))
    then raise exception 'Recordings incomplete'; end if;
  update public.roleplay_sessions set status = 'completed', completed_at = now(),
    started_at = coalesce(started_at, now()) where id = s.id;
  perform public.request_analysis_job(p_user_id, s.id, null, 'openai');
end;
$$;

revoke all on function public.commit_roleplay_recording(uuid, uuid, uuid, uuid, text, text, bigint, integer) from public;
revoke all on function public.finish_roleplay_recording(uuid, uuid) from public;
grant execute on function public.commit_roleplay_recording(uuid, uuid, uuid, uuid, text, text, bigint, integer) to service_role;
grant execute on function public.finish_roleplay_recording(uuid, uuid) to service_role;

create function public.guard_completed_roleplay_recording()
returns trigger language plpgsql set search_path = public as $$
declare session_status public.practice_session_status;
begin
  if TG_OP <> 'INSERT' and OLD.roleplay_session_id is not null then
    select status into session_status from public.roleplay_sessions
      where id = OLD.roleplay_session_id for update;
    if session_status = 'completed' then raise exception 'Completed recording is immutable'; end if;
  end if;
  if TG_OP <> 'DELETE' and NEW.roleplay_session_id is not null then
    select status into session_status from public.roleplay_sessions
      where id = NEW.roleplay_session_id for update;
    if session_status = 'completed' then raise exception 'Completed recording is immutable'; end if;
  end if;
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;

create trigger guard_completed_roleplay_recording
before insert or update or delete on public.accepted_recordings
for each row execute function public.guard_completed_roleplay_recording();
