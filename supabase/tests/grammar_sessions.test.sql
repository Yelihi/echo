begin;
create extension if not exists pgtap with schema extensions;
select no_plan();
insert into auth.users(id) values ('15151515-1111-4111-8111-111111111111'),('15151515-2222-4222-8222-222222222222');
create function pg_temp.grammar_content(p_title text default 'Not A but B') returns jsonb
language sql immutable as $$
  select jsonb_build_object(
    'source', jsonb_build_object('sentence','She is not a teacher but a doctor.','learningNote','not A but B 대조','revision',0),
    'metadata', jsonb_build_object('source','ai','sourceRevision',0,'title',p_title,'tags',jsonb_build_array('대조'),'grammarKey',null),
    'analysis', jsonb_build_object('sourceText','She is not a teacher but a doctor.','sourceRevision',0,
      'chunks',jsonb_build_array(jsonb_build_object('id','c1','range',jsonb_build_object('start',0,'end',34),'literalMeaning','그녀는 교사가 아니라 의사입니다.','explanation','대조')),
      'syntax','[]'::jsonb,'constructions','[]'::jsonb,'naturalTranslation','그녀는 교사가 아니라 의사입니다.','reviewStatus','reviewed'),
    'examples','[]'::jsonb);
$$;

create temporary table session_test(label text primary key,value jsonb);
grant all on session_test to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub','15151515-1111-4111-8111-111111111111',true);
insert into session_test values('note',public.create_grammar_note('25252525-1111-4111-8111-111111111111',pg_temp.grammar_content()));
insert into session_test select 'single',public.start_grammar_session((value->>'id')::uuid,'25252525-2222-4222-8222-222222222222','recall') from session_test where label='note';
select is((select jsonb_array_length(value->'questions') from session_test where label='single'),1,'one sentence starts successfully');
select is((select value->'snapshot' from session_test where label='single'),pg_temp.grammar_content(),'snapshot comes from saved note');
select is((select value#>>'{questions,0,chunks,0,id}' from session_test where label='single'),'c1','source semantic chunks are frozen');
select is(public.start_grammar_session((select (value->>'id')::uuid from session_test where label='note'),'25252525-2222-4222-8222-222222222222','recall'),(select value from session_test where label='single'),'retry retains same session and order');
select throws_ok($q$select public.complete_grammar_session((select (value->>'id')::uuid from session_test where label='single'),1)$q$,'P0001','GRAMMAR_SESSION_INCOMPLETE','unanswered session cannot complete');
insert into session_test select 'saved',public.save_grammar_session_answers((value->>'id')::uuid,1,'{"partial:source":"{\"c1\":\"draft\"}","whole:source":"She is a doctor."}','whole',0) from session_test where label='single';
select is(public.save_grammar_session_answers((select (value->>'id')::uuid from session_test where label='single'),1,'{"partial:source":"{\"c1\":\"draft\"}","whole:source":"She is a doctor."}','whole',0),(select value from session_test where label='saved'),'answer retry is idempotent');
select throws_ok($q$select public.save_grammar_session_answers((select (value->>'id')::uuid from session_test where label='single'),1,'{"whole:source":"Changed"}','whole',0)$q$,'P0001','GRAMMAR_SESSION_CONFLICT','stale draft cannot overwrite new answers');
select throws_ok($q$select public.save_grammar_session_answers((select (value->>'id')::uuid from session_test where label='single'),2,'{"whole:unknown":"answer"}','whole',0)$q$,'P0001','GRAMMAR_SESSION_INVALID_INPUT','unknown question answer rejected');
insert into session_test select 'completed',public.complete_grammar_session((value->>'id')::uuid,2) from session_test where label='single';
select is(public.complete_grammar_session((select (value->>'id')::uuid from session_test where label='single'),2),(select value from session_test where label='completed'),'completion retry retains original timestamp and version');
select is((public.list_grammar_session_history()->>'total')::integer,1,'completion is counted once');
select is((select value->'questions' from session_test where label='completed'),(select value->'questions' from session_test where label='single'),'completion retains order and source');
select throws_ok($q$update public.grammar_sessions set answers='{}'$q$,'42501',null,'direct writes cannot bypass validation');
insert into session_test select 'changed-note',public.update_grammar_note((value->>'id')::uuid,1,jsonb_set(pg_temp.grammar_content('Changed'),'{examples}','[{"id":"e1","sentence":"He is not lazy but tired.","translation":"그는 게으른 게 아니라 피곤합니다.","targetExplanation":"not A but B","reviewStatus":"reviewed"},{"id":"draft","sentence":"Unreviewed sentence.","translation":"미확인 예문","targetExplanation":"검토 전","reviewStatus":"needs-review"}]')) from session_test where label='note';
select is((select snapshot#>>'{metadata,title}' from public.grammar_sessions limit 1),'Not A but B','editing the note never changes frozen metadata');
insert into session_test select 'multi1',public.start_grammar_session((value->>'id')::uuid,'25252525-3333-4333-8333-333333333333','recall') from session_test where label='note';
insert into session_test select 'multi2',public.start_grammar_session((value->>'id')::uuid,'25252525-4444-4444-8444-444444444444','recall') from session_test where label='note';
select is((select jsonb_array_length(value->'questions') from session_test where label='multi1'),2,'only adopted reviewed examples become practice questions');
select isnt((select value->'questions' from session_test where label='multi1'),(select value->'questions' from session_test where label='multi2'),'new multi-question session avoids previous order');
select is((public.list_grammar_session_history()->>'total')::integer,1,'active and abandoned sessions do not count');
select is((public.list_grammar_session_history(null,99,20)->>'total')::integer,1,'empty history page retains total');
insert into session_test select 'exam',public.start_grammar_session((value->>'id')::uuid,'25252525-5555-4555-8555-555555555555','exam') from session_test where label='note';
insert into session_test select 'exam-ready',public.set_grammar_exam_prompts((value->>'id')::uuid,'[{"id":"novel:1","kind":"novel","sentence":null,"translation":"새로운 상황","context":"친구의 직업을 정정하세요.","chunks":[],"requiredWords":[{"word":"engineer","meaning":"기술자"}]}]') from session_test where label='exam';
select is((select jsonb_array_length(value->'questions') from session_test where label='exam-ready'),3,'exam freezes existing and novel questions');
select is(public.set_grammar_exam_prompts((select (value->>'id')::uuid from session_test where label='exam'), '[]'),(select value from session_test where label='exam-ready'),'retry never replaces already frozen novel question');
select set_config('request.jwt.claim.sub','15151515-2222-4222-8222-222222222222',true);
select is((select count(*) from public.grammar_sessions),0::bigint,'RLS hides other owner sessions');
select throws_ok($q$select public.complete_grammar_session((select (value->>'id')::uuid from session_test where label='single'),1)$q$,'P0001','GRAMMAR_SESSION_NOT_FOUND','other owner cannot complete');
select throws_ok($q$select public.start_grammar_session((select (value->>'id')::uuid from session_test where label='note'),'25252525-6666-4666-8666-666666666666','recall')$q$,'P0001','GRAMMAR_SESSION_NOT_FOUND','other owner cannot snapshot note');
select is((public.list_grammar_session_history()->>'total')::integer,0,'history excludes other owner');
select set_config('request.jwt.claim.sub','',true);
select throws_ok($q$select public.list_grammar_session_history()$q$,'P0001','GRAMMAR_SESSION_UNAUTHORIZED','missing identity rejected');
select * from finish();
rollback;
