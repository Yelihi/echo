alter table public.analysis_jobs
  add column claim_token uuid;

create or replace function public.claim_next_analysis_job(
  p_provider text default 'openai',
  p_stale_after interval default interval '10 minutes'
)
returns setof public.analysis_jobs
language plpgsql
set search_path = public
as $$
begin
  return query
  with candidate as (
    select id from public.analysis_jobs
    where provider = coalesce(nullif(trim(p_provider), ''), 'openai')
      and (status = 'queued' or
        (status = 'processing' and started_at < now() - p_stale_after))
    order by queued_at, created_at
    for update skip locked
    limit 1
  )
  update public.analysis_jobs j
  set status = 'processing', started_at = now(), claim_token = gen_random_uuid(),
      completed_at = null, failed_at = null, error_code = null,
      error_message = null, error_log_ref = null
  from candidate where j.id = candidate.id
  returning j.*;
end;
$$;

create function public.save_claimed_analysis_result(
  p_job_id uuid, p_claim_token uuid, p_result jsonb
)
returns void
language plpgsql
set search_path = public
as $$
declare
  j public.analysis_jobs%rowtype;
begin
  select * into j from public.analysis_jobs where id = p_job_id for update;
  if not found or j.status <> 'processing' or
      j.claim_token is distinct from p_claim_token or p_claim_token is null then
    raise exception 'Analysis claim is no longer active';
  end if;

  insert into public.practice_target_analysis_results (
    user_id, analysis_job_id, roleplay_session_id, roleplay_line_id,
    memorization_session_id, memorization_sentence_id, transcript, feedback, score
  ) values (
    j.user_id, j.id, j.roleplay_session_id, (p_result->>'roleplay_line_id')::uuid,
    j.memorization_session_id, (p_result->>'memorization_sentence_id')::uuid,
    p_result->>'transcript', p_result->'feedback', (p_result->>'score')::numeric
  ) on conflict do nothing;
end;
$$;

create function public.transition_claimed_analysis_job(
  p_job_id uuid, p_claim_token uuid, p_status text, p_error_message text default null
)
returns setof public.analysis_jobs
language plpgsql
set search_path = public
as $$
begin
  if p_status not in ('queued', 'completed', 'failed') then
    raise exception 'Invalid analysis transition';
  end if;
  return query
  update public.analysis_jobs
  set status = p_status::public.analysis_job_status,
      claim_token = null,
      queued_at = case when p_status = 'queued' then now() else queued_at end,
      started_at = case when p_status = 'queued' then null else started_at end,
      completed_at = case when p_status = 'completed' then now() else null end,
      failed_at = case when p_status = 'failed' then now() else null end,
      error_code = case when p_status = 'failed' then 'ANALYSIS_PROCESSOR_FAILED' else null end,
      error_message = case when p_status = 'failed' then p_error_message else null end,
      error_log_ref = null
  where id = p_job_id and status = 'processing'
    and claim_token = p_claim_token and p_claim_token is not null
  returning *;
end;
$$;

revoke all on function public.save_claimed_analysis_result(uuid, uuid, jsonb) from public;
revoke all on function public.transition_claimed_analysis_job(uuid, uuid, text, text) from public;
grant execute on function public.save_claimed_analysis_result(uuid, uuid, jsonb) to service_role;
grant execute on function public.transition_claimed_analysis_job(uuid, uuid, text, text) to service_role;
