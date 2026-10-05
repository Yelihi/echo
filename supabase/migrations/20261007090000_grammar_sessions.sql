-- 노트 원본/버전 및 문제 순서는 생성 시 DB에서 확정하며 답안 저장은 낙관적 잠금으로 보호합니다.
create table public.grammar_sessions (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 note_id uuid not null references public.grammar_notes(id), note_version integer not null,
 snapshot jsonb not null, mode text not null check(mode in ('recall','exam')),
 status text not null default 'active' check(status in ('active','completed')),
 questions jsonb not null, answers jsonb not null default '{}',
 phase text not null check(phase in ('partial','whole','existing','novel')), question_index integer not null default 0,
 version integer not null default 1 check(version>0), creation_request_id uuid not null,
 started_at timestamptz not null default clock_timestamp(), completed_at timestamptz,
 unique(owner_id,creation_request_id), check((status='completed')=(completed_at is not null))
);
create index grammar_sessions_owner_history_idx on public.grammar_sessions(owner_id,completed_at desc,id desc);
alter table public.grammar_sessions enable row level security;
create policy grammar_sessions_owner_select on public.grammar_sessions for select to authenticated using(owner_id=(select auth.uid()));
revoke all on public.grammar_sessions from public,anon,authenticated;
grant select on public.grammar_sessions to authenticated;

create function public.start_grammar_session(p_note_id uuid,p_request_id uuid,p_mode text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_owner uuid:=auth.uid(); v_note public.grammar_notes; v_session public.grammar_sessions;
 v_questions jsonb; v_previous jsonb; v_order jsonb;
begin
 if v_owner is null then raise exception 'GRAMMAR_SESSION_UNAUTHORIZED'; end if;
 if p_note_id is null or p_request_id is null or p_mode is null or p_mode not in ('recall','exam') then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
 -- 같은 노트의 시작을 직렬화하여 직전 세션과 순서를 비교합니다.
 select * into v_note from public.grammar_notes where id=p_note_id and owner_id=v_owner for update;
 if not found then raise exception 'GRAMMAR_SESSION_NOT_FOUND'; end if;
 select * into v_session from public.grammar_sessions where owner_id=v_owner and creation_request_id=p_request_id;
 if found then
  if v_session.note_id<>p_note_id or v_session.mode<>p_mode then raise exception 'GRAMMAR_SESSION_CONFLICT'; end if;
  return to_jsonb(v_session);
 end if;
 select jsonb_agg(q->>'id' order by ord) into v_previous from public.grammar_sessions s,
 lateral jsonb_array_elements(s.questions) with ordinality as a(q,ord)
 where s.id=(select id from public.grammar_sessions where owner_id=v_owner and note_id=p_note_id and mode=p_mode order by started_at desc,id desc limit 1);
 with questions as (
  select jsonb_build_object('id','source','kind','existing','sentence',v_note.content#>>'{source,sentence}',
   'translation',v_note.content#>>'{analysis,naturalTranslation}','context','','requiredWords','[]'::jsonb,
   'chunks',coalesce((select jsonb_agg(jsonb_build_object('id',c->>'id','start',c#>'{range,start}','end',c#>'{range,end}','meaning',c->>'literalMeaning')) from jsonb_array_elements(v_note.content#>'{analysis,chunks}') c),'[]'::jsonb)) q
  union all
  select jsonb_build_object('id','example:'||(e->>'id'),'kind','existing','sentence',e->>'sentence',
   'translation',e->>'translation','context','','requiredWords','[]'::jsonb,'chunks','[]'::jsonb)
  from jsonb_array_elements(v_note.content->'examples') e
 ) select jsonb_agg(q order by random()) into v_questions from questions;
 select jsonb_agg(q->>'id' order by ord) into v_order from jsonb_array_elements(v_questions) with ordinality as a(q,ord);
 -- 두 문항 이상일 때 우연히 이전 순서와 같으면 회전하여 반복 순서를 피합니다.
 if jsonb_array_length(v_questions)>1 and v_order=v_previous then v_questions=(v_questions-0)||jsonb_build_array(v_questions->0); end if;
 insert into public.grammar_sessions(owner_id,note_id,note_version,snapshot,mode,questions,phase,creation_request_id)
 values(v_owner,p_note_id,v_note.version,v_note.content,p_mode,v_questions,case when p_mode='recall' then 'partial' else 'existing' end,p_request_id)
 on conflict(owner_id,creation_request_id) do nothing returning * into v_session;
 if not found then
  select * into v_session from public.grammar_sessions where owner_id=v_owner and creation_request_id=p_request_id;
  if v_session.note_id<>p_note_id or v_session.mode<>p_mode then raise exception 'GRAMMAR_SESSION_CONFLICT'; end if;
 end if;
 return to_jsonb(v_session);
end $$;

create function public.save_grammar_session_answers(p_session_id uuid,p_expected_version integer,p_answers jsonb,p_phase text,p_question_index integer)
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
  if jsonb_typeof(v_answer) is distinct from 'string' or length(v_answer#>>'{}')>4000
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

create function public.complete_grammar_session(p_session_id uuid,p_expected_version integer)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_owner uuid:=auth.uid();v_session public.grammar_sessions;v_question jsonb;v_key text;
begin
 if v_owner is null then raise exception 'GRAMMAR_SESSION_UNAUTHORIZED'; end if;
 select * into v_session from public.grammar_sessions where id=p_session_id and owner_id=v_owner for update;
 if not found then raise exception 'GRAMMAR_SESSION_NOT_FOUND'; end if;
 -- 완료 응답이 유실되어도 동일 sessionId는 다시 집계하지 않습니다.
 if v_session.status='completed' then return to_jsonb(v_session); end if;
 if p_expected_version is null or v_session.version<>p_expected_version then raise exception 'GRAMMAR_SESSION_CONFLICT'; end if;
 if v_session.mode='exam' and not exists(select 1 from jsonb_array_elements(v_session.questions) q where q->>'kind'='novel') then raise exception 'GRAMMAR_SESSION_INCOMPLETE'; end if;
 for v_question in select value from jsonb_array_elements(v_session.questions) loop
  v_key=(case when v_session.mode='recall' then 'whole' else v_question->>'kind' end)||':'||(v_question->>'id');
  if coalesce(v_session.answers->>v_key,'') !~ '[^[:space:]]' then raise exception 'GRAMMAR_SESSION_INCOMPLETE'; end if;
 end loop;
 update public.grammar_sessions set status='completed',completed_at=clock_timestamp(),version=version+1 where id=v_session.id returning * into v_session;
 return to_jsonb(v_session);
end $$;

create function public.list_grammar_session_history(p_note_id uuid default null,p_page integer default 1,p_page_size integer default 20)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_owner uuid:=auth.uid();v_result jsonb;
begin
 if v_owner is null then raise exception 'GRAMMAR_SESSION_UNAUTHORIZED'; end if;
 if p_page is null or p_page<1 or p_page_size is null or p_page_size not between 1 and 100 then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
 with matching as materialized(select * from public.grammar_sessions where owner_id=v_owner and status='completed' and (p_note_id is null or note_id=p_note_id)),
 page as(select * from matching order by completed_at desc,id desc limit p_page_size offset (p_page::bigint-1)*p_page_size)
 select jsonb_build_object('total',(select count(*) from matching),'items',coalesce((select jsonb_agg(jsonb_build_object(
 'id',id,'noteId',note_id,'title',snapshot#>>'{metadata,title}','mode',mode,'startedAt',started_at,'completedAt',completed_at,'questionCount',jsonb_array_length(questions)) order by completed_at desc,id desc) from page),'[]'::jsonb)) into v_result;
 return v_result;
end $$;

-- 신규 시험 문맥은 시작 후 한 번만 고정하며, 답안을 쓰기 시작한 세션은 변경할 수 없습니다.
create function public.set_grammar_exam_prompts(p_session_id uuid,p_questions jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_owner uuid:=auth.uid();v_session public.grammar_sessions;v_q jsonb;v_word jsonb;v_ids text[]:='{}';
begin
 if v_owner is null then raise exception 'GRAMMAR_SESSION_UNAUTHORIZED'; end if;
 select * into v_session from public.grammar_sessions where id=p_session_id and owner_id=v_owner for update;
 if not found then raise exception 'GRAMMAR_SESSION_NOT_FOUND'; end if;
 if v_session.mode<>'exam' then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
 if exists(select 1 from jsonb_array_elements(v_session.questions) q where q->>'kind'='novel') then return to_jsonb(v_session); end if;
 if v_session.status<>'active' or v_session.answers<>'{}'::jsonb then raise exception 'GRAMMAR_SESSION_CONFLICT'; end if;
 if jsonb_typeof(p_questions) is distinct from 'array' then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
 if jsonb_array_length(p_questions) not between 1 and 3 then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
 for v_q in select value from jsonb_array_elements(p_questions) loop
  if jsonb_typeof(v_q) is distinct from 'object' or v_q->>'kind' is distinct from 'novel'
   or coalesce(v_q->>'id','') !~ '^novel:[1-3]$' or v_q->>'id'=any(v_ids)
   or v_q->'sentence' is distinct from 'null'::jsonb or v_q->'chunks' is distinct from '[]'::jsonb
   or jsonb_typeof(v_q->'context') is distinct from 'string' or length(v_q->>'context') not between 1 and 4000
   or jsonb_typeof(v_q->'translation') is distinct from 'string' or length(v_q->>'translation') not between 1 and 4000
   or jsonb_typeof(v_q->'requiredWords') is distinct from 'array' then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
  if jsonb_array_length(v_q->'requiredWords') not between 1 and 12 then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
  v_ids=array_append(v_ids,v_q->>'id');
  for v_word in select value from jsonb_array_elements(v_q->'requiredWords') loop
   if jsonb_typeof(v_word->'word') is distinct from 'string' or length(v_word->>'word') not between 1 and 4000
    or jsonb_typeof(v_word->'meaning') is distinct from 'string' or length(v_word->>'meaning') not between 1 and 4000 then raise exception 'GRAMMAR_SESSION_INVALID_INPUT'; end if;
  end loop;
 end loop;
 update public.grammar_sessions set questions=questions||p_questions,version=version+1 where id=v_session.id returning * into v_session;
 return to_jsonb(v_session);
end $$;
revoke all on function public.start_grammar_session(uuid,uuid,text),public.save_grammar_session_answers(uuid,integer,jsonb,text,integer),public.complete_grammar_session(uuid,integer),public.list_grammar_session_history(uuid,integer,integer),public.set_grammar_exam_prompts(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.start_grammar_session(uuid,uuid,text),public.save_grammar_session_answers(uuid,integer,jsonb,text,integer),public.complete_grammar_session(uuid,integer),public.list_grammar_session_history(uuid,integer,integer),public.set_grammar_exam_prompts(uuid,jsonb) to authenticated;
