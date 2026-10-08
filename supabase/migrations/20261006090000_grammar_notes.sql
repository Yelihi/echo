-- 저장 경계에서는 필수 구조·문자열·수량·원문/리비전 일치를 검증합니다.
-- 구간의 UTF-16 경계, 구문 계층 및 교차 참조는 TypeScript 도메인 스키마가 책임집니다.
create function public.is_valid_grammar_note_content(p_content jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  v_path text[];
  v_value jsonb;
  v_item jsonb;
  v_range jsonb;
  v_key text;
begin
  if jsonb_typeof(p_content) is distinct from 'object' then return false; end if;
  foreach v_key in array array['source', 'metadata', 'analysis'] loop
    if jsonb_typeof(p_content->v_key) is distinct from 'object' then return false; end if;
  end loop;

  -- 필수 텍스트는 누락·null·공백만 있는 값과 길이 초과를 거부합니다.
  foreach v_path slice 1 in array array[
    ['source','sentence'], ['source','learningNote'], ['metadata','title'],
    ['analysis','sourceText'], ['analysis','naturalTranslation']
  ] loop
    v_value := p_content #> v_path;
    if jsonb_typeof(v_value) is distinct from 'string' then return false; end if;
    if length(v_value #>> '{}') > 4000 or (v_value #>> '{}') !~ '[^[:space:]]' then return false; end if;
  end loop;

  -- AI 메타데이터의 출처, 원문 일치 및 정수 리비전을 확인합니다.
  if p_content #> '{metadata,source}' is distinct from '"ai"'::jsonb
    or not coalesce(p_content #>> '{analysis,reviewStatus}' in ('needs-review','reviewed'), false)
    or p_content #> '{source,sentence}' is distinct from p_content #> '{analysis,sourceText}'
    then return false; end if;
  v_value := p_content #> '{source,revision}';
  if jsonb_typeof(v_value) is distinct from 'number' then return false; end if;
  if (v_value #>> '{}')::numeric < 0 or trunc((v_value #>> '{}')::numeric) <> (v_value #>> '{}')::numeric
    or v_value is distinct from p_content #> '{metadata,sourceRevision}'
    or v_value is distinct from p_content #> '{analysis,sourceRevision}' then return false; end if;
  v_value := p_content #> '{metadata,grammarKey}';
  if v_value is null then return false; end if;
  if v_value <> 'null'::jsonb then
    if jsonb_typeof(v_value) is distinct from 'string' then return false; end if;
    if length(v_value #>> '{}') not between 1 and 100 then return false; end if;
  end if;

  -- 배열 타입을 먼저 확인하여 잘못된 JSON에 배열 함수를 호출하지 않습니다.
  foreach v_path slice 1 in array array[
    ['metadata','tags'], ['analysis','chunks'], ['analysis','syntax'], ['analysis','constructions']
  ] loop
    if jsonb_typeof(p_content #> v_path) is distinct from 'array' then return false; end if;
  end loop;
  if jsonb_typeof(p_content->'examples') is distinct from 'array' then return false; end if;
  if jsonb_array_length(p_content #> '{metadata,tags}') > 20
    or jsonb_array_length(p_content #> '{analysis,chunks}') not between 1 and 200
    or jsonb_array_length(p_content #> '{analysis,syntax}') > 200
    or jsonb_array_length(p_content #> '{analysis,constructions}') > 100
    or jsonb_array_length(p_content->'examples') > 100 then return false; end if;
  for v_item in select value from jsonb_array_elements(p_content #> '{metadata,tags}') loop
    if jsonb_typeof(v_item) is distinct from 'string' then return false; end if;
    if length(v_item #>> '{}') > 4000 or (v_item #>> '{}') !~ '[^[:space:]]' then return false; end if;
  end loop;
  -- 세부 항목의 필수 키와 텍스트 타입을 확인하고 의미론적 구간 검증은 도메인에 위임합니다.
  for v_item in select value from jsonb_array_elements(p_content #> '{analysis,chunks}') loop
    if jsonb_typeof(v_item) is distinct from 'object'
      or jsonb_typeof(v_item->'range') is distinct from 'object'
      or jsonb_typeof(v_item #> '{range,start}') is distinct from 'number'
      or jsonb_typeof(v_item #> '{range,end}') is distinct from 'number'
      or jsonb_typeof(v_item->'id') is distinct from 'string'
      or length(v_item->>'id') not between 1 and 100 then return false; end if;
    foreach v_key in array array['literalMeaning','explanation'] loop
      if jsonb_typeof(v_item->v_key) is distinct from 'string' then return false; end if;
      if length(v_item->>v_key) > 4000 then return false; end if;
    end loop;
  end loop;
  for v_item in select value from jsonb_array_elements(p_content #> '{analysis,syntax}')
    union all select value from jsonb_array_elements(p_content #> '{analysis,constructions}') loop
    if jsonb_typeof(v_item) is distinct from 'object'
      or jsonb_typeof(v_item->'id') is distinct from 'string'
      or length(v_item->>'id') not between 1 and 100
      or jsonb_typeof(v_item->'explanation') is distinct from 'string'
      or length(v_item->>'explanation') > 4000
      or jsonb_typeof(v_item->'ranges') is distinct from 'array' then return false; end if;
    if jsonb_array_length(v_item->'ranges') not between 1 and 100 then return false; end if;
    for v_range in select value from jsonb_array_elements(v_item->'ranges') loop
      if jsonb_typeof(v_range) is distinct from 'object'
        or jsonb_typeof(v_range->'start') is distinct from 'number'
        or jsonb_typeof(v_range->'end') is distinct from 'number' then return false; end if;
    end loop;
  end loop;
  for v_item in select value from jsonb_array_elements(p_content #> '{analysis,syntax}') loop
    if not coalesce(v_item->>'role' in ('subject','verb','object','complement','modifier','other'), false)
      or jsonb_typeof(v_item->'label') is distinct from 'string'
      or length(v_item->>'label') > 4000 or (v_item->>'label') !~ '[^[:space:]]'
      or not (v_item ? 'parentId') then return false; end if;
    if v_item->'parentId' <> 'null'::jsonb then
      if jsonb_typeof(v_item->'parentId') is distinct from 'string'
        or length(v_item->>'parentId') not between 1 and 100 then return false; end if;
    end if;
  end loop;
  for v_item in select value from jsonb_array_elements(p_content #> '{analysis,constructions}') loop
    foreach v_key in array array['name','meaning'] loop
      if jsonb_typeof(v_item->v_key) is distinct from 'string' then return false; end if;
      if length(v_item->>v_key) > 4000 or (v_item->>v_key) !~ '[^[:space:]]' then return false; end if;
    end loop;
  end loop;
  for v_item in select value from jsonb_array_elements(p_content->'examples') loop
    if jsonb_typeof(v_item) is distinct from 'object'
      or jsonb_typeof(v_item->'id') is distinct from 'string'
      or length(v_item->>'id') not between 1 and 100
      or not coalesce(v_item->>'reviewStatus' in ('needs-review','reviewed'), false) then return false; end if;
    foreach v_key in array array['sentence','translation','targetExplanation'] loop
      if jsonb_typeof(v_item->v_key) is distinct from 'string' then return false; end if;
      if length(v_item->>v_key) > 4000 or (v_item->>v_key) !~ '[^[:space:]]' then return false; end if;
    end loop;
  end loop;
  return true;
end;
$$;

create table public.grammar_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  content jsonb not null check (public.is_valid_grammar_note_content(content)),
  creation_request_id uuid not null,
  -- 수정 후 생성 재시도도 최초 요청과 비교하기 위해 원본을 별도로 보존합니다.
  creation_content jsonb not null check (public.is_valid_grammar_note_content(creation_content)),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, creation_request_id)
);
create index grammar_notes_owner_updated_idx on public.grammar_notes(owner_id, updated_at desc, id desc);
alter table public.grammar_notes enable row level security;
create policy grammar_notes_owner_select on public.grammar_notes for select to authenticated
  using (owner_id = (select auth.uid()));
revoke all on public.grammar_notes from public, anon, authenticated;
grant select on public.grammar_notes to authenticated;

create function public.create_grammar_note(p_request_id uuid, p_content jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_owner uuid := auth.uid();
  v_note public.grammar_notes;
begin
  if v_owner is null then raise exception 'GRAMMAR_NOTE_UNAUTHORIZED'; end if;
  if p_request_id is null or not public.is_valid_grammar_note_content(p_content) then
    raise exception 'GRAMMAR_NOTE_INVALID_INPUT';
  end if;
  -- 고유 제약이 동시 요청을 직렬화합니다. 이후 조회는 먼저 완료된 삽입을 확인합니다.
  insert into public.grammar_notes(owner_id, content, creation_request_id, creation_content)
    values (v_owner, p_content, p_request_id, p_content)
    on conflict (owner_id, creation_request_id) do nothing;
  select * into v_note from public.grammar_notes
    where owner_id = v_owner and creation_request_id = p_request_id for update;
  if v_note.creation_content is distinct from p_content then
    raise exception 'GRAMMAR_NOTE_IDEMPOTENCY_CONFLICT';
  end if;
  return to_jsonb(v_note) - 'creation_request_id' - 'creation_content';
end;
$$;

create function public.update_grammar_note(p_note_id uuid, p_expected_version integer, p_content jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_owner uuid := auth.uid();
  v_note public.grammar_notes;
begin
  if v_owner is null then raise exception 'GRAMMAR_NOTE_UNAUTHORIZED'; end if;
  if p_note_id is null or p_expected_version is null or p_expected_version < 1
    or not public.is_valid_grammar_note_content(p_content) then raise exception 'GRAMMAR_NOTE_INVALID_INPUT'; end if;
  -- 조회부터 갱신까지 잠가 오래된 탭의 수정이 최신 내용을 덮어쓰지 못하게 합니다.
  select * into v_note from public.grammar_notes where id = p_note_id and owner_id = v_owner for update;
  if not found then raise exception 'GRAMMAR_NOTE_NOT_FOUND'; end if;
  if v_note.version <> p_expected_version then raise exception 'GRAMMAR_NOTE_VERSION_CONFLICT'; end if;
  if v_note.version = 2147483647 then raise exception 'GRAMMAR_NOTE_VERSION_CONFLICT'; end if;
  update public.grammar_notes set content = p_content, version = version + 1, updated_at = clock_timestamp()
    where id = v_note.id and owner_id = v_owner returning * into v_note;
  return to_jsonb(v_note) - 'creation_request_id' - 'creation_content';
end;
$$;

create function public.list_grammar_notes(p_page integer default 1, p_page_size integer default 20, p_query text default '')
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_owner uuid := auth.uid();
  v_query text := btrim(p_query);
  v_result jsonb;
begin
  if v_owner is null then raise exception 'GRAMMAR_NOTE_UNAUTHORIZED'; end if;
  if p_page is null or p_page < 1 or p_page_size is null or p_page_size not between 1 and 100
    or v_query is null or length(v_query) > 200 then raise exception 'GRAMMAR_NOTE_INVALID_INPUT'; end if;
  -- 총 개수와 페이지는 같은 SQL 스냅샷에서 읽습니다. 빈 페이지에도 전체 개수를 보존합니다.
  with matching as materialized (
    select n.id, n.owner_id, n.version, n.created_at, n.updated_at,
      n.content #>> '{metadata,title}' as title, n.content #>> '{source,sentence}' as sentence,
      n.content #> '{metadata,tags}' as tags
    from public.grammar_notes n where n.owner_id = v_owner
      and (v_query = '' or strpos(lower(n.content #>> '{metadata,title}'), lower(v_query)) > 0
        or strpos(lower(n.content #>> '{source,sentence}'), lower(v_query)) > 0)
  ), page as (
    select * from matching order by updated_at desc, id desc
      limit p_page_size offset (p_page::bigint - 1) * p_page_size
  )
  select jsonb_build_object('total', (select count(*) from matching), 'items', coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', id, 'owner_id', owner_id, 'version', version, 'created_at', created_at, 'updated_at', updated_at,
      'title', title, 'sentence', sentence, 'tags', tags) order by updated_at desc, id desc) from page
  ), '[]'::jsonb)) into v_result;
  return v_result;
end;
$$;

revoke all on function public.is_valid_grammar_note_content(jsonb) from public, anon, authenticated;
revoke all on function public.create_grammar_note(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.update_grammar_note(uuid, integer, jsonb) from public, anon, authenticated;
revoke all on function public.list_grammar_notes(integer, integer, text) from public, anon, authenticated;
grant execute on function public.create_grammar_note(uuid, jsonb) to authenticated;
grant execute on function public.update_grammar_note(uuid, integer, jsonb) to authenticated;
grant execute on function public.list_grammar_notes(integer, integer, text) to authenticated;
