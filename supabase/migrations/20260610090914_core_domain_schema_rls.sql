create extension if not exists "pgcrypto";

create type public.material_status as enum ('active', 'deleted');
create type public.practice_session_status as enum ('ready', 'practicing', 'completed', 'abandoned', 'deleted');
create type public.recording_file_status as enum ('stored', 'cleanup_pending', 'deleted');
create type public.analysis_job_status as enum ('queued', 'processing', 'completed', 'failed', 'canceled');
create type public.analysis_result_status as enum ('available', 'deleted');
create type public.cleanup_status as enum ('pending', 'completed', 'failed');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.roleplay_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  situation text not null check (char_length(trim(situation)) between 1 and 2000),
  tags text[] not null default '{}',
  status public.material_status not null default 'active',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'deleted' and deleted_at is not null) or (status = 'active' and deleted_at is null)),
  unique (id, user_id)
);

create table public.roleplay_lines (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  line_order integer not null check (line_order >= 0),
  speaker text not null check (char_length(trim(speaker)) between 1 and 80),
  text text not null check (char_length(trim(text)) between 1 and 2000),
  translation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (material_id, line_order),
  foreign key (material_id, user_id) references public.roleplay_materials(id, user_id) on delete cascade
);

create table public.memorization_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  paragraphs jsonb not null check (jsonb_typeof(paragraphs) = 'array' and jsonb_array_length(paragraphs) > 0),
  translation jsonb,
  tags text[] not null default '{}',
  status public.material_status not null default 'active',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (translation is null or jsonb_typeof(translation) = 'array'),
  check ((status = 'deleted' and deleted_at is not null) or (status = 'active' and deleted_at is null)),
  unique (id, user_id)
);

create trigger set_roleplay_materials_updated_at
before update on public.roleplay_materials
for each row execute function public.set_updated_at();

create trigger set_roleplay_lines_updated_at
before update on public.roleplay_lines
for each row execute function public.set_updated_at();

create trigger set_memorization_materials_updated_at
before update on public.memorization_materials
for each row execute function public.set_updated_at();

create table public.roleplay_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid,
  material_title_snapshot text not null check (char_length(trim(material_title_snapshot)) between 1 and 120),
  situation_snapshot text not null check (char_length(trim(situation_snapshot)) between 1 and 2000),
  status public.practice_session_status not null default 'ready',
  started_at timestamptz,
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  check ((status = 'deleted' and deleted_at is not null) or (status <> 'deleted' and deleted_at is null)),
  unique (id, user_id),
  foreign key (material_id, user_id) references public.roleplay_materials(id, user_id) on delete set null (material_id)
);

create table public.roleplay_session_lines (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  line_order integer not null check (line_order >= 0),
  speaker_snapshot text not null check (char_length(trim(speaker_snapshot)) between 1 and 80),
  text_snapshot text not null check (char_length(trim(text_snapshot)) between 1 and 2000),
  translation_snapshot text,
  created_at timestamptz not null default now(),
  unique (session_id, line_order),
  foreign key (session_id, user_id) references public.roleplay_sessions(id, user_id) on delete cascade
);

create table public.memorization_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid,
  material_title_snapshot text not null check (char_length(trim(material_title_snapshot)) between 1 and 120),
  paragraphs_snapshot jsonb not null check (jsonb_typeof(paragraphs_snapshot) = 'array' and jsonb_array_length(paragraphs_snapshot) > 0),
  translation_snapshot jsonb,
  status public.practice_session_status not null default 'ready',
  started_at timestamptz,
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (translation_snapshot is null or jsonb_typeof(translation_snapshot) = 'array'),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  check ((status = 'deleted' and deleted_at is not null) or (status <> 'deleted' and deleted_at is null)),
  unique (id, user_id),
  foreign key (material_id, user_id) references public.memorization_materials(id, user_id) on delete set null (material_id)
);

create trigger set_roleplay_sessions_updated_at
before update on public.roleplay_sessions
for each row execute function public.set_updated_at();

create trigger set_memorization_sessions_updated_at
before update on public.memorization_sessions
for each row execute function public.set_updated_at();

create table public.recording_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roleplay_session_id uuid,
  memorization_session_id uuid,
  bucket_id text not null check (char_length(trim(bucket_id)) between 1 and 120),
  object_path text not null check (char_length(trim(object_path)) between 1 and 1024),
  mime_type text not null check (mime_type like 'audio/%'),
  size_bytes bigint not null check (size_bytes > 0),
  duration_ms integer check (duration_ms is null or duration_ms > 0),
  status public.recording_file_status not null default 'stored',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket_id, object_path),
  unique (id, user_id),
  check ((roleplay_session_id is not null)::integer + (memorization_session_id is not null)::integer = 1),
  check ((status = 'deleted' and deleted_at is not null) or (status <> 'deleted' and deleted_at is null)),
  foreign key (roleplay_session_id, user_id) references public.roleplay_sessions(id, user_id) on delete cascade,
  foreign key (memorization_session_id, user_id) references public.memorization_sessions(id, user_id) on delete cascade
);

create table public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recording_file_id uuid not null,
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
  unique (id, user_id, recording_file_id),
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
  foreign key (recording_file_id, user_id) references public.recording_files(id, user_id) on delete cascade
);

create table public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_job_id uuid not null unique,
  recording_file_id uuid not null,
  transcript text not null check (char_length(trim(transcript)) > 0),
  feedback jsonb not null check (jsonb_typeof(feedback) = 'object'),
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  status public.analysis_result_status not null default 'available',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check ((status = 'deleted' and deleted_at is not null) or (status = 'available' and deleted_at is null)),
  foreign key (analysis_job_id, user_id, recording_file_id) references public.analysis_jobs(id, user_id, recording_file_id) on delete cascade,
  foreign key (recording_file_id, user_id) references public.recording_files(id, user_id) on delete cascade
);

create table public.file_cleanup_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recording_file_id uuid,
  bucket_id text not null check (char_length(trim(bucket_id)) between 1 and 120),
  object_path text not null check (char_length(trim(object_path)) between 1 and 1024),
  status public.cleanup_status not null default 'pending',
  error_message text,
  attempted_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or completed_at >= attempted_at),
  check (
    (status = 'completed' and completed_at is not null)
    or (status in ('pending', 'failed') and completed_at is null)
  ),
  foreign key (recording_file_id, user_id) references public.recording_files(id, user_id) on delete set null (recording_file_id)
);

create trigger set_recording_files_updated_at
before update on public.recording_files
for each row execute function public.set_updated_at();

create trigger set_analysis_jobs_updated_at
before update on public.analysis_jobs
for each row execute function public.set_updated_at();

create trigger set_analysis_results_updated_at
before update on public.analysis_results
for each row execute function public.set_updated_at();

create trigger set_file_cleanup_logs_updated_at
before update on public.file_cleanup_logs
for each row execute function public.set_updated_at();

create index roleplay_materials_user_status_updated_idx on public.roleplay_materials (user_id, status, updated_at desc);
create index roleplay_materials_tags_idx on public.roleplay_materials using gin (tags);
create index roleplay_lines_user_idx on public.roleplay_lines (user_id);

create index memorization_materials_user_status_updated_idx on public.memorization_materials (user_id, status, updated_at desc);
create index memorization_materials_tags_idx on public.memorization_materials using gin (tags);

create index roleplay_sessions_user_status_created_idx on public.roleplay_sessions (user_id, status, created_at desc);
create index roleplay_sessions_material_idx on public.roleplay_sessions (material_id);
create index roleplay_session_lines_user_idx on public.roleplay_session_lines (user_id);

create index memorization_sessions_user_status_created_idx on public.memorization_sessions (user_id, status, created_at desc);
create index memorization_sessions_material_idx on public.memorization_sessions (material_id);

create index recording_files_user_status_created_idx on public.recording_files (user_id, status, created_at desc);
create index recording_files_roleplay_session_idx on public.recording_files (roleplay_session_id) where roleplay_session_id is not null;
create index recording_files_memorization_session_idx on public.recording_files (memorization_session_id) where memorization_session_id is not null;

create index analysis_jobs_user_status_queued_idx on public.analysis_jobs (user_id, status, queued_at asc);
create index analysis_jobs_recording_idx on public.analysis_jobs (recording_file_id);
create index analysis_results_user_status_created_idx on public.analysis_results (user_id, status, created_at desc);
create index analysis_results_recording_idx on public.analysis_results (recording_file_id);

create index file_cleanup_logs_user_status_attempted_idx on public.file_cleanup_logs (user_id, status, attempted_at desc);
create index file_cleanup_logs_recording_idx on public.file_cleanup_logs (recording_file_id);

alter table public.roleplay_materials enable row level security;
alter table public.roleplay_lines enable row level security;
alter table public.roleplay_sessions enable row level security;
alter table public.roleplay_session_lines enable row level security;
alter table public.memorization_materials enable row level security;
alter table public.memorization_sessions enable row level security;
alter table public.recording_files enable row level security;
alter table public.analysis_jobs enable row level security;
alter table public.analysis_results enable row level security;
alter table public.file_cleanup_logs enable row level security;

create policy "roleplay_materials owner can select"
on public.roleplay_materials
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "roleplay_materials owner can insert"
on public.roleplay_materials
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "roleplay_materials owner can update"
on public.roleplay_materials
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "roleplay_materials owner can delete"
on public.roleplay_materials
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "roleplay_lines owner can select"
on public.roleplay_lines
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "roleplay_lines owner can insert"
on public.roleplay_lines
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "roleplay_lines owner can update"
on public.roleplay_lines
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "roleplay_lines owner can delete"
on public.roleplay_lines
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "roleplay_sessions owner can select"
on public.roleplay_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "roleplay_sessions owner can insert"
on public.roleplay_sessions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "roleplay_sessions owner can update"
on public.roleplay_sessions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "roleplay_sessions owner can delete"
on public.roleplay_sessions
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "roleplay_session_lines owner can select"
on public.roleplay_session_lines
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "roleplay_session_lines owner can insert"
on public.roleplay_session_lines
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "roleplay_session_lines owner can update"
on public.roleplay_session_lines
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "roleplay_session_lines owner can delete"
on public.roleplay_session_lines
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "memorization_materials owner can select"
on public.memorization_materials
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "memorization_materials owner can insert"
on public.memorization_materials
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "memorization_materials owner can update"
on public.memorization_materials
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_materials owner can delete"
on public.memorization_materials
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "memorization_sessions owner can select"
on public.memorization_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "memorization_sessions owner can insert"
on public.memorization_sessions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "memorization_sessions owner can update"
on public.memorization_sessions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "memorization_sessions owner can delete"
on public.memorization_sessions
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "recording_files owner can select"
on public.recording_files
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "recording_files owner can insert"
on public.recording_files
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "recording_files owner can update"
on public.recording_files
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "recording_files owner can delete"
on public.recording_files
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "analysis_jobs owner can select"
on public.analysis_jobs
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "analysis_jobs owner can insert"
on public.analysis_jobs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "analysis_jobs owner can update"
on public.analysis_jobs
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "analysis_jobs owner can delete"
on public.analysis_jobs
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "analysis_results owner can select"
on public.analysis_results
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "analysis_results owner can insert"
on public.analysis_results
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "analysis_results owner can update"
on public.analysis_results
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "analysis_results owner can delete"
on public.analysis_results
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "file_cleanup_logs owner can select"
on public.file_cleanup_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "file_cleanup_logs owner can insert"
on public.file_cleanup_logs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "file_cleanup_logs owner can update"
on public.file_cleanup_logs
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "file_cleanup_logs owner can delete"
on public.file_cleanup_logs
for delete
to authenticated
using ((select auth.uid()) = user_id);
