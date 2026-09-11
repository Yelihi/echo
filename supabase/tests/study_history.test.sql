begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users (id) values
  ('cccccccc-1111-4111-8111-111111111111'),
  ('cccccccc-2222-4222-8222-222222222222');

insert into public.roleplay_sessions (
  user_id, material_title_snapshot, situation_snapshot, speaker_one_name_snapshot,
  speaker_two_name_snapshot, selected_learner_speaker_order, status, created_at
)
select 'cccccccc-1111-4111-8111-111111111111', 'RP ' || n, 'Test', 'A', 'B', 2, 'ready',
  '2026-01-01'::timestamptz + n * interval '1 day' from generate_series(1, 13) n;

insert into public.memorization_sessions (user_id, material_title_snapshot, status, created_at)
select 'cccccccc-1111-4111-8111-111111111111', 'Memo ' || n, 'ready',
  '2026-02-01'::timestamptz + n * interval '1 day' from generate_series(1, 3) n;

insert into public.memorization_sessions (user_id, material_title_snapshot, status)
values ('cccccccc-2222-4222-8222-222222222222', 'Other owner', 'ready'),
  ('cccccccc-1111-4111-8111-111111111111', 'Deleted', 'deleted');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'cccccccc-1111-4111-8111-111111111111', true);
select is((public.list_study_sessions()->>'totalCount')::int, 16, 'RLS owner scope and deleted exclusion');
select is(jsonb_array_length(public.list_study_sessions()->'items'), 10, 'Global page size across both modes');
select is((public.list_study_sessions()->>'totalPages')::int, 2, 'Global total pages');
select is((public.list_study_sessions(999)->>'page')::int, 2, 'Out of range page clamps');
select is(jsonb_array_length(public.list_study_sessions(2)->'items'), 6, 'Second page contains remainder');
select is(public.list_study_sessions(1, 'all', 'newest')->'items'->0->>'title', 'Memo 3', 'Latest session across modes');
select is(public.list_study_sessions(1, 'all', 'oldest')->'items'->0->>'title', 'RP 1', 'Oldest session across modes');
select is((public.list_study_sessions(1, 'completed')->>'totalCount')::int, 0, 'Status filtering precedes total count');

select * from finish();
rollback;
