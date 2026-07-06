alter table public.analysis_jobs
add column if not exists attempt_number integer not null default 1,
add column if not exists error_code text,
add column if not exists error_log_ref text;

update public.analysis_jobs
set error_code = 'ANALYSIS_JOB_FAILED'
where status = 'failed'
  and error_code is null;

alter table public.analysis_jobs
drop constraint if exists analysis_jobs_attempt_number_check,
add constraint analysis_jobs_attempt_number_check check (attempt_number > 0);

alter table public.analysis_jobs
drop constraint if exists analysis_jobs_error_code_check,
add constraint analysis_jobs_error_code_check check (
  error_code is null or char_length(trim(error_code)) between 1 and 120
);

alter table public.analysis_jobs
drop constraint if exists analysis_jobs_error_log_ref_check,
add constraint analysis_jobs_error_log_ref_check check (
  error_log_ref is null or char_length(trim(error_log_ref)) between 1 and 240
);

alter table public.analysis_jobs
drop constraint if exists analysis_jobs_status_check;

alter table public.analysis_jobs
add constraint analysis_jobs_status_check check (
  (
    status = 'queued'
    and started_at is null
    and completed_at is null
    and failed_at is null
    and error_code is null
    and error_message is null
    and error_log_ref is null
  )
  or (
    status = 'processing'
    and started_at is not null
    and completed_at is null
    and failed_at is null
    and error_code is null
    and error_message is null
    and error_log_ref is null
  )
  or (
    status = 'completed'
    and started_at is not null
    and completed_at is not null
    and failed_at is null
    and error_code is null
    and error_message is null
    and error_log_ref is null
  )
  or (
    status = 'failed'
    and started_at is not null
    and completed_at is null
    and failed_at is not null
    and error_code is not null
    and char_length(trim(error_code)) > 0
    and error_message is not null
    and char_length(trim(error_message)) > 0
  )
  or (
    status = 'canceled'
    and completed_at is null
    and failed_at is null
    and error_code is null
    and error_message is null
    and error_log_ref is null
  )
);

drop index if exists public.analysis_jobs_one_roleplay_session_idx;
drop index if exists public.analysis_jobs_one_memorization_session_idx;

create unique index if not exists analysis_jobs_current_roleplay_session_provider_idx
on public.analysis_jobs (user_id, roleplay_session_id, provider)
where roleplay_session_id is not null
  and status in ('queued', 'processing', 'completed');

create unique index if not exists analysis_jobs_current_memorization_session_provider_idx
on public.analysis_jobs (user_id, memorization_session_id, provider)
where memorization_session_id is not null
  and status in ('queued', 'processing', 'completed');

create index if not exists analysis_jobs_roleplay_history_idx
on public.analysis_jobs (user_id, roleplay_session_id, provider, attempt_number desc, queued_at desc)
where roleplay_session_id is not null;

create index if not exists analysis_jobs_memorization_history_idx
on public.analysis_jobs (user_id, memorization_session_id, provider, attempt_number desc, queued_at desc)
where memorization_session_id is not null;

create index if not exists analysis_jobs_provider_queue_idx
on public.analysis_jobs (provider, queued_at asc, created_at asc)
where status = 'queued';

create or replace function public.request_analysis_job(
  p_user_id uuid,
  p_roleplay_session_id uuid default null,
  p_memorization_session_id uuid default null,
  p_provider text default 'openai'
)
returns setof public.analysis_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider text := nullif(trim(p_provider), '');
  v_existing public.analysis_jobs%rowtype;
  v_attempt_number integer;
begin
  if v_provider is null then
    v_provider := 'openai';
  end if;

  if (p_roleplay_session_id is not null)::integer + (p_memorization_session_id is not null)::integer <> 1 then
    raise exception 'request_analysis_job requires exactly one session id';
  end if;

  if coalesce(auth.role(), '') <> 'service_role' and p_user_id <> auth.uid() then
    raise exception 'request_analysis_job user mismatch';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      concat_ws(
        ':',
        p_user_id::text,
        coalesce(p_roleplay_session_id::text, ''),
        coalesce(p_memorization_session_id::text, ''),
        v_provider
      ),
      0
    )
  );

  select *
  into v_existing
  from public.analysis_jobs
  where user_id = p_user_id
    and provider = v_provider
    and status in ('queued', 'processing', 'completed')
    and (
      (p_roleplay_session_id is not null and roleplay_session_id = p_roleplay_session_id)
      or (p_memorization_session_id is not null and memorization_session_id = p_memorization_session_id)
    )
  order by attempt_number desc, queued_at desc
  limit 1;

  if found then
    return next v_existing;
    return;
  end if;

  select coalesce(max(attempt_number), 0) + 1
  into v_attempt_number
  from public.analysis_jobs
  where user_id = p_user_id
    and provider = v_provider
    and (
      (p_roleplay_session_id is not null and roleplay_session_id = p_roleplay_session_id)
      or (p_memorization_session_id is not null and memorization_session_id = p_memorization_session_id)
    );

  return query
  insert into public.analysis_jobs (
    user_id,
    roleplay_session_id,
    memorization_session_id,
    provider,
    attempt_number
  )
  values (
    p_user_id,
    p_roleplay_session_id,
    p_memorization_session_id,
    v_provider,
    v_attempt_number
  )
  returning *;
end;
$$;

create or replace function public.claim_next_analysis_job(
  p_provider text default 'openai'
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
    where status = 'queued'
      and provider = v_provider
    order by queued_at asc, created_at asc
    for update skip locked
    limit 1
  )
  update public.analysis_jobs analysis_job
  set status = 'processing',
      started_at = now()
  from next_job
  where analysis_job.id = next_job.id
  returning analysis_job.*;
end;
$$;

create or replace function public.complete_analysis_job(
  p_job_id uuid
)
returns setof public.analysis_jobs
language plpgsql
set search_path = public
as $$
begin
  return query
  update public.analysis_jobs
  set status = 'completed',
      completed_at = now(),
      failed_at = null,
      error_code = null,
      error_message = null,
      error_log_ref = null
  where id = p_job_id
    and status = 'processing'
  returning *;
end;
$$;

create or replace function public.fail_analysis_job(
  p_job_id uuid,
  p_error_code text,
  p_error_message text,
  p_error_log_ref text default null
)
returns setof public.analysis_jobs
language plpgsql
set search_path = public
as $$
begin
  return query
  update public.analysis_jobs
  set status = 'failed',
      completed_at = null,
      failed_at = now(),
      error_code = trim(p_error_code),
      error_message = trim(p_error_message),
      error_log_ref = nullif(trim(p_error_log_ref), '')
  where id = p_job_id
    and status = 'processing'
  returning *;
end;
$$;

revoke all on function public.request_analysis_job(uuid, uuid, uuid, text) from public;
revoke all on function public.claim_next_analysis_job(text) from public;
revoke all on function public.complete_analysis_job(uuid) from public;
revoke all on function public.fail_analysis_job(uuid, text, text, text) from public;

grant execute on function public.request_analysis_job(uuid, uuid, uuid, text) to authenticated;
grant execute on function public.request_analysis_job(uuid, uuid, uuid, text) to service_role;

grant execute on function public.claim_next_analysis_job(text) to service_role;
grant execute on function public.complete_analysis_job(uuid) to service_role;
grant execute on function public.fail_analysis_job(uuid, text, text, text) to service_role;

drop policy if exists "analysis_jobs owner can manage" on public.analysis_jobs;

create policy "analysis_jobs owner can read"
on public.analysis_jobs for select to authenticated
using ((select auth.uid()) = user_id);

grant select on table public.analysis_jobs to authenticated;
revoke insert, update, delete on table public.analysis_jobs from authenticated;
