-- Keep parent, tags and script changes in one transaction; session snapshots are independent.
create or replace function public.update_roleplay_material(p_material_id uuid, p_content jsonb)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  v_user_id uuid := auth.uid();
  v_previous jsonb;
begin
  perform 1 from public.roleplay_materials
    where id = p_material_id and user_id = v_user_id and status = 'active' for update;
  if not found then raise exception 'Material unavailable'; end if;
  if jsonb_typeof(p_content->'lines') is distinct from 'array'
    or jsonb_array_length(p_content->'lines') = 0
    or jsonb_typeof(p_content->'tags') is distinct from 'array' then
    raise exception 'Invalid material content';
  end if;
  select coalesce(jsonb_agg(to_jsonb(l)), '[]') into v_previous
    from public.roleplay_lines l where material_id = p_material_id;
  update public.roleplay_materials set title = p_content->>'title',
    situation = p_content->>'situation' where id = p_material_id;
  delete from public.roleplay_material_tags where material_id = p_material_id;
  insert into public.roleplay_material_tags(material_id, user_id, display_name, normalized_name)
    select p_material_id, v_user_id, tag->>'displayName', tag->>'normalizedName'
    from jsonb_array_elements(p_content->'tags') tag;
  delete from public.roleplay_lines where material_id = p_material_id;
  insert into public.roleplay_lines(material_id, user_id, line_order, speaker_order, text, translation)
    select p_material_id, v_user_id, (line->>'order')::integer,
      (line->>'speakerOrder')::smallint, line->>'text',
      (select old->>'translation' from jsonb_array_elements(v_previous) old
       where (old->>'line_order')::integer = (line->>'order')::integer
         and (old->>'speaker_order')::smallint = (line->>'speakerOrder')::smallint
         and old->>'text' = line->>'text')
    from jsonb_array_elements(p_content->'lines') line;
end;
$$;

create or replace function public.update_memorization_material(p_material_id uuid, p_content jsonb)
returns void language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  v_user_id uuid := auth.uid();
  v_previous jsonb;
  v_paragraph jsonb;
  v_paragraph_id uuid;
begin
  perform 1 from public.memorization_materials
    where id = p_material_id and user_id = v_user_id and status = 'active' for update;
  if not found then raise exception 'Material unavailable'; end if;
  if jsonb_typeof(p_content->'paragraphs') is distinct from 'array'
    or jsonb_array_length(p_content->'paragraphs') = 0
    or jsonb_typeof(p_content->'tags') is distinct from 'array' then
    raise exception 'Invalid material content';
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('paragraphOrder', p.paragraph_order,
    'sentenceOrder', s.sentence_order, 'text', s.text, 'translation', s.translation)), '[]')
    into v_previous from public.memorization_material_sentences s
    join public.memorization_material_paragraphs p on p.id = s.paragraph_id
    where s.material_id = p_material_id;
  update public.memorization_materials set title = p_content->>'title' where id = p_material_id;
  delete from public.memorization_material_tags where material_id = p_material_id;
  insert into public.memorization_material_tags(material_id, user_id, display_name, normalized_name)
    select p_material_id, v_user_id, tag->>'displayName', tag->>'normalizedName'
    from jsonb_array_elements(p_content->'tags') tag;
  delete from public.memorization_material_paragraphs where material_id = p_material_id;
  for v_paragraph in select value from jsonb_array_elements(p_content->'paragraphs') loop
    if jsonb_typeof(v_paragraph->'sentences') is distinct from 'array'
      or jsonb_array_length(v_paragraph->'sentences') = 0 then
      raise exception 'Empty paragraph';
    end if;
    insert into public.memorization_material_paragraphs(material_id, user_id, paragraph_order)
      values (p_material_id, v_user_id, (v_paragraph->>'order')::integer) returning id into v_paragraph_id;
    insert into public.memorization_material_sentences(paragraph_id, material_id, user_id, sentence_order, text, translation)
      select v_paragraph_id, p_material_id, v_user_id, (sentence->>'order')::integer,
        sentence->>'text',
        (select old->>'translation' from jsonb_array_elements(v_previous) old
         where old->>'paragraphOrder' = v_paragraph->>'order'
           and old->>'sentenceOrder' = sentence->>'order' and old->>'text' = sentence->>'text')
      from jsonb_array_elements(v_paragraph->'sentences') sentence;
  end loop;
end;
$$;

revoke all on function public.update_roleplay_material(uuid, jsonb) from public, anon;
revoke all on function public.update_memorization_material(uuid, jsonb) from public, anon;
grant execute on function public.update_roleplay_material(uuid, jsonb) to authenticated;
grant execute on function public.update_memorization_material(uuid, jsonb) to authenticated;
