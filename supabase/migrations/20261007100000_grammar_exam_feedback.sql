create table public.grammar_exam_feedback (
 session_id uuid not null references public.grammar_sessions(id) on delete cascade,
 question_id text not null, owner_id uuid not null references auth.users(id) on delete cascade,
 feedback jsonb not null, created_at timestamptz not null default clock_timestamp(),
 primary key(session_id,question_id)
);
alter table public.grammar_exam_feedback enable row level security;
create policy grammar_exam_feedback_owner_select on public.grammar_exam_feedback for select to authenticated using(owner_id=(select auth.uid()));
revoke all on public.grammar_exam_feedback from public,anon,authenticated;
grant select on public.grammar_exam_feedback to authenticated;
create function public.save_grammar_exam_feedback(p_session_id uuid,p_question_id text,p_answer text,p_feedback jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_owner uuid:=auth.uid();v_session public.grammar_sessions;v_question jsonb;v_existing jsonb;v_key text;
begin
 if v_owner is null then raise exception 'GRAMMAR_SESSION_UNAUTHORIZED'; end if;
 select * into v_session from public.grammar_sessions where id=p_session_id and owner_id=v_owner for update;
 if not found then raise exception 'GRAMMAR_SESSION_NOT_FOUND'; end if;
 if v_session.mode<>'exam' or v_session.status<>'completed' then raise exception 'GRAMMAR_SESSION_INCOMPLETE'; end if;
 select q into v_question from jsonb_array_elements(v_session.questions) q where q->>'id'=p_question_id;
 if not found or p_answer is distinct from v_session.answers->>((v_question->>'kind')||':'||p_question_id) then raise exception 'GRAMMAR_SESSION_CONFLICT'; end if;
 if jsonb_typeof(p_feedback) is distinct from 'object' or p_feedback->>'questionId' is distinct from p_question_id
  or p_feedback->>'answer' is distinct from p_answer or not coalesce(p_feedback->>'verdict' in ('correct','partially-correct','needs-work'),false) then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
 foreach v_key in array array['grammarFeedback','meaningFeedback','suggestedSentence'] loop
  if jsonb_typeof(p_feedback->v_key) is distinct from 'string' or length(p_feedback->>v_key) not between 1 and 4000 or (p_feedback->>v_key) !~ '[^[:space:]]' then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
 end loop;
 -- 완료 답안은 불변이며 먼저 저장된 피드백을 재사용하여 재시도가 결과를 덮지 않습니다.
 insert into public.grammar_exam_feedback(session_id,question_id,owner_id,feedback) values(p_session_id,p_question_id,v_owner,p_feedback)
 on conflict(session_id,question_id) do nothing;
 select feedback into v_existing from public.grammar_exam_feedback where session_id=p_session_id and question_id=p_question_id and owner_id=v_owner;
 return v_existing;
end $$;
revoke all on function public.save_grammar_exam_feedback(uuid,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.save_grammar_exam_feedback(uuid,text,text,jsonb) to authenticated;
