-- 부분 회상 JSON 초안의 길이를 일반 문장 답안과 분리합니다. 기존 권한은 유지합니다.
create or replace function public.save_grammar_session_answers(p_session_id uuid,p_expected_version integer,p_answers jsonb,p_phase text,p_question_index integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_owner uuid:=auth.uid();v_session public.grammar_sessions;v_key text;v_answer jsonb;v_phase text;v_id text;
begin
 if v_owner is null then raise exception 'GRAMMAR_SESSION_UNAUTHORIZED'; end if;
 select * into v_session from public.grammar_sessions where id=p_session_id and owner_id=v_owner for update;
 if not found then raise exception 'GRAMMAR_SESSION_NOT_FOUND'; end if;
 if p_expected_version is null or p_expected_version<1 or jsonb_typeof(p_answers) is distinct from 'object'
  or p_phase is null or p_question_index is null or p_question_index<0 or p_question_index>=jsonb_array_length(v_session.questions)
  or (v_session.mode='recall' and p_phase not in ('partial','whole')) or (v_session.mode='exam' and p_phase not in ('existing','novel')) then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
 for v_key,v_answer in select * from jsonb_each(p_answers) loop
  v_phase=split_part(v_key,':',1);v_id=substring(v_key from length(v_phase)+2);
  -- 부분 회상 JSON은 키/이스케이프 오버헤드를 허용하고 전체 문장 답안은 4,000자를 유지합니다.
  if jsonb_typeof(v_answer) is distinct from 'string'
   or length(v_answer#>>'{}')>(case when v_phase='partial' then 262144 else 4000 end)
   or (v_session.mode='recall' and v_phase not in ('partial','whole')) or (v_session.mode='exam' and v_phase not in ('existing','novel'))
   or not exists(select 1 from jsonb_array_elements(v_session.questions) q where q->>'id'=v_id and (v_session.mode='recall' or q->>'kind'=v_phase))
   then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
 end loop;
 -- 응답 유실 후 같은 내용의 재시도는 버전을 다시 올리지 않습니다.
 if v_session.answers=p_answers and v_session.phase=p_phase and v_session.question_index=p_question_index then return to_jsonb(v_session); end if;
 if v_session.status<>'active' or v_session.version<>p_expected_version then raise exception 'GRAMMAR_SESSION_CONFLICT'; end if;
 update public.grammar_sessions set answers=p_answers,phase=p_phase,question_index=p_question_index,version=version+1 where id=v_session.id returning * into v_session;
 return to_jsonb(v_session);
end $$;

