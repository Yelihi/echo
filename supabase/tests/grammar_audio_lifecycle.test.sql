begin;
create extension if not exists pgtap with schema extensions;
select no_plan();
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

insert into auth.users(id) values ('16161616-1111-4111-8111-111111111111'),('16161616-2222-4222-8222-222222222222');
insert into public.grammar_notes(id,owner_id,content,creation_request_id,creation_content)
values('36363636-1111-4111-8111-111111111111','16161616-1111-4111-8111-111111111111',
  jsonb_set(pg_temp.grammar_content(),'{examples}','[{"id":"one","sentence":"Saved sentence.","translation":"저장한 문장","targetExplanation":"설명","reviewStatus":"reviewed"}]'),gen_random_uuid(),pg_temp.grammar_content());

select is((public.example_audio_preparation('16161616-1111-4111-8111-111111111111','36363636-1111-4111-8111-111111111111',array['one'],'tts-1')->0->>'status'),'missing','status reads do not register jobs');
select is((select count(*) from public.grammar_audio_jobs),0::bigint,'no job or paid request from read');
select public.example_audio_preparation('16161616-1111-4111-8111-111111111111','36363636-1111-4111-8111-111111111111',array['one'],'tts-1',true);
select public.example_audio_preparation('16161616-1111-4111-8111-111111111111','36363636-1111-4111-8111-111111111111',array['one'],'tts-1',true);
select is((select count(*) from public.grammar_audio_jobs),1::bigint,'repeated registration shares identity');
select throws_ok($q$select public.example_audio_preparation('16161616-2222-4222-8222-222222222222','36363636-1111-4111-8111-111111111111',array['one'],'tts-1',true)$q$,'P0001','NOT_FOUND','another owner cannot register or read');
create temporary table audio_claims as select * from public.claim_grammar_audio_job();
select is((select count(*) from audio_claims),1::bigint,'one worker claims job');
select is((select count(*) from public.claim_grammar_audio_job()),0::bigint,'another claim cannot take processing job');
select is((select count(*) from public.grammar_audio_attempts),1::bigint,'attempt and immutable path are recorded before upload');
update public.grammar_audio_jobs set claimed_at=now()-interval '11 minutes';
select is((select count(*) from public.claim_grammar_audio_job()),0::bigint,'uncertain expired claim is not automatically paid again');
select is((select status from public.grammar_audio_jobs),'retryable','expired claim requires explicit retry');
select public.example_audio_preparation('16161616-1111-4111-8111-111111111111','36363636-1111-4111-8111-111111111111',array['one'],'tts-1',true,true);
create temporary table audio_new_claim as select * from public.claim_grammar_audio_job();
select ok(public.finish_grammar_audio_job((select id from audio_new_claim),(select claim_token from audio_new_claim)),'active attempt can attach');
select ok(public.finish_grammar_audio_job((select id from audio_new_claim),(select claim_token from audio_new_claim),'GENERATION_FAILED'),'lost completion acknowledgement does not undo ready');
select ok(not public.finish_grammar_audio_job((select id from audio_claims),(select claim_token from audio_claims)),'stale completion cannot replace ready asset');
select is((select count(distinct object_path) from public.grammar_audio_attempts),2::bigint,'attempt paths never overwrite one another');
select is((select state from public.grammar_audio_attempts where id=(select claim_token from audio_claims)),'cleanup_pending','late uploaded orphan remains tracked');
select is((select object_path from public.grammar_audio_jobs),(select object_path from public.grammar_audio_attempts where id=(select claim_token from audio_new_claim)),'ready still references the current attempt');
update public.grammar_notes set version=version+1;
select is((public.example_audio_preparation('16161616-1111-4111-8111-111111111111','36363636-1111-4111-8111-111111111111',array['one'],'tts-1',true,true)->0->>'status'),'ready','unrelated note edits and retry preserve successful asset');
select is(public.example_audio_preparation('16161616-1111-4111-8111-111111111111','36363636-1111-4111-8111-111111111111',array['one'],'tts-1',false,false,'different snapshot'),'[]'::jsonb,'mismatched snapshot cannot read current asset');
select public.example_audio_preparation('16161616-1111-4111-8111-111111111111','36363636-1111-4111-8111-111111111111',array['one'],'new-model',true);
create temporary table disappearing_claim as select * from public.claim_grammar_audio_job();
update public.grammar_notes set content=jsonb_set(content,'{examples}','[]');
select ok(not public.finish_grammar_audio_job((select id from disappearing_claim),(select claim_token from disappearing_claim)),'deleted example rejects in-flight ready attachment');
select is((select state from public.grammar_audio_attempts where id=(select claim_token from disappearing_claim)),'cleanup_pending','deleted in-flight attempt remains cleanup tracked');
select is(public.example_audio_preparation('16161616-1111-4111-8111-111111111111','36363636-1111-4111-8111-111111111111',array['one'],'tts-1',false,false,'Saved sentence.'),'[]'::jsonb,'deleted example cannot be resurrected by snapshot lookup');
select ok(not (select public from storage.buckets where id='grammar-audio'),'bucket is private');
set local role authenticated;
select throws_ok($q$select * from public.grammar_audio_jobs$q$,'42501',null,'authenticated callers cannot enumerate jobs');
select throws_ok($q$select public.example_audio_preparation('16161616-1111-4111-8111-111111111111','36363636-1111-4111-8111-111111111111',array['one'],'untrusted-model',true)$q$,'42501',null,'browser cannot choose owner or paid model through privileged RPC');
select throws_ok($q$select public.claim_grammar_audio_job()$q$,'42501',null,'browser cannot claim worker jobs');
reset role;
select * from finish();
rollback;
