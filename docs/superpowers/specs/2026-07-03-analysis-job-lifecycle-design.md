# Analysis Job Lifecycle Design

## 한글 요약

분석 Job은 기존 기획대로 session 단위(`roleplay_session_id` 또는 `memorization_session_id`)를 유지한다. 재시도는 기존 실패 row를 `queued`로 되돌리는 방식이 아니라 새 `analysis_jobs` row를 만드는 방식으로 처리한다.

핵심 정책은 다음과 같다.

- API/command는 `requestAnalysisJob` 하나만 둔다.
- 최초 요청과 재요청은 같은 command로 처리한다.
- `queued`, `processing`, `completed` 상태는 current job으로 본다.
- `failed`, `canceled` 상태는 history로 남기며 새 요청을 막지 않는다.
- `completed` 이후에는 MVP에서 재분석을 허용하지 않고 기존 completed job을 반환한다.
- retry 횟수 제한을 나중에 걸기 쉽도록 `attempt_number`를 추가한다.
- processor 동시 실행을 고려해 claim/update는 DB RPC가 lifecycle 정합성을 책임진다.

성공 결과는 `practice_target_analysis_results`와 `session_analysis_summaries`에 저장하고, 실패 row에는 최소 실패 메타데이터(`error_code`, `error_message`, `error_log_ref`)만 저장한다. 상세 로그와 provider payload는 Sentry/Datadog/GlitchTip 같은 observability 도구에 남긴다.

## Goal

Implement the database-backed lifecycle for asynchronous session analysis jobs.

This issue does not implement the STT/LLM processor itself, target result rendering, or retry UI. It defines the durable job queue semantics that those features depend on.

## Current Context

The project already has:

- `analysis_jobs`
- `practice_target_analysis_results`
- `session_analysis_summaries`
- `AnalysisJob` entity and repository read methods

The existing schema enforces one job per session with unique indexes on `roleplay_session_id` and `memorization_session_id`. That conflicts with immutable retry history because a failed job row blocks creation of a new retry row for the same session.

## Domain Model

Bounded context: Analysis

`AnalysisJob` is a session-scoped asynchronous analysis attempt.

An analysis job targets exactly one session:

- roleplay session
- or memorization session

The project keeps the existing status vocabulary:

- `queued`
- `processing`
- `completed`
- `failed`
- `canceled`

Issue text may say `pending`; the code and database use `queued`.

## Lifecycle

```text
queued -> processing
processing -> completed
processing -> failed
queued -> canceled
```

There is no direct `failed -> queued` update. A retry is represented by creating a new `queued` row for the same session/provider after there is no current job.

`completed` is terminal for MVP. Once a session has a completed current job, another request returns the completed job instead of creating a new row.

## Current Job

A current job is a job that prevents another request for the same session/provider from creating a new attempt:

```text
status in ('queued', 'processing', 'completed')
```

Terminal failure history is not current:

```text
status in ('failed', 'canceled')
```

This gives the intended behavior:

```text
request 1 -> job 1 queued -> failed, attempt 1
request 2 -> job 2 queued -> failed, attempt 2
request 3 -> job 3 queued -> completed, attempt 3
request 4 -> returns job 3
```

## Request Semantics

There is one application command:

```ts
requestAnalysisJob(input): Promise<AnalysisJob>
```

There is no separate retry command in the MVP. A retry is just another request when only failed/canceled history exists.

The database function should behave as:

```text
1. Find a current job for the same user/session/provider.
2. If found, return it.
3. Otherwise insert a new queued job.
4. Set attempt_number to max(attempt_number) + 1 for the same user/session/provider.
```

The database remains the final concurrency boundary. If two identical requests race, at most one current row can be inserted.

`request_analysis_job` should take a transaction-scoped advisory lock for the same user/session/provider before checking the current job and calculating the next attempt. This avoids stale unique-conflict recovery when a conflicting row becomes failed/canceled before a racing request reselects it.

## Schema Changes

Add:

```sql
attempt_number integer not null default 1 check (attempt_number > 0)
```

Add minimal failure metadata:

```sql
error_code text
error_log_ref text
```

Keep `error_message`, but treat it as a short sanitized message. Detailed provider payloads, stack traces, and raw logs belong in Sentry/Datadog/GlitchTip, referenced by `error_log_ref` when available.

Before adding the stricter failed-state check, existing failed rows must be backfilled with a sanitized default `error_code`. PostgreSQL validates new constraints against existing rows.

Replace the existing session-wide unique indexes with partial unique indexes over current jobs:

```sql
create unique index analysis_jobs_current_roleplay_session_provider_idx
on public.analysis_jobs (user_id, roleplay_session_id, provider)
where roleplay_session_id is not null
  and status in ('queued', 'processing', 'completed');

create unique index analysis_jobs_current_memorization_session_provider_idx
on public.analysis_jobs (user_id, memorization_session_id, provider)
where memorization_session_id is not null
  and status in ('queued', 'processing', 'completed');
```

The `user_id` and `provider` columns are included because the request semantics are per user/session/provider.

Add a queue-claim index for workers:

```sql
create index analysis_jobs_provider_queue_idx
on public.analysis_jobs (provider, queued_at asc, created_at asc)
where status = 'queued';
```

Update status consistency checks so:

- `failed` requires `failed_at`, `error_code`, and `error_message`
- non-failed statuses require `failed_at`, `error_code`, `error_message`, and `error_log_ref` to be null
- `completed` requires `completed_at`
- `processing` requires `started_at`
- `queued` has no start/completion/failure metadata

`canceled` remains terminal, but MVP does not expose a cancel workflow. If cancel is later exposed to users, add `canceled_at` rather than overloading `failed_at`.

## RPC Functions

### `request_analysis_job`

Purpose:

- idempotently request analysis for one session/provider
- create a new attempt only when no current job exists

Important behavior:

- accepts either roleplay session id or memorization session id, never both
- returns an existing current row when present
- otherwise inserts a queued row with the next attempt number
- handles concurrent duplicate requests safely

### `claim_next_analysis_job`

Purpose:

- atomically claim one queued job for processing

Important behavior:

- selects a queued row ordered by `queued_at`
- uses `for update skip locked`
- updates it to `processing`
- sets `started_at`
- returns the claimed row

This must be a database function because repository-level `select` then `update` can race when multiple processors are running.

### `complete_analysis_job`

Purpose:

- transition one processing job to completed

Important behavior:

- only updates rows currently in `processing`
- sets `completed_at`
- clears failure metadata
- returns the updated row

The actual writing of target results and session summaries may happen in the processor implementation issue. This function only owns the lifecycle transition.

### `fail_analysis_job`

Purpose:

- transition one processing job to failed

Important behavior:

- only updates rows currently in `processing`
- sets `failed_at`
- writes sanitized `error_code`, `error_message`, and optional `error_log_ref`
- returns the updated row

## Repository API

The current methods imply one job per session:

```ts
findByRoleplaySessionId(sessionId);
findByMemorizationSessionId(sessionId);
```

Retry history invalidates that assumption. Replace or deprecate them with meaning-specific methods:

```ts
requestAnalysisJob(input): Promise<AnalysisJob>
claimNextAnalysisJob(): Promise<AnalysisJob | null>
completeAnalysisJob(input): Promise<AnalysisJob>
failAnalysisJob(input): Promise<AnalysisJob>

findCurrentByRoleplaySessionId({ sessionId, provider? }): Promise<AnalysisJob | null>
findCurrentByMemorizationSessionId({ sessionId, provider? }): Promise<AnalysisJob | null>
findHistoryByRoleplaySessionId({ sessionId, provider? }): Promise<AnalysisJob[]>
findHistoryByMemorizationSessionId({ sessionId, provider? }): Promise<AnalysisJob[]>
```

`current` means `queued | processing | completed` for the same session/provider. `history` returns all attempts for the same session/provider ordered by `attempt_number desc` or `queued_at desc`.

## Server/Client Boundary

All mutation and claim/update operations are server-only.

- DB migration and RPC functions live in Supabase SQL migrations.
- Repository methods live in `entities/analysis-job/infrastructure`.
- Client UI should not call claim/complete/fail.
- Result UI should query current job state and render queued/processing/completed/failed based on domain state passed from server code.

RPC execute grants should match the boundary:

- `request_analysis_job`: `authenticated` and `service_role`
- `claim_next_analysis_job`: `service_role`
- `complete_analysis_job`: `service_role`
- `fail_analysis_job`: `service_role`

Direct authenticated table writes to `analysis_jobs` should be revoked. Authenticated clients may read their own rows, but lifecycle mutation must go through RPC/server paths.

## Out Of Scope

- STT/LLM processor implementation
- target result insertion transaction design
- result page UI
- retry button UI
- retry limit policy enforcement
- cancel user workflow
- log collection implementation for Sentry/Datadog/GlitchTip

## Open Risks

Retry count limits are easier after `attempt_number` exists, but this issue does not enforce a maximum. When a retry UI is introduced, enforce the limit in the request command or RPC function.

If future product requirements allow re-analysis after `completed`, the partial unique index must change. MVP treats completed analysis as final.
