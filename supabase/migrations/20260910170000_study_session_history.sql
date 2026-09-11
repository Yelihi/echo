-- 두 연습 유형을 합친 뒤 필터/정렬/페이지 처리를 적용한다. 호출자의 RLS를 유지한다.
create function public.list_study_sessions(
  p_page integer default 1,
  p_status text default 'all',
  p_sort text default 'newest'
) returns jsonb language sql stable security invoker set search_path = public as $$
  with sessions as (
    select id, user_id, material_title_snapshot as title, created_at, status::text as recording_status,
      'role-playing'::text as kind,
      (select count(*) from public.roleplay_session_lines l where l.session_id = s.id) as item_count,
      (select count(*) from public.roleplay_session_lines l
        where l.session_id = s.id and l.speaker_order = s.selected_learner_speaker_order) as target_count
    from public.roleplay_sessions s
    where user_id = auth.uid() and status <> 'deleted' and deleted_at is null
    union all
    select id, user_id, material_title_snapshot, created_at, status::text, 'memorization',
      (select count(*) from public.memorization_session_paragraphs p where p.session_id = s.id),
      (select count(*) from public.memorization_session_sentences t where t.session_id = s.id)
    from public.memorization_sessions s
    where user_id = auth.uid() and status <> 'deleted' and deleted_at is null
  ), classified as (
    select s.*, case
      when j.status in ('queued', 'processing') then 'inProgress'
      when j.status = 'completed' and r.result_count >= s.target_count then 'completed'
      when j.status = 'completed' or (j.status = 'failed' and r.result_count > 0) then 'partial'
      when j.status in ('failed', 'canceled', 'completed') then 'failed'
      else 'pending'
    end as analysis_status
    from sessions s
    left join lateral (
      select id, status from public.analysis_jobs
      where user_id = auth.uid() and provider = 'openai'
        and ((s.kind = 'role-playing' and roleplay_session_id = s.id)
          or (s.kind = 'memorization' and memorization_session_id = s.id))
      order by attempt_number desc, queued_at desc, id desc limit 1
    ) j on true
    left join lateral (
      select count(*) as result_count from public.practice_target_analysis_results
      where analysis_job_id = j.id and user_id = auth.uid()
    ) r on true
  ), filtered as (
    select * from classified where p_status = 'all' or analysis_status = p_status
  ), totals as (
    select count(*) as total_count from filtered
  ), paging as (
    select total_count, greatest(1, ceil(total_count / 10.0)::integer) as total_pages,
      least(greatest(coalesce(p_page, 1), 1), greatest(1, ceil(total_count / 10.0)::integer)) as page
    from totals
  ), page_rows as (
    select * from filtered
    order by case when p_sort = 'oldest' then created_at end asc,
      case when p_sort <> 'oldest' then created_at end desc, kind, id
    limit 10 offset (select (page - 1)::bigint * 10 from paging)
  )
  select jsonb_build_object(
    'totalCount', total_count, 'totalPages', total_pages, 'page', page,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'id', id, 'title', title, 'createdAt', created_at, 'kind', kind,
      'itemCount', item_count, 'state', analysis_status,
      'recordingCompleted', recording_status = 'completed'
    ) order by case when p_sort = 'oldest' then created_at end asc,
      case when p_sort <> 'oldest' then created_at end desc, kind, id) from page_rows), '[]'::jsonb)
  ) from paging;
$$;
revoke all on function public.list_study_sessions(integer, text, text) from public;
grant execute on function public.list_study_sessions(integer, text, text) to authenticated;
