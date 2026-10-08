begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users(id) values
  ('15151515-1111-4111-8111-111111111111'),
  ('15151515-2222-4222-8222-222222222222');
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
create temporary table grammar_test_results(label text primary key, value jsonb);
grant all on grammar_test_results to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub','',true);
select throws_ok($q$select public.create_grammar_note('25252525-1111-4111-8111-111111111111',pg_temp.grammar_content())$q$,
  'P0001','GRAMMAR_NOTE_UNAUTHORIZED','create rejects missing identity');
select throws_ok($q$select public.update_grammar_note('35353535-1111-4111-8111-111111111111',1,pg_temp.grammar_content())$q$,
  'P0001','GRAMMAR_NOTE_UNAUTHORIZED','update rejects missing identity');
select throws_ok($q$select public.list_grammar_notes()$q$,
  'P0001','GRAMMAR_NOTE_UNAUTHORIZED','list rejects missing identity');
select set_config('request.jwt.claim.sub','15151515-1111-4111-8111-111111111111',true);

insert into grammar_test_results values ('created',public.create_grammar_note('25252525-1111-4111-8111-111111111111',pg_temp.grammar_content()));
select is((select value->>'owner_id' from grammar_test_results where label='created'),'15151515-1111-4111-8111-111111111111','owner comes from authenticated identity');
select is((select (value->>'version')::integer from grammar_test_results where label='created'),1,'version starts at one');
select ok((select not (value ? 'creation_content') and not (value ? 'creation_request_id') from grammar_test_results where label='created'),'RPC response omits internal idempotency fields');
select is(public.create_grammar_note('25252525-1111-4111-8111-111111111111',pg_temp.grammar_content()),
  (select value from grammar_test_results where label='created'),'same create request returns the same row');
select is((select count(*) from public.grammar_notes),1::bigint,'retry creates no duplicate');

select throws_ok($q$insert into public.grammar_notes(owner_id,content,creation_request_id,creation_content)
  values('15151515-1111-4111-8111-111111111111',pg_temp.grammar_content(),'25252525-9999-4999-8999-999999999999',pg_temp.grammar_content())$q$,
  '42501',null,'authenticated cannot bypass RPC with direct insert');
select throws_ok($q$update public.grammar_notes set content=pg_temp.grammar_content('Bypass')$q$,
  '42501',null,'authenticated cannot bypass version check with direct update');
select throws_ok($q$delete from public.grammar_notes$q$,'42501',null,'authenticated cannot delete directly');

insert into grammar_test_results select 'updated',public.update_grammar_note((value->>'id')::uuid,1,pg_temp.grammar_content('Edited title'))
  from grammar_test_results where label='created';
select is((select (value->>'version')::integer from grammar_test_results where label='updated'),2,'successful update increments version once');
select is((select value->'created_at' from grammar_test_results where label='updated'),
  (select value->'created_at' from grammar_test_results where label='created'),'update retains creation timestamp');
select ok((select (value->>'updated_at')::timestamptz >= (value->>'created_at')::timestamptz from grammar_test_results where label='updated'),'update timestamp advances');
select is(public.create_grammar_note('25252525-1111-4111-8111-111111111111',pg_temp.grammar_content()),
  (select value from grammar_test_results where label='updated'),'original create retry after edit returns current row without overwriting it');
select throws_ok($q$select public.create_grammar_note('25252525-1111-4111-8111-111111111111',pg_temp.grammar_content('Edited title'))$q$,
  'P0001','GRAMMAR_NOTE_IDEMPOTENCY_CONFLICT','same request key with changed initial payload is rejected even when matching current content');
select throws_ok($q$select public.update_grammar_note((select (value->>'id')::uuid from grammar_test_results where label='created'),1,pg_temp.grammar_content('Stale update'))$q$,
  'P0001','GRAMMAR_NOTE_VERSION_CONFLICT','stale expected version is rejected');
select is((select content #>> '{metadata,title}' from public.grammar_notes),'Edited title','conflicting update leaves content unchanged');
select is((select version from public.grammar_notes),2,'conflicting update leaves version unchanged');

-- SQL NULL과 JSON null을 포함해 잘못된 구조가 성공으로 처리되지 않는지 확인합니다.
select throws_ok($q$select public.create_grammar_note(null,pg_temp.grammar_content())$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','missing request ID is rejected');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333',null)$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','SQL null content is rejected');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333','null'::jsonb)$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','JSON null content is rejected');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333',pg_temp.grammar_content()-'source')$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','missing source is rejected');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333',pg_temp.grammar_content() #- '{metadata,grammarKey}')$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','missing nullable field is rejected');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333',jsonb_set(pg_temp.grammar_content(),'{metadata,title}','"   "'))$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','blank required text is rejected');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333',jsonb_set(pg_temp.grammar_content(),'{analysis,chunks}','{}'))$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','non-array chunks return domain error instead of database type error');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333',jsonb_set(pg_temp.grammar_content(),'{analysis,chunks}','[]'))$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','empty chunks are rejected');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333',jsonb_set(pg_temp.grammar_content(),'{analysis,syntax}','[{"id":"s1","ranges":[null],"parentId":null,"role":"subject","label":"주어","explanation":""}]'))$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','malformed nested range is rejected');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333',jsonb_set(pg_temp.grammar_content(),'{metadata,sourceRevision}','1'))$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','stale metadata revision is rejected');
select throws_ok($q$select public.create_grammar_note('25252525-3333-4333-8333-333333333333',jsonb_set(pg_temp.grammar_content(),'{analysis,sourceText}','"Different."'))$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','analysis of a different sentence is rejected');
select throws_ok($q$select public.update_grammar_note((select (value->>'id')::uuid from grammar_test_results where label='created'),2,pg_temp.grammar_content()-'analysis')$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','invalid aggregate update is rejected');
select is((select version from public.grammar_notes),2,'invalid update leaves version unchanged');
select is((select content #>> '{metadata,title}' from public.grammar_notes),'Edited title','invalid update leaves content unchanged');
select is((select count(*) from public.grammar_notes),1::bigint,'failed creates leave no partial rows');

select set_config('request.jwt.claim.sub','15151515-2222-4222-8222-222222222222',true);
select is((select count(*) from public.grammar_notes),0::bigint,'RLS hides another owner rows');
select is(public.list_grammar_notes(),' {"items":[],"total":0}'::jsonb,'list also hides another owner rows');
select throws_ok($q$select public.update_grammar_note((select (value->>'id')::uuid from grammar_test_results where label='created'),2,pg_temp.grammar_content())$q$,'P0001','GRAMMAR_NOTE_NOT_FOUND','other owner update is indistinguishable from missing row');
select throws_ok($q$select public.update_grammar_note('35353535-1111-4111-8111-111111111111',1,pg_temp.grammar_content())$q$,'P0001','GRAMMAR_NOTE_NOT_FOUND','missing row is rejected');
select lives_ok($q$select public.create_grammar_note('25252525-1111-4111-8111-111111111111',pg_temp.grammar_content('Other owner'))$q$,'request key is scoped to owner');
select set_config('request.jwt.claim.sub','15151515-1111-4111-8111-111111111111',true);
insert into grammar_test_results values ('second',public.create_grammar_note('25252525-4444-4444-8444-444444444444',pg_temp.grammar_content('Literal %_ title')));

-- 정렬 키를 동일하게 고정하여 ID 보조 정렬과 페이지 중복 방지를 검증합니다.
reset role;
update public.grammar_notes set updated_at='2026-10-06T00:00:00Z' where owner_id='15151515-1111-4111-8111-111111111111';
set local role authenticated;
select is((public.list_grammar_notes(1,1,'')->>'total')::integer,2,'list counts only own matching rows');
select is(jsonb_array_length(public.list_grammar_notes(1,1,'')->'items'),1,'list applies page size');
select is(public.list_grammar_notes(1,1,'') #>> '{items,0,id}',
  (select id::text from public.grammar_notes order by updated_at desc,id desc limit 1),'equal timestamps use deterministic descending ID');
select isnt(public.list_grammar_notes(1,1,'') #>> '{items,0,id}',public.list_grammar_notes(2,1,'') #>> '{items,0,id}','consecutive pages do not repeat a note');
select is(public.list_grammar_notes(3,1,''),'{"items":[],"total":2}'::jsonb,'out-of-range page retains total');
select is((public.list_grammar_notes(1,20,'  eDiTeD  ')->>'total')::integer,1,'title search trims and ignores case');
select is((public.list_grammar_notes(1,20,'DOCTOR')->>'total')::integer,2,'search includes source sentence');
select is((public.list_grammar_notes(1,20,'%_')->>'total')::integer,1,'percent and underscore are literal search characters');
select is(public.list_grammar_notes(1,20,'unknown'),'{"items":[],"total":0}'::jsonb,'unmatched search has empty items and zero total');
select ok(not ((public.list_grammar_notes() #> '{items,0}') ? 'content'),'summary excludes full analysis payload');
select throws_ok($q$select public.list_grammar_notes(0,20,'')$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','page zero is rejected');
select throws_ok($q$select public.list_grammar_notes(1,101,'')$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','oversized page is rejected');
select throws_ok($q$select public.list_grammar_notes(null,20,'')$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','null page is rejected');
select throws_ok($q$select public.list_grammar_notes(1,20,null)$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','null search is rejected');
select throws_ok($q$select public.list_grammar_notes(1,20,repeat('x',201))$q$,'P0001','GRAMMAR_NOTE_INVALID_INPUT','oversized query is rejected');
select is(public.list_grammar_notes(2147483647,100,''),'{"items":[],"total":2}'::jsonb,'large page offset cannot overflow integer');
reset role;
set local role anon;
select throws_ok($q$select * from public.grammar_notes$q$,'42501',null,'anonymous cannot read notes');
select throws_ok($q$select public.list_grammar_notes()$q$,'42501',null,'anonymous cannot invoke list RPC');
select throws_ok($q$select public.create_grammar_note('25252525-5555-4555-8555-555555555555','{}')$q$,'42501',null,'anonymous cannot invoke create RPC');
select throws_ok($q$select public.update_grammar_note('35353535-1111-4111-8111-111111111111',1,'{}')$q$,'42501',null,'anonymous cannot invoke update RPC');
reset role;
select * from finish();
rollback;
