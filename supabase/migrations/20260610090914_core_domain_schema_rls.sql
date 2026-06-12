create extension if not exists "pgcrypto";

create type public.material_status as enum ('active', 'deleted');
create type public.practice_session_status as enum ('ready', 'in_progress', 'completed', 'deleted');
create type public.analysis_job_status as enum ('queued', 'processing', 'completed', 'failed', 'canceled');
create type public.cleanup_failure_source as enum ('draft_recording', 'accepted_recording', 'session_delete');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(trim(display_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create table public.roleplay_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  situation text not null check (char_length(trim(situation)) between 1 and 2000),
  speaker_one_name text not null check (char_length(trim(speaker_one_name)) between 1 and 80),
  speaker_two_name text not null check (char_length(trim(speaker_two_name)) between 1 and 80),
  status public.material_status not null default 'active',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (speaker_one_name <> speaker_two_name),
  check ((status = 'deleted' and deleted_at is not null) or (status = 'active' and deleted_at is null)),
  unique (id, user_id)
);

create table public.roleplay_material_tags (
  material_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  normalized_name text not null check (char_length(trim(normalized_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (material_id, normalized_name),
  foreign key (material_id, user_id) references public.roleplay_materials(id, user_id) on delete cascade
);

create table public.roleplay_lines (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  line_order integer not null check (line_order >= 0),
  speaker_order smallint not null check (speaker_order in (1, 2)),
  text text not null check (char_length(trim(text)) between 1 and 2000),
  translation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, material_id, user_id),
  unique (material_id, line_order),
  foreign key (material_id, user_id) references public.roleplay_materials(id, user_id) on delete cascade
);

create trigger set_roleplay_materials_updated_at
before update on public.roleplay_materials
for each row execute function public.set_updated_at();

create trigger set_roleplay_lines_updated_at
before update on public.roleplay_lines
for each row execute function public.set_updated_at();

create table public.memorization_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  status public.material_status not null default 'active',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'deleted' and deleted_at is not null) or (status = 'active' and deleted_at is null)),
  unique (id, user_id)
);

create table public.memorization_material_tags (
  material_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  normalized_name text not null check (char_length(trim(normalized_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (material_id, normalized_name),
  foreign key (material_id, user_id) references public.memorization_materials(id, user_id) on delete cascade
);

create table public.memorization_material_paragraphs (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  paragraph_order integer not null check (paragraph_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, material_id, user_id),
  unique (material_id, paragraph_order),
  foreign key (material_id, user_id) references public.memorization_materials(id, user_id) on delete cascade
);

create table public.memorization_material_sentences (
  id uuid primary key default gen_random_uuid(),
  paragraph_id uuid not null,
  material_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  sentence_order integer not null check (sentence_order >= 0),
  text text not null check (char_length(trim(text)) between 1 and 2000),
  translation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (paragraph_id, sentence_order),
  foreign key (paragraph_id, material_id, user_id)
    references public.memorization_material_paragraphs(id, material_id, user_id)
    on delete cascade
);

create trigger set_memorization_materials_updated_at
before update on public.memorization_materials
for each row execute function public.set_updated_at();

create trigger set_memorization_material_paragraphs_updated_at
before update on public.memorization_material_paragraphs
for each row execute function public.set_updated_at();

create trigger set_memorization_material_sentences_updated_at
before update on public.memorization_material_sentences
for each row execute function public.set_updated_at();

create table public.roleplay_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid,
  material_title_snapshot text not null check (char_length(trim(material_title_snapshot)) between 1 and 120),
  situation_snapshot text not null check (char_length(trim(situation_snapshot)) between 1 and 2000),
  speaker_one_name_snapshot text not null check (char_length(trim(speaker_one_name_snapshot)) between 1 and 80),
  speaker_two_name_snapshot text not null check (char_length(trim(speaker_two_name_snapshot)) between 1 and 80),
  selected_learner_speaker_order smallint not null check (selected_learner_speaker_order in (1, 2)),
  current_line_order integer not null default 0 check (current_line_order >= 0),
  status public.practice_session_status not null default 'ready',
  started_at timestamptz,
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (speaker_one_name_snapshot <> speaker_two_name_snapshot),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  check ((status = 'deleted' and deleted_at is not null) or (status <> 'deleted' and deleted_at is null)),
  unique (id, user_id),
  foreign key (material_id, user_id) references public.roleplay_materials(id, user_id) on delete set null (material_id)
);

create table public.roleplay_session_tags (
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  normalized_name text not null check (char_length(trim(normalized_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (session_id, normalized_name),
  foreign key (session_id, user_id) references public.roleplay_sessions(id, user_id) on delete cascade
);

create table public.roleplay_session_lines (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  line_order integer not null check (line_order >= 0),
  speaker_order smallint not null check (speaker_order in (1, 2)),
  text_snapshot text not null check (char_length(trim(text_snapshot)) between 1 and 2000),
  translation_snapshot text,
  created_at timestamptz not null default now(),
  unique (id, session_id, user_id),
  unique (id, user_id),
  unique (session_id, line_order),
  foreign key (session_id, user_id) references public.roleplay_sessions(id, user_id) on delete cascade
);

create trigger set_roleplay_sessions_updated_at
before update on public.roleplay_sessions
for each row execute function public.set_updated_at();

create table public.memorization_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid,
  material_title_snapshot text not null check (char_length(trim(material_title_snapshot)) between 1 and 120),
  current_paragraph_order integer not null default 0 check (current_paragraph_order >= 0),
  current_sentence_order integer not null default 0 check (current_sentence_order >= 0),
  status public.practice_session_status not null default 'ready',
  started_at timestamptz,
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  check ((status = 'deleted' and deleted_at is not null) or (status <> 'deleted' and deleted_at is null)),
  unique (id, user_id),
  foreign key (material_id, user_id) references public.memorization_materials(id, user_id) on delete set null (material_id)
);

create table public.memorization_session_tags (
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  normalized_name text not null check (char_length(trim(normalized_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (session_id, normalized_name),
  foreign key (session_id, user_id) references public.memorization_sessions(id, user_id) on delete cascade
);

create table public.memorization_session_paragraphs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  paragraph_order integer not null check (paragraph_order >= 0),
  created_at timestamptz not null default now(),
  unique (id, session_id, user_id),
  unique (session_id, paragraph_order),
  foreign key (session_id, user_id) references public.memorization_sessions(id, user_id) on delete cascade
);

create table public.memorization_session_sentences (
  id uuid primary key default gen_random_uuid(),
  paragraph_id uuid not null,
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  sentence_order integer not null check (sentence_order >= 0),
  text_snapshot text not null check (char_length(trim(text_snapshot)) between 1 and 2000),
  translation_snapshot text,
  created_at timestamptz not null default now(),
  unique (id, session_id, user_id),
  unique (id, user_id),
  unique (paragraph_id, sentence_order),
  foreign key (paragraph_id, session_id, user_id)
    references public.memorization_session_paragraphs(id, session_id, user_id)
    on delete cascade
);

create trigger set_memorization_sessions_updated_at
before update on public.memorization_sessions
for each row execute function public.set_updated_at();

create table public.draft_recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roleplay_session_id uuid,
  roleplay_line_id uuid,
  memorization_session_id uuid,
  memorization_sentence_id uuid,
  bucket_id text not null check (char_length(trim(bucket_id)) between 1 and 120),
  object_path text not null check (char_length(trim(object_path)) between 1 and 1024),
  mime_type text not null check (mime_type like 'audio/%'),
  size_bytes bigint not null check (size_bytes > 0),
  duration_ms integer check (duration_ms is null or duration_ms > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_id, object_path),
  unique (id, user_id),
  check (
    (
      roleplay_session_id is not null
      and roleplay_line_id is not null
      and memorization_session_id is null
      and memorization_sentence_id is null
    )
    or (
      roleplay_session_id is null
      and roleplay_line_id is null
      and memorization_session_id is not null
      and memorization_sentence_id is not null
    )
  ),
  foreign key (roleplay_line_id, roleplay_session_id, user_id)
    references public.roleplay_session_lines(id, session_id, user_id)
    on delete cascade,
  foreign key (memorization_sentence_id, memorization_session_id, user_id)
    references public.memorization_session_sentences(id, session_id, user_id)
    on delete cascade
);

create table public.accepted_recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roleplay_session_id uuid,
  roleplay_line_id uuid,
  memorization_session_id uuid,
  memorization_sentence_id uuid,
  bucket_id text not null check (char_length(trim(bucket_id)) between 1 and 120),
  object_path text not null check (char_length(trim(object_path)) between 1 and 1024),
  mime_type text not null check (mime_type like 'audio/%'),
  size_bytes bigint not null check (size_bytes > 0),
  duration_ms integer check (duration_ms is null or duration_ms > 0),
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_id, object_path),
  unique (id, user_id),
  check (
    (
      roleplay_session_id is not null
      and roleplay_line_id is not null
      and memorization_session_id is null
      and memorization_sentence_id is null
    )
    or (
      roleplay_session_id is null
      and roleplay_line_id is null
      and memorization_session_id is not null
      and memorization_sentence_id is not null
    )
  ),
  foreign key (roleplay_line_id, roleplay_session_id, user_id)
    references public.roleplay_session_lines(id, session_id, user_id)
    on delete cascade,
  foreign key (memorization_sentence_id, memorization_session_id, user_id)
    references public.memorization_session_sentences(id, session_id, user_id)
    on delete cascade
);

create unique index draft_recordings_one_roleplay_target_idx
on public.draft_recordings (roleplay_line_id)
where roleplay_line_id is not null;

create unique index draft_recordings_one_memorization_target_idx
on public.draft_recordings (memorization_sentence_id)
where memorization_sentence_id is not null;

create unique index accepted_recordings_one_roleplay_target_idx
on public.accepted_recordings (roleplay_line_id)
where roleplay_line_id is not null;

create unique index accepted_recordings_one_memorization_target_idx
on public.accepted_recordings (memorization_sentence_id)
where memorization_sentence_id is not null;

create trigger set_draft_recordings_updated_at
before update on public.draft_recordings
for each row execute function public.set_updated_at();

create trigger set_accepted_recordings_updated_at
before update on public.accepted_recordings
for each row execute function public.set_updated_at();

create table public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roleplay_session_id uuid,
  memorization_session_id uuid,
  status public.analysis_job_status not null default 'queued',
  provider text not null default 'openai' check (char_length(trim(provider)) between 1 and 80),
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check ((roleplay_session_id is not null)::integer + (memorization_session_id is not null)::integer = 1),
  check (started_at is null or started_at >= queued_at),
  check (completed_at is null or completed_at >= queued_at),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  check (failed_at is null or failed_at >= queued_at),
  check (failed_at is null or started_at is null or failed_at >= started_at),
  check (
    (status = 'queued' and started_at is null and completed_at is null and failed_at is null and error_message is null)
    or (status = 'processing' and started_at is not null and completed_at is null and failed_at is null and error_message is null)
    or (status = 'completed' and started_at is not null and completed_at is not null and failed_at is null and error_message is null)
    or (
      status = 'failed'
      and started_at is not null
      and completed_at is null
      and failed_at is not null
      and error_message is not null
      and char_length(trim(error_message)) > 0
    )
    or (status = 'canceled' and completed_at is null and failed_at is null and error_message is null)
  ),
  foreign key (roleplay_session_id, user_id) references public.roleplay_sessions(id, user_id) on delete cascade,
  foreign key (memorization_session_id, user_id) references public.memorization_sessions(id, user_id) on delete cascade
);

create unique index analysis_jobs_one_roleplay_session_idx
on public.analysis_jobs (roleplay_session_id)
where roleplay_session_id is not null;

create unique index analysis_jobs_one_memorization_session_idx
on public.analysis_jobs (memorization_session_id)
where memorization_session_id is not null;

create table public.practice_target_analysis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_job_id uuid not null,
  roleplay_line_id uuid,
  memorization_sentence_id uuid,
  transcript text not null check (char_length(trim(transcript)) > 0),
  feedback jsonb not null check (jsonb_typeof(feedback) = 'object'),
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (analysis_job_id, roleplay_line_id),
  unique (analysis_job_id, memorization_sentence_id),
  check ((roleplay_line_id is not null)::integer + (memorization_sentence_id is not null)::integer = 1),
  foreign key (analysis_job_id, user_id) references public.analysis_jobs(id, user_id) on delete cascade,
  foreign key (roleplay_line_id, user_id) references public.roleplay_session_lines(id, user_id) on delete cascade,
  foreign key (memorization_sentence_id, user_id) references public.memorization_session_sentences(id, user_id) on delete cascade
);

create table public.session_analysis_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_job_id uuid not null,
  roleplay_session_id uuid,
  memorization_session_id uuid,
  summary jsonb not null check (jsonb_typeof(summary) = 'object'),
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (analysis_job_id),
  check ((roleplay_session_id is not null)::integer + (memorization_session_id is not null)::integer = 1),
  foreign key (analysis_job_id, user_id) references public.analysis_jobs(id, user_id) on delete cascade,
  foreign key (roleplay_session_id, user_id) references public.roleplay_sessions(id, user_id) on delete cascade,
  foreign key (memorization_session_id, user_id) references public.memorization_sessions(id, user_id) on delete cascade
);

create trigger set_analysis_jobs_updated_at
before update on public.analysis_jobs
for each row execute function public.set_updated_at();

create trigger set_practice_target_analysis_results_updated_at
before update on public.practice_target_analysis_results
for each row execute function public.set_updated_at();

create trigger set_session_analysis_summaries_updated_at
before update on public.session_analysis_summaries
for each row execute function public.set_updated_at();

create table public.cleanup_failure_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source public.cleanup_failure_source not null,
  bucket_id text not null check (char_length(trim(bucket_id)) between 1 and 120),
  object_path text not null check (char_length(trim(object_path)) between 1 and 1024),
  mime_type text not null check (mime_type like 'audio/%'),
  size_bytes bigint not null check (size_bytes > 0),
  duration_ms integer check (duration_ms is null or duration_ms > 0),
  error_message text not null check (char_length(trim(error_message)) > 0),
  attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index user_profiles_updated_idx on public.user_profiles (updated_at desc);

create index roleplay_materials_user_status_updated_idx on public.roleplay_materials (user_id, status, updated_at desc);
create index roleplay_material_tags_user_normalized_idx on public.roleplay_material_tags (user_id, normalized_name);
create index roleplay_lines_user_material_order_idx on public.roleplay_lines (user_id, material_id, line_order);

create index memorization_materials_user_status_updated_idx on public.memorization_materials (user_id, status, updated_at desc);
create index memorization_material_tags_user_normalized_idx on public.memorization_material_tags (user_id, normalized_name);
create index memorization_material_paragraphs_user_order_idx on public.memorization_material_paragraphs (user_id, material_id, paragraph_order);
create index memorization_material_sentences_user_order_idx on public.memorization_material_sentences (user_id, paragraph_id, sentence_order);

create index roleplay_sessions_user_status_created_idx on public.roleplay_sessions (user_id, status, created_at desc);
create index roleplay_sessions_material_idx on public.roleplay_sessions (material_id);
create index roleplay_session_tags_user_normalized_idx on public.roleplay_session_tags (user_id, normalized_name);
create index roleplay_session_lines_user_session_order_idx on public.roleplay_session_lines (user_id, session_id, line_order);

create index memorization_sessions_user_status_created_idx on public.memorization_sessions (user_id, status, created_at desc);
create index memorization_sessions_material_idx on public.memorization_sessions (material_id);
create index memorization_session_tags_user_normalized_idx on public.memorization_session_tags (user_id, normalized_name);
create index memorization_session_paragraphs_user_order_idx on public.memorization_session_paragraphs (user_id, session_id, paragraph_order);
create index memorization_session_sentences_user_order_idx on public.memorization_session_sentences (user_id, paragraph_id, sentence_order);

create index draft_recordings_user_created_idx on public.draft_recordings (user_id, created_at desc);
create index accepted_recordings_user_accepted_idx on public.accepted_recordings (user_id, accepted_at desc);

create index analysis_jobs_user_status_queued_idx on public.analysis_jobs (user_id, status, queued_at asc);
create index practice_target_analysis_results_user_job_idx on public.practice_target_analysis_results (user_id, analysis_job_id);
create index session_analysis_summaries_user_created_idx on public.session_analysis_summaries (user_id, created_at desc);

create index cleanup_failure_logs_user_attempted_idx on public.cleanup_failure_logs (user_id, attempted_at desc);
create index cleanup_failure_logs_source_attempted_idx on public.cleanup_failure_logs (source, attempted_at desc);

alter table public.user_profiles enable row level security;
alter table public.roleplay_materials enable row level security;
alter table public.roleplay_material_tags enable row level security;
alter table public.roleplay_lines enable row level security;
alter table public.memorization_materials enable row level security;
alter table public.memorization_material_tags enable row level security;
alter table public.memorization_material_paragraphs enable row level security;
alter table public.memorization_material_sentences enable row level security;
alter table public.roleplay_sessions enable row level security;
alter table public.roleplay_session_tags enable row level security;
alter table public.roleplay_session_lines enable row level security;
alter table public.memorization_sessions enable row level security;
alter table public.memorization_session_tags enable row level security;
alter table public.memorization_session_paragraphs enable row level security;
alter table public.memorization_session_sentences enable row level security;
alter table public.draft_recordings enable row level security;
alter table public.accepted_recordings enable row level security;
alter table public.analysis_jobs enable row level security;
alter table public.practice_target_analysis_results enable row level security;
alter table public.session_analysis_summaries enable row level security;
alter table public.cleanup_failure_logs enable row level security;

create policy "user_profiles owner can select"
on public.user_profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "user_profiles owner can insert"
on public.user_profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy "user_profiles owner can update"
on public.user_profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "user_profiles owner can delete"
on public.user_profiles for delete to authenticated
using ((select auth.uid()) = id);

create policy "roleplay_materials owner can manage"
on public.roleplay_materials for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "roleplay_material_tags owner can manage"
on public.roleplay_material_tags for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "roleplay_lines owner can manage"
on public.roleplay_lines for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_materials owner can manage"
on public.memorization_materials for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_material_tags owner can manage"
on public.memorization_material_tags for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_material_paragraphs owner can manage"
on public.memorization_material_paragraphs for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_material_sentences owner can manage"
on public.memorization_material_sentences for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "roleplay_sessions owner can manage"
on public.roleplay_sessions for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "roleplay_session_tags owner can manage"
on public.roleplay_session_tags for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "roleplay_session_lines owner can manage"
on public.roleplay_session_lines for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_sessions owner can manage"
on public.memorization_sessions for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_session_tags owner can manage"
on public.memorization_session_tags for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_session_paragraphs owner can manage"
on public.memorization_session_paragraphs for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_session_sentences owner can manage"
on public.memorization_session_sentences for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "draft_recordings owner can manage"
on public.draft_recordings for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "accepted_recordings owner can manage"
on public.accepted_recordings for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "analysis_jobs owner can manage"
on public.analysis_jobs for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "practice_target_analysis_results owner can manage"
on public.practice_target_analysis_results for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "session_analysis_summaries owner can manage"
on public.session_analysis_summaries for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "cleanup_failure_logs owner can manage"
on public.cleanup_failure_logs for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
