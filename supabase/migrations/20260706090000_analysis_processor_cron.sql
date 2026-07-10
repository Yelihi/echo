create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create or replace function public.schedule_analysis_processor_cron(
  p_function_url text,
  p_secret text,
  p_schedule text default '* * * * *'
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_headers jsonb := jsonb_build_object('Content-Type', 'application/json');
begin
  if nullif(trim(p_function_url), '') is null then
    raise exception 'p_function_url is required';
  end if;

  -- pg_cron은 DB 내부에서 Edge Function을 직접 호출하므로, secret이 비어 있으면
  -- processor endpoint를 보호할 방법이 없습니다. 배포 실수를 빨리 드러내기 위해
  -- 스케줄 등록 시점부터 Authorization 값을 필수로 강제합니다.
  if nullif(trim(p_secret), '') is null then
    raise exception 'p_secret is required';
  end if;

  v_headers := v_headers || jsonb_build_object('Authorization', 'Bearer ' || trim(p_secret));

  begin
    perform cron.unschedule('process-analysis-job');
  exception
    when others then
      null;
  end;

  perform cron.schedule(
    'process-analysis-job',
    p_schedule,
    format(
      'select net.http_post(url := %L, headers := %L::jsonb, body := %L::jsonb);',
      trim(p_function_url),
      v_headers::text,
      '{}'::text
    )
  );
end;
$$;

revoke all on function public.schedule_analysis_processor_cron(text, text, text) from public;
grant execute on function public.schedule_analysis_processor_cron(text, text, text) to service_role;
