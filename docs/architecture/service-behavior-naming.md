# Service / Behavior Naming

## Purpose

Keep domain behavior, application service, and view conversion names distinct so code placement stays predictable across FSD layers.

## Rules

- `entities/*/models/behaviors/*Behavior.ts`: entity or value-object based domain rules, state transitions, and invariant checks.
- `entities/*/services/*Assembler.ts`: read DTO or projection assembly from entities, DTO fragments, or query results.
- `entities/*/models/dtos.ts`: DTO types only.
- `features/*/services/query`: TanStack Query hooks.
- `features/*/services/server`: server-side use cases, provider calls, or request workflows.
- `views/*/models/converters`: DTO to ViewModel or UI props conversion.
- `views/*/services`: route-specific orchestration only. Move it to `features` when it becomes reusable.

## Current Decision

`AnalysisResultDtoAssembler` lives in `entities/analysis-job/services` because it combines job state, expected targets, and normalized target results into a read DTO. It does not mutate an analysis job entity or enforce an aggregate invariant, so it is not a behavior.

Skipped `services/projections/` for now because there is only one assembler. Add that folder when multiple analysis-job read projections need grouping.
