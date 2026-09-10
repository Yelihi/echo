-- 기존 세션의 URL 선택은 복구할 수 없으므로 실제 기존 평가 방식인 exact를 유지한다.
alter table public.roleplay_sessions add column evaluation_mode text not null default 'exact'
  check (evaluation_mode in ('exact', 'context'));
alter table public.analysis_jobs add column evaluation_mode text not null default 'exact'
  check (evaluation_mode in ('exact', 'context'));

drop function public.create_roleplay_session_snapshot(uuid, text, text, text, text, smallint, text, numeric, jsonb, jsonb);
create or replace function public.create_roleplay_session_snapshot(
  p_material_id uuid,
  p_material_title text,
  p_situation text,
  p_speaker_one_name text,
  p_speaker_two_name text,
  p_selected_learner_speaker_order smallint,
  p_partner_voice text,
  p_speech_speed numeric,
  p_tags jsonb,
  p_lines jsonb,
  p_evaluation_mode text default 'exact'
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'lines required';
  end if;

  if not exists (
    select 1 from jsonb_to_recordset(p_lines) as line(speaker_order smallint)
    where speaker_order = p_selected_learner_speaker_order
  ) then
    raise exception 'Learner speaker must have at least one line';
  end if;

  insert into public.roleplay_sessions (
    user_id,
    material_id,
    material_title_snapshot,
    situation_snapshot,
    speaker_one_name_snapshot,
    speaker_two_name_snapshot,
    selected_learner_speaker_order,
    partner_voice,
    speech_speed,
    evaluation_mode,
    current_line_order,
    status,
    started_at
  ) values (
    v_user_id,
    p_material_id,
    p_material_title,
    p_situation,
    p_speaker_one_name,
    p_speaker_two_name,
    p_selected_learner_speaker_order,
    p_partner_voice,
    p_speech_speed,
    p_evaluation_mode,
    0,
    'ready',
    null
  )
  returning id into v_session_id;

  if jsonb_typeof(p_tags) = 'array' and jsonb_array_length(p_tags) > 0 then
    insert into public.roleplay_session_tags (
      session_id,
      user_id,
      display_name,
      normalized_name
    )
    select
      v_session_id,
      v_user_id,
      display_name,
      normalized_name
    from jsonb_to_recordset(p_tags) as tag(display_name text, normalized_name text);
  end if;

  insert into public.roleplay_session_lines (
    session_id,
    user_id,
    line_order,
    speaker_order,
    text_snapshot,
    translation_snapshot
  )
  select
    v_session_id,
    v_user_id,
    line_order,
    speaker_order,
    text_snapshot,
    translation_snapshot
  from jsonb_to_recordset(p_lines) as line(
    line_order integer,
    speaker_order smallint,
    text_snapshot text,
    translation_snapshot text
  );

  return v_session_id;
end;
$$;


revoke all on function public.create_roleplay_session_snapshot(uuid, text, text, text, text, smallint, text, numeric, jsonb, jsonb, text) from public;
grant execute on function public.create_roleplay_session_snapshot(uuid, text, text, text, text, smallint, text, numeric, jsonb, jsonb, text) to authenticated;

-- 분석 요청 시점의 평가 방식을 작업에 복사하여 URL 변경 및 재시도와 분리한다.
create function public.snapshot_analysis_evaluation_mode()
returns trigger language plpgsql set search_path = public as $$
begin
  if NEW.roleplay_session_id is not null then
    select evaluation_mode into NEW.evaluation_mode
    from public.roleplay_sessions where id = NEW.roleplay_session_id;
  else
    NEW.evaluation_mode := 'exact';
  end if;
  return NEW;
end;
$$;
create trigger snapshot_analysis_evaluation_mode before insert on public.analysis_jobs
for each row execute function public.snapshot_analysis_evaluation_mode();

-- 세션 생성 이후에는 평가 기준을 바꿀 수 없다.
create function public.guard_recording_evaluation_mode()
returns trigger language plpgsql set search_path = public as $$
begin
  if NEW.evaluation_mode is distinct from OLD.evaluation_mode then
    raise exception 'Session evaluation mode is immutable';
  end if;
  return NEW;
end;
$$;
create trigger guard_recording_evaluation_mode before update on public.roleplay_sessions
for each row execute function public.guard_recording_evaluation_mode();

-- 이전 워커의 무토큰 RPC와 직접 결과 쓰기를 차단한다. 새 워커 배포와 함께 적용한다.
revoke execute on function public.complete_analysis_job(uuid) from public, anon, authenticated, service_role;
revoke execute on function public.fail_analysis_job(uuid, text, text, text) from public, anon, authenticated, service_role;
revoke execute on function public.requeue_analysis_job(uuid) from public, anon, authenticated, service_role;
alter function public.save_claimed_analysis_result(uuid, uuid, jsonb) security definer;
revoke insert, update on public.practice_target_analysis_results from public, anon, authenticated, service_role;

-- 롤플레잉 녹음 확정은 순서·오브젝트 검사를 수행하는 RPC만 허용한다.
drop policy "accepted_recordings owner can manage" on public.accepted_recordings;
create policy "accepted_recordings owner can read"
on public.accepted_recordings for select to authenticated using (user_id = auth.uid());
create policy "memorization recordings owner can manage"
on public.accepted_recordings for all to authenticated
using (user_id = auth.uid() and roleplay_session_id is null)
with check (user_id = auth.uid() and roleplay_session_id is null);

-- service_role를 사용하는 레거시 저장 경로에도 확정 규칙을 적용한다.
create or replace function public.guard_completed_roleplay_recording()
returns trigger language plpgsql set search_path = public as $$
declare
  session_row public.roleplay_sessions%rowtype;
  expected_line uuid;
begin
  if TG_OP <> 'INSERT' and OLD.roleplay_session_id is not null then
    select * into session_row from public.roleplay_sessions
      where id = OLD.roleplay_session_id for update;
    if session_row.status = 'completed' then raise exception 'Completed recording is immutable'; end if;
    if TG_OP = 'UPDATE' then raise exception 'Accepted roleplay recording cannot be updated'; end if;
  end if;
  if TG_OP <> 'DELETE' and NEW.roleplay_session_id is not null then
    select * into session_row from public.roleplay_sessions
      where id = NEW.roleplay_session_id for update;
    if not found or session_row.user_id <> NEW.user_id or session_row.status in ('completed', 'deleted') then
      raise exception 'Session unavailable for recording';
    end if;
    select l.id into expected_line from public.roleplay_session_lines l
      where l.session_id = session_row.id and l.speaker_order = session_row.selected_learner_speaker_order
      and not exists (select 1 from public.accepted_recordings r where r.roleplay_line_id = l.id)
      order by l.line_order limit 1;
    if expected_line is distinct from NEW.roleplay_line_id then raise exception 'Unexpected recording target'; end if;
    if NEW.bucket_id <> 'recordings' or not exists (
      select 1 from storage.objects where bucket_id = 'recordings' and name = NEW.object_path
    ) then raise exception 'Uploaded audio missing'; end if;
  end if;
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;
