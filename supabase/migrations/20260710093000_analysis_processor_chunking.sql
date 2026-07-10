drop function if exists public.claim_next_analysis_job(text);

create or replace function public.claim_next_analysis_job(
  p_provider text default 'openai',
  p_stale_after interval default interval '10 minutes'
)
returns setof public.analysis_jobs
language plpgsql
set search_path = public
as $$
declare
  v_provider text := nullif(trim(p_provider), '');
begin
  if v_provider is null then
    v_provider := 'openai';
  end if;

  return query
  with next_job as (
    select id
    from public.analysis_jobs
    where provider = v_provider
      and (
        status = 'queued'
        or (
          status = 'processing'
          and started_at < now() - p_stale_after
        )
      )
    order by
      case when status = 'queued' then 0 else 1 end,
      queued_at asc,
      created_at asc
    for update skip locked
    limit 1
  )
  update public.analysis_jobs analysis_job
  set status = 'processing',
      started_at = now(),
      completed_at = null,
      failed_at = null,
      error_code = null,
      error_message = null,
      error_log_ref = null
  from next_job
  where analysis_job.id = next_job.id
  returning analysis_job.*;
end;
$$;

create or replace function public.requeue_analysis_job(
  p_job_id uuid
)
returns setof public.analysis_jobs
language plpgsql
set search_path = public
as $$
begin
  return query
  update public.analysis_jobs
  set status = 'queued',
      queued_at = now(),
      started_at = null,
      completed_at = null,
      failed_at = null,
      error_code = null,
      error_message = null,
      error_log_ref = null
  where id = p_job_id
    and status = 'processing'
  returning *;
end;
$$;

revoke all on function public.claim_next_analysis_job(text, interval) from public;
revoke all on function public.requeue_analysis_job(uuid) from public;

grant execute on function public.claim_next_analysis_job(text, interval) to service_role;
grant execute on function public.requeue_analysis_job(uuid) to service_role;
