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

create temporary table exam_test(label text primary key,value jsonb);
grant all on exam_test to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub','15151515-1111-4111-8111-111111111111',true);
insert into exam_test values('note',public.create_grammar_note('25252525-1111-4111-8111-111111111111',pg_temp.grammar_content()));
insert into exam_test select 'exam',public.start_grammar_session((value->>'id')::uuid,'25252525-2222-4222-8222-222222222222','exam') from exam_test where label='note';
insert into exam_test select 'ready',public.set_grammar_exam_prompts((value->>'id')::uuid,'[{"id":"novel:1","kind":"novel","sentence":null,"translation":"대조 문장을 쓰세요.","context":"친구의 직업을 정정하세요.","chunks":[],"requiredWords":[{"word":"engineer","meaning":"기술자"}]}]') from exam_test where label='exam';
select throws_ok($q$select public.save_grammar_exam_feedback((select (value->>'id')::uuid from exam_test where label='exam'),'source','answer','{}')$q$,'P0001','GRAMMAR_SESSION_INCOMPLETE','feedback unavailable before exam completion');
insert into exam_test select 'saved',public.save_grammar_session_answers((value->>'id')::uuid,2,'{"existing:source":"She is a doctor, not a teacher.","novel:novel:1":"He is not a singer but an engineer."}','novel',1) from exam_test where label='exam';
insert into exam_test select 'completed',public.complete_grammar_session((value->>'id')::uuid,3) from exam_test where label='exam';
insert into exam_test values('feedback','{"questionId":"source","answer":"She is a doctor, not a teacher.","verdict":"correct","grammarFeedback":"대조 구문이 정확합니다.","meaningFeedback":"문맥에 적합합니다.","suggestedSentence":"She is a doctor, not a teacher."}');
select is(public.save_grammar_exam_feedback((select (value->>'id')::uuid from exam_test where label='exam'),'source','She is a doctor, not a teacher.',(select value from exam_test where label='feedback')),(select value from exam_test where label='feedback'),'alternate valid answer persists with original answer');
select is(public.save_grammar_exam_feedback((select (value->>'id')::uuid from exam_test where label='exam'),'source','She is a doctor, not a teacher.',jsonb_set((select value from exam_test where label='feedback'),'{grammarFeedback}','"different"')),(select value from exam_test where label='feedback'),'retry preserves first valid feedback');
select is((select count(*) from public.grammar_exam_feedback),1::bigint,'feedback is unique by session and question');
select throws_ok($q$select public.save_grammar_exam_feedback((select (value->>'id')::uuid from exam_test where label='exam'),'source','changed answer',(select value from exam_test where label='feedback'))$q$,'P0001','GRAMMAR_SESSION_CONFLICT','feedback cannot attach to different answer');
select throws_ok($q$select public.save_grammar_exam_feedback((select (value->>'id')::uuid from exam_test where label='exam'),'missing','answer',(select value from exam_test where label='feedback'))$q$,'P0001','GRAMMAR_SESSION_CONFLICT','unknown question rejected');
select throws_ok($q$select public.save_grammar_exam_feedback((select (value->>'id')::uuid from exam_test where label='exam'),'source','She is a doctor, not a teacher.','{}')$q$,'P0001','GRAMMAR_SESSION_INVALID_INPUT','malformed feedback rejected');
select throws_ok($q$update public.grammar_exam_feedback set feedback='{}'$q$,'42501',null,'direct feedback overwrite blocked');
select set_config('request.jwt.claim.sub','15151515-2222-4222-8222-222222222222',true);
select is((select count(*) from public.grammar_exam_feedback),0::bigint,'feedback RLS hides other owner');
select throws_ok($q$select public.save_grammar_exam_feedback((select (value->>'id')::uuid from exam_test where label='exam'),'source','She is a doctor, not a teacher.',(select value from exam_test where label='feedback'))$q$,'P0001','GRAMMAR_SESSION_NOT_FOUND','other owner cannot grade session');
select * from finish();
rollback;
