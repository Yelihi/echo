create table public.tts_generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index tts_generation_events_user_created_idx
on public.tts_generation_events (user_id, created_at desc);

alter table public.tts_generation_events enable row level security;

create policy "tts_generation_events owner can insert"
on public.tts_generation_events for insert to authenticated
with check (user_id = auth.uid());

create policy "tts_generation_events owner can select"
on public.tts_generation_events for select to authenticated
using (user_id = auth.uid());

create or replace function public.consume_tts_generation(
  p_limit integer default 20,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
begin
  if v_user_id is null then
    return false;
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select count(*)
  into v_count
  from public.tts_generation_events
  where user_id = v_user_id
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_limit then
    return false;
  end if;

  insert into public.tts_generation_events (user_id)
  values (v_user_id);

  return true;
end;
$$;

create or replace function public.create_roleplay_session_snapshot(
  p_material_id uuid,
  p_material_title text,
  p_situation text,
  p_speaker_one_name text,
  p_speaker_two_name text,
  p_selected_learner_speaker_order smallint,
  p_partner_voice text,
  p_speech_speed numeric,
  p_tags jsonb,
  p_lines jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception 'lines required';
  end if;

  insert into public.roleplay_sessions (
    user_id,
    material_id,
    material_title_snapshot,
    situation_snapshot,
    speaker_one_name_snapshot,
    speaker_two_name_snapshot,
    selected_learner_speaker_order,
    partner_voice,
    speech_speed,
    current_line_order,
    status,
    started_at
  ) values (
    v_user_id,
    p_material_id,
    p_material_title,
    p_situation,
    p_speaker_one_name,
    p_speaker_two_name,
    p_selected_learner_speaker_order,
    p_partner_voice,
    p_speech_speed,
    0,
    'ready',
    null
  )
  returning id into v_session_id;

  if jsonb_typeof(p_tags) = 'array' and jsonb_array_length(p_tags) > 0 then
    insert into public.roleplay_session_tags (
      session_id,
      user_id,
      display_name,
      normalized_name
    )
    select
      v_session_id,
      v_user_id,
      display_name,
      normalized_name
    from jsonb_to_recordset(p_tags) as tag(display_name text, normalized_name text);
  end if;

  insert into public.roleplay_session_lines (
    session_id,
    user_id,
    line_order,
    speaker_order,
    text_snapshot,
    translation_snapshot
  )
  select
    v_session_id,
    v_user_id,
    line_order,
    speaker_order,
    text_snapshot,
    translation_snapshot
  from jsonb_to_recordset(p_lines) as line(
    line_order integer,
    speaker_order smallint,
    text_snapshot text,
    translation_snapshot text
  );

  return v_session_id;
end;
$$;

create or replace function public.create_memorization_session_snapshot(
  p_material_id uuid,
  p_material_title text,
  p_tags jsonb,
  p_paragraphs jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session_id uuid;
  v_paragraph jsonb;
  v_paragraph_id uuid;
  v_index integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if jsonb_typeof(p_paragraphs) <> 'array' or jsonb_array_length(p_paragraphs) = 0 then
    raise exception 'paragraphs required';
  end if;

  insert into public.memorization_sessions (
    user_id,
    material_id,
    material_title_snapshot,
    current_paragraph_order,
    current_sentence_order,
    status,
    started_at
  ) values (
    v_user_id,
    p_material_id,
    p_material_title,
    0,
    0,
    'ready',
    null
  )
  returning id into v_session_id;

  if jsonb_typeof(p_tags) = 'array' and jsonb_array_length(p_tags) > 0 then
    insert into public.memorization_session_tags (
      session_id,
      user_id,
      display_name,
      normalized_name
    )
    select
      v_session_id,
      v_user_id,
      display_name,
      normalized_name
    from jsonb_to_recordset(p_tags) as tag(display_name text, normalized_name text);
  end if;

  for v_index in 0 .. jsonb_array_length(p_paragraphs) - 1 loop
    v_paragraph := p_paragraphs -> v_index;

    insert into public.memorization_session_paragraphs (
      session_id,
      user_id,
      paragraph_order
    )
    values (
      v_session_id,
      v_user_id,
      (v_paragraph ->> 'paragraph_order')::integer
    )
    returning id into v_paragraph_id;

    insert into public.memorization_session_sentences (
      paragraph_id,
      session_id,
      user_id,
      sentence_order,
      text_snapshot,
      translation_snapshot
    )
    select
      v_paragraph_id,
      v_session_id,
      v_user_id,
      sentence_order,
      text_snapshot,
      translation_snapshot
    from jsonb_to_recordset(coalesce(v_paragraph -> 'sentences', '[]'::jsonb)) as sentence(
      sentence_order integer,
      text_snapshot text,
      translation_snapshot text
    );
  end loop;

  return v_session_id;
end;
$$;

grant execute on function public.consume_tts_generation(integer, integer) to authenticated;
grant execute on function public.create_roleplay_session_snapshot(
  uuid, text, text, text, text, smallint, text, numeric, jsonb, jsonb
) to authenticated;
grant execute on function public.create_memorization_session_snapshot(uuid, text, jsonb, jsonb) to authenticated;
