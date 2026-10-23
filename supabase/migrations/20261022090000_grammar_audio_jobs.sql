-- Audio identity is independent of the note's editing version.
create table public.grammar_audio_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  note_id uuid not null,
  example_id text not null,
  revision text not null,
  sentence text not null,
  model text not null,
  voice text not null default 'alloy',
  speed numeric not null default 1,
  status text not null default 'queued' check (status in ('queued','processing','ready','retryable')),
  claim_token uuid,
  claimed_at timestamptz,
  object_path text,
  error_code text,
  created_at timestamptz not null default now(),
  unique(owner_id, note_id, example_id, revision)
);
create table public.grammar_audio_attempts (
  id uuid primary key,
  job_id uuid not null references public.grammar_audio_jobs(id),
  object_path text not null unique,
  state text not null default 'uploading' check (state in ('uploading','linked','cleanup_pending','cleaned')),
  created_at timestamptz not null default now()
);
alter table public.grammar_audio_jobs enable row level security;
alter table public.grammar_audio_attempts enable row level security;
revoke all on public.grammar_audio_jobs, public.grammar_audio_attempts from anon, authenticated;
grant all on public.grammar_audio_jobs, public.grammar_audio_attempts to service_role;

insert into storage.buckets(id,name,public,allowed_mime_types,file_size_limit)
values ('grammar-audio','grammar-audio',false,array['audio/mpeg'],10485760)
on conflict(id) do update set public=false;

create function public.grammar_audio_revision(p_sentence text, p_model text)
returns text language sql immutable set search_path = public, extensions as $$
  select encode(extensions.digest(jsonb_build_array(p_sentence,p_model,'alloy',1)::text,'sha256'),'hex');
$$;

-- Only the trusted server chooses model/voice. It must pass its authenticated owner.
create function public.example_audio_preparation(
  p_owner_id uuid, p_note_id uuid, p_example_ids text[], p_model text,
  p_enqueue boolean default false, p_retry boolean default false,
  p_exact_sentence text default null
) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  v_content jsonb; v_example jsonb; v_id text; v_revision text;
  v_job public.grammar_audio_jobs; v_result jsonb := '[]';
begin
  if cardinality(p_example_ids) not between 1 and 100 or length(p_model) not between 1 and 100 then
    raise exception 'INVALID_INPUT';
  end if;
  select content into v_content from public.grammar_notes
    where id=p_note_id and owner_id=p_owner_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  foreach v_id in array p_example_ids loop
    select value into v_example from jsonb_array_elements(v_content->'examples')
      where value->>'id'=v_id and value->>'reviewStatus'='reviewed';
    if not found then
      if p_exact_sentence is not null and not p_enqueue then continue; end if;
      raise exception 'NOT_FOUND';
    end if;
    if p_exact_sentence is not null and v_example->>'sentence' <> p_exact_sentence then continue; end if;
    v_revision := public.grammar_audio_revision(v_example->>'sentence',p_model);
    if p_enqueue then
      insert into public.grammar_audio_jobs(owner_id,note_id,example_id,revision,sentence,model)
      values(p_owner_id,p_note_id,v_id,v_revision,v_example->>'sentence',p_model)
      on conflict(owner_id,note_id,example_id,revision) do nothing;
      if p_retry then
        update public.grammar_audio_jobs set status='queued',error_code=null,claim_token=null
        where owner_id=p_owner_id and note_id=p_note_id and example_id=v_id
          and revision=v_revision and status='retryable';
      end if;
    end if;
    select * into v_job from public.grammar_audio_jobs
      where owner_id=p_owner_id and note_id=p_note_id and example_id=v_id and revision=v_revision;
    v_result := v_result || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
      'sentenceId',v_id,'revision',v_revision,'status',coalesce(v_job.status,'missing'),
      'jobId',v_job.id,'code',v_job.error_code,'objectPath',v_job.object_path)));
  end loop;
  return v_result;
end;
$$;

create function public.claim_grammar_audio_job()
returns setof public.grammar_audio_jobs language plpgsql security definer set search_path=public as $$
declare v_job public.grammar_audio_jobs; v_path text;
begin
  -- An uncertain paid attempt is never automatically generated again.
  with expired as (
    update public.grammar_audio_jobs set status='retryable',error_code='GENERATION_FAILED',claim_token=null
    where status='processing' and claimed_at < now()-interval '10 minutes' returning id
  ) update public.grammar_audio_attempts set state='cleanup_pending'
    where job_id in(select id from expired) and state='uploading';
  select * into v_job from public.grammar_audio_jobs where status='queued'
    order by created_at,id for update skip locked limit 1;
  if not found then return; end if;
  v_job.claim_token := gen_random_uuid();
  v_path := concat(v_job.owner_id,'/',v_job.note_id,'/',encode(convert_to(v_job.example_id,'UTF8'),'hex'),'/',v_job.revision,'/',v_job.claim_token,'.mp3');
  insert into public.grammar_audio_attempts(id,job_id,object_path) values(v_job.claim_token,v_job.id,v_path);
  return query update public.grammar_audio_jobs set status='processing',claim_token=v_job.claim_token,claimed_at=now()
    where id=v_job.id returning *;
end;
$$;

create function public.finish_grammar_audio_job(p_job_id uuid,p_claim_token uuid,p_error_code text default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare v_job public.grammar_audio_jobs; v_content jsonb; v_path text; v_live boolean;
begin
  -- Match registration/deletion lock order: note first, job second.
  select * into v_job from public.grammar_audio_jobs where id=p_job_id;
  if not found then return false; end if;
  select content into v_content from public.grammar_notes where id=v_job.note_id and owner_id=v_job.owner_id for update;
  select * into v_job from public.grammar_audio_jobs where id=p_job_id for update;
  select object_path into v_path from public.grammar_audio_attempts where id=p_claim_token and job_id=p_job_id;
  if v_path is null then return false; end if;
  if v_job.status='ready' and v_job.claim_token=p_claim_token and v_job.object_path=v_path then return true; end if;
  v_live := exists(select 1 from jsonb_array_elements(v_content->'examples') e
    where e->>'id'=v_job.example_id and e->>'reviewStatus'='reviewed' and e->>'sentence'=v_job.sentence);
  if v_job.status <> 'processing' or v_job.claim_token is distinct from p_claim_token then
    update public.grammar_audio_attempts set state='cleanup_pending' where id=p_claim_token and state <> 'linked';
    return false;
  end if;
  if p_error_code is not null or not v_live then
    update public.grammar_audio_jobs set status='retryable',claim_token=null,error_code=coalesce(p_error_code,'INVALID_INPUT') where id=p_job_id;
    update public.grammar_audio_attempts set state='cleanup_pending' where id=p_claim_token;
    return false;
  end if;
  update public.grammar_audio_jobs set status='ready',object_path=v_path,error_code=null where id=p_job_id;
  update public.grammar_audio_attempts set state='linked' where id=p_claim_token;
  return true;
end;
$$;
revoke all on function public.grammar_audio_revision(text,text) from public, anon, authenticated;
revoke all on function public.example_audio_preparation(uuid,uuid,text[],text,boolean,boolean,text) from public, anon, authenticated;
revoke all on function public.claim_grammar_audio_job() from public, anon, authenticated;
revoke all on function public.finish_grammar_audio_job(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.grammar_audio_revision(text,text),public.example_audio_preparation(uuid,uuid,text[],text,boolean,boolean,text),public.claim_grammar_audio_job(),public.finish_grammar_audio_job(uuid,uuid,text) to service_role;
