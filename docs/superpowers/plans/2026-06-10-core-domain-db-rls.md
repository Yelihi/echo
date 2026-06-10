# Core Domain DB/RLS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Echo MVP's core private Postgres schema and RLS policies for roleplay materials, memorization materials, practice sessions, recordings, analysis jobs/results, and cleanup logs.

**Architecture:** The database is the lifecycle boundary for the Learning Materials, Practice Sessions, Analysis, Recording Storage, and Cleanup bounded contexts from issue #2. Every private row is scoped by `user_id = auth.uid()`, sessions store immutable snapshots so historical result pages survive later material edits, and list queries use status plus timestamp indexes. Tags start as `text[]` for MVP speed and get a GIN index; a normalized tag aggregate is deferred until shared tag management becomes a product requirement.

**Tech Stack:** Supabase CLI migrations, PostgreSQL 17, Supabase Auth RLS, Next.js App Router, TypeScript generated database types.

---

## File Structure

- Create `supabase/migrations/<timestamp>_core_domain_schema_rls.sql`: all enum types, helper trigger function, tables, constraints, indexes, grants, and RLS policies for issue #4.
- Create `src/shared/lib/supabase/database.types.ts`: generated Supabase TypeScript types after the migration is applied locally.
- Modify `src/shared/lib/supabase/client.ts`: bind the browser client to generated database types if it is currently untyped.
- Modify `src/shared/lib/supabase/server.ts`: bind the server client to generated database types if it is currently untyped.
- Modify `src/shared/lib/supabase/service-role.ts`: bind the service-role client to generated database types if it is currently untyped.
- Optionally modify `supabase/seed.sql`: keep empty unless local verification needs a service-role seed fixture; do not add user-specific seed data without auth test users.

## Domain Decisions

- `roleplay_materials` owns mutable saved roleplay content. `roleplay_lines` are child rows ordered by `line_order`.
- `roleplay_sessions` represents a user practice attempt. `roleplay_session_lines` stores the immutable material snapshot used by that session.
- `memorization_materials` owns memo content as ordered paragraph/translation arrays in `jsonb`; `memorization_sessions` stores its own immutable snapshot in `jsonb`.
- `recording_files` links a private storage object to either session type through nullable foreign keys with an exactly-one-session check.
- `analysis_jobs` links to one recording and captures queue state. `analysis_results` is one-to-one with a job.
- `file_cleanup_logs` records failed or completed cleanup attempts and is private to the owning user.
- All user-facing list tables use `status in ('active', 'deleted')` or a domain-specific enum containing equivalent lifecycle values. Default list policies expose only non-deleted rows; direct result/snapshot reads remain available for the owner.

## Task 1: Create Migration Shell And Core Enums

**Files:**

- Create: `supabase/migrations/<timestamp>_core_domain_schema_rls.sql`

- [ ] **Step 1: Create the migration file**

Run:

```bash
npm run supabase -- migration new core_domain_schema_rls
```

Expected: a file like `supabase/migrations/20260610HHMMSS_core_domain_schema_rls.sql` is created.

- [ ] **Step 2: Add shared extensions, enum types, and timestamp trigger**

Add this SQL at the top of the migration:

```sql
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
```

- [ ] **Step 3: Run migration syntax check**

Run:

```bash
npm run supabase -- db reset
```

Expected: PASS through the enum/function section. If Docker or local Supabase is not running, start it with `npm run supabase:start` and rerun.

## Task 2: Add Learning Materials Tables

**Files:**

- Modify: `supabase/migrations/<timestamp>_core_domain_schema_rls.sql`

- [ ] **Step 1: Add roleplay material tables**

Append:

```sql
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
  check ((status = 'deleted' and deleted_at is not null) or (status = 'active' and deleted_at is null))
);

create table public.roleplay_lines (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.roleplay_materials(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  line_order integer not null check (line_order >= 0),
  speaker text not null check (char_length(trim(speaker)) between 1 and 80),
  text text not null check (char_length(trim(text)) between 1 and 2000),
  translation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (material_id, line_order)
);
```

- [ ] **Step 2: Add memorization material table**

Append:

```sql
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
  check ((status = 'deleted' and deleted_at is not null) or (status = 'active' and deleted_at is null))
);
```

- [ ] **Step 3: Add updated_at triggers**

Append:

```sql
create trigger set_roleplay_materials_updated_at
before update on public.roleplay_materials
for each row execute function public.set_updated_at();

create trigger set_roleplay_lines_updated_at
before update on public.roleplay_lines
for each row execute function public.set_updated_at();

create trigger set_memorization_materials_updated_at
before update on public.memorization_materials
for each row execute function public.set_updated_at();
```

- [ ] **Step 4: Reset database**

Run:

```bash
npm run supabase -- db reset
```

Expected: PASS and the three material tables exist.

## Task 3: Add Practice Session Snapshot Tables

**Files:**

- Modify: `supabase/migrations/<timestamp>_core_domain_schema_rls.sql`

- [ ] **Step 1: Add roleplay session and line snapshot tables**

Append:

```sql
create table public.roleplay_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid references public.roleplay_materials(id) on delete set null,
  material_title_snapshot text not null check (char_length(trim(material_title_snapshot)) between 1 and 120),
  situation_snapshot text not null check (char_length(trim(situation_snapshot)) between 1 and 2000),
  status public.practice_session_status not null default 'ready',
  started_at timestamptz,
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  check ((status = 'deleted' and deleted_at is not null) or (status <> 'deleted' and deleted_at is null))
);

create table public.roleplay_session_lines (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.roleplay_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  line_order integer not null check (line_order >= 0),
  speaker_snapshot text not null check (char_length(trim(speaker_snapshot)) between 1 and 80),
  text_snapshot text not null check (char_length(trim(text_snapshot)) between 1 and 2000),
  translation_snapshot text,
  created_at timestamptz not null default now(),
  unique (session_id, line_order)
);
```

- [ ] **Step 2: Add memorization session snapshot table**

Append:

```sql
create table public.memorization_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid references public.memorization_materials(id) on delete set null,
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
  check ((status = 'deleted' and deleted_at is not null) or (status <> 'deleted' and deleted_at is null))
);
```

- [ ] **Step 3: Add updated_at triggers**

Append:

```sql
create trigger set_roleplay_sessions_updated_at
before update on public.roleplay_sessions
for each row execute function public.set_updated_at();

create trigger set_memorization_sessions_updated_at
before update on public.memorization_sessions
for each row execute function public.set_updated_at();
```

- [ ] **Step 4: Reset database**

Run:

```bash
npm run supabase -- db reset
```

Expected: PASS and snapshot tables preserve material text independently from mutable material rows.

## Task 4: Add Recording, Analysis, And Cleanup Tables

**Files:**

- Modify: `supabase/migrations/<timestamp>_core_domain_schema_rls.sql`

- [ ] **Step 1: Add recording files table**

Append:

```sql
create table public.recording_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roleplay_session_id uuid references public.roleplay_sessions(id) on delete cascade,
  memorization_session_id uuid references public.memorization_sessions(id) on delete cascade,
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
  check ((roleplay_session_id is not null)::integer + (memorization_session_id is not null)::integer = 1),
  check ((status = 'deleted' and deleted_at is not null) or (status <> 'deleted' and deleted_at is null))
);
```

- [ ] **Step 2: Add analysis tables**

Append:

```sql
create table public.analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recording_file_id uuid not null references public.recording_files(id) on delete cascade,
  status public.analysis_job_status not null default 'queued',
  provider text not null default 'openai' check (char_length(trim(provider)) between 1 and 80),
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or started_at is null or completed_at >= started_at),
  check (failed_at is null or started_at is null or failed_at >= started_at)
);

create table public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_job_id uuid not null unique references public.analysis_jobs(id) on delete cascade,
  recording_file_id uuid not null references public.recording_files(id) on delete cascade,
  transcript text not null check (char_length(trim(transcript)) > 0),
  feedback jsonb not null check (jsonb_typeof(feedback) = 'object'),
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  status public.analysis_result_status not null default 'available',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'deleted' and deleted_at is not null) or (status = 'available' and deleted_at is null))
);
```

- [ ] **Step 3: Add cleanup logs**

Append:

```sql
create table public.file_cleanup_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recording_file_id uuid references public.recording_files(id) on delete set null,
  bucket_id text not null check (char_length(trim(bucket_id)) between 1 and 120),
  object_path text not null check (char_length(trim(object_path)) between 1 and 1024),
  status public.cleanup_status not null default 'pending',
  error_message text,
  attempted_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (completed_at is null or completed_at >= attempted_at)
);
```

- [ ] **Step 4: Add updated_at triggers**

Append:

```sql
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
```

- [ ] **Step 5: Reset database**

Run:

```bash
npm run supabase -- db reset
```

Expected: PASS and all issue #4 tables exist.

## Task 5: Add Indexes For Ownership, Lists, Recent Items, And Filters

**Files:**

- Modify: `supabase/migrations/<timestamp>_core_domain_schema_rls.sql`

- [ ] **Step 1: Add ownership and list indexes**

Append:

```sql
create index roleplay_materials_user_status_updated_idx on public.roleplay_materials (user_id, status, updated_at desc);
create index roleplay_materials_tags_idx on public.roleplay_materials using gin (tags);
create index roleplay_lines_material_order_idx on public.roleplay_lines (material_id, line_order);
create index roleplay_lines_user_idx on public.roleplay_lines (user_id);

create index memorization_materials_user_status_updated_idx on public.memorization_materials (user_id, status, updated_at desc);
create index memorization_materials_tags_idx on public.memorization_materials using gin (tags);

create index roleplay_sessions_user_status_created_idx on public.roleplay_sessions (user_id, status, created_at desc);
create index roleplay_sessions_material_idx on public.roleplay_sessions (material_id);
create index roleplay_session_lines_session_order_idx on public.roleplay_session_lines (session_id, line_order);
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
```

- [ ] **Step 2: Reset database**

Run:

```bash
npm run supabase -- db reset
```

Expected: PASS and indexes exist for `user_id`, status, recent list ordering, tag filters, and child row ordering.

## Task 6: Enable RLS And Add Owner Policies

**Files:**

- Modify: `supabase/migrations/<timestamp>_core_domain_schema_rls.sql`

- [ ] **Step 1: Enable RLS on every private table**

Append:

```sql
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
```

- [ ] **Step 2: Add authenticated owner policies**

For each table in the RLS list, add policies using the exact table name:

```sql
create policy "<table> owner can select"
on public.<table>
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "<table> owner can insert"
on public.<table>
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "<table> owner can update"
on public.<table>
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "<table> owner can delete"
on public.<table>
for delete
to authenticated
using ((select auth.uid()) = user_id);
```

Apply the policy block to:

```text
roleplay_materials
roleplay_lines
roleplay_sessions
roleplay_session_lines
memorization_materials
memorization_sessions
recording_files
analysis_jobs
analysis_results
file_cleanup_logs
```

- [ ] **Step 3: Reset database**

Run:

```bash
npm run supabase -- db reset
```

Expected: PASS. Unauthenticated requests have no policies and cannot read or write private rows.

## Task 7: Validate Schema Acceptance Criteria

**Files:**

- No source files.

- [ ] **Step 1: Verify table and enum creation**

Run:

```bash
npm run supabase -- db reset
```

Expected: PASS.

Run:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('roleplay_materials','roleplay_lines','roleplay_sessions','roleplay_session_lines','memorization_materials','memorization_sessions','recording_files','analysis_jobs','analysis_results','file_cleanup_logs') order by table_name;"
```

Expected: 10 rows.

- [ ] **Step 2: Verify RLS is enabled**

Run:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname in ('roleplay_materials','roleplay_lines','roleplay_sessions','roleplay_session_lines','memorization_materials','memorization_sessions','recording_files','analysis_jobs','analysis_results','file_cleanup_logs') order by relname;"
```

Expected: every `relrowsecurity` value is `t`.

- [ ] **Step 3: Verify every private table has owner policies**

Run:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "select tablename, cmd, count(*) from pg_policies where schemaname = 'public' and tablename in ('roleplay_materials','roleplay_lines','roleplay_sessions','roleplay_session_lines','memorization_materials','memorization_sessions','recording_files','analysis_jobs','analysis_results','file_cleanup_logs') group by tablename, cmd order by tablename, cmd;"
```

Expected: each table has `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies scoped to authenticated owners.

- [ ] **Step 4: Verify snapshot preservation**

Run a service-role or SQL-editor fixture that inserts a material, creates a session snapshot, updates the material title/text, and selects from `roleplay_sessions` plus `roleplay_session_lines`.

Expected: snapshot columns retain the original title, situation, speaker, and line text after material rows change.

- [ ] **Step 5: Verify indexes**

Run:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "select tablename, indexname from pg_indexes where schemaname = 'public' and tablename in ('roleplay_materials','memorization_materials','roleplay_sessions','memorization_sessions','recording_files','analysis_jobs','analysis_results','file_cleanup_logs') order by tablename, indexname;"
```

Expected: indexes include ownership/status/recent ordering indexes and GIN tag indexes.

## Task 8: Generate Supabase TypeScript Types

**Files:**

- Create: `src/shared/lib/supabase/database.types.ts`
- Modify: `src/shared/lib/supabase/client.ts`
- Modify: `src/shared/lib/supabase/server.ts`
- Modify: `src/shared/lib/supabase/service-role.ts`

- [ ] **Step 1: Generate local types**

Run:

```bash
npm run supabase -- gen types typescript --local > src/shared/lib/supabase/database.types.ts
```

Expected: `database.types.ts` contains all issue #4 tables and enums.

- [ ] **Step 2: Type Supabase clients**

Update client creation calls to use the generated type:

```ts
import type { Database } from "./database.types";
```

Then pass `Database` to Supabase client generics where the local helper creates clients.

- [ ] **Step 3: Run TypeScript verification**

Run:

```bash
npm run typecheck
```

Expected: PASS.

## Task 9: Final Verification And Review

**Files:**

- All changed files.

- [ ] **Step 1: Run database reset**

Run:

```bash
npm run supabase -- db reset
```

Expected: PASS.

- [ ] **Step 2: Run Supabase security advisor if project access is available**

Use the Supabase advisor for the linked project or local equivalent.

Expected: no missing-RLS findings for the 10 private tables.

- [ ] **Step 3: Run app checks**

Run:

```bash
npm run typecheck
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Commit**

Run:

```bash
git add supabase/migrations src/shared/lib/supabase docs/superpowers/plans/2026-06-10-core-domain-db-rls.md
git commit -m "feat: add core domain database schema and RLS"
```

Expected: commit succeeds on `issue-4-db-rls-core-domain`.

## Self-Review Notes

- Issue #4 table scope is covered by Tasks 2 through 4.
- Enum/check constraints are covered by Tasks 1 through 4.
- RLS on every private table is covered by Task 6.
- `user_id = auth.uid()` scope is covered by Task 6 using `(select auth.uid()) = user_id`.
- Session snapshots are covered by Task 3 and verified in Task 7.
- Active/deleted lifecycle is covered by material/result/recording/session status checks and list indexes.
- List/recent/filter indexes are covered by Task 5.
- The open tags question is resolved for MVP as `text[]` plus GIN index; normalization is deferred.
