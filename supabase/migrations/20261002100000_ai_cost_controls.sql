-- Invitation is explicit: no rows means no paid AI access.
create table public.ai_access_grants (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz
);
create table public.ai_request_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  operation text not null check (operation in ('tts', 'paragraphs', 'analysis')),
  created_at timestamptz not null default now()
);
create index ai_request_events_user_operation_created_idx
  on public.ai_request_events(user_id, operation, created_at desc);
alter table public.ai_access_grants enable row level security;
alter table public.ai_request_events enable row level security;
revoke all on public.ai_access_grants, public.ai_request_events from anon, authenticated;
grant all on public.ai_access_grants, public.ai_request_events to service_role;

create or replace function public.can_use_ai(p_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select (auth.role() = 'service_role' or p_user_id = auth.uid()) and exists (
    select 1 from public.ai_access_grants where user_id = p_user_id
      and (expires_at is null or expires_at > now())
  );
$$;

create or replace function public.consume_ai_request(p_operation text, p_user_id uuid default auth.uid())
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_limit integer;
  v_window interval;
begin
  if public.can_use_ai(p_user_id) is not true then return 'not_invited'; end if;
  case p_operation
    when 'tts' then v_limit := 20; v_window := interval '1 minute';
    when 'paragraphs' then v_limit := 5; v_window := interval '1 hour';
    when 'analysis' then v_limit := 20; v_window := interval '1 day';
    else raise exception 'Invalid AI operation';
  end case;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  if (select count(*) from public.ai_request_events where user_id = p_user_id
      and operation = p_operation and created_at > now() - v_window) >= v_limit then
    return 'rate_limited';
  end if;
  insert into public.ai_request_events(user_id, operation) values (p_user_id, p_operation);
  return 'allowed';
end;
$$;

create or replace function public.guard_analysis_cost()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare v_permission text;
begin
  if new.provider <> 'openai' then raise exception 'Unsupported AI provider'; end if;
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.analysis_jobs where user_id = new.user_id and
      ((new.roleplay_session_id is not null and roleplay_session_id = new.roleplay_session_id)
       or (new.memorization_session_id is not null and memorization_session_id = new.memorization_session_id))) >= 3 then
    raise exception 'AI_RETRY_LIMIT';
  end if;
  v_permission := public.consume_ai_request('analysis', new.user_id);
  if v_permission = 'not_invited' then raise exception 'AI_NOT_INVITED'; end if;
  if v_permission <> 'allowed' then raise exception 'AI_RATE_LIMIT'; end if;
  return new;
end;
$$;
create trigger guard_analysis_cost before insert on public.analysis_jobs
  for each row execute function public.guard_analysis_cost();
-- Clients request jobs through the ownership-checked RPC; deleting history must not reset limits.
revoke insert, update, delete on public.analysis_jobs from anon, authenticated;
revoke all on function public.can_use_ai(uuid), public.consume_ai_request(text, uuid) from public, anon;
grant execute on function public.can_use_ai(uuid), public.consume_ai_request(text, uuid) to authenticated, service_role;
revoke all on function public.guard_analysis_cost() from public, anon, authenticated;
