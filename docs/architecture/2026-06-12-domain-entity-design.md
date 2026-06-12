# Echo Domain Entity Design

## Status

This document defines the agreed domain entity model before database table design.
It is not a database schema. Table structure, constraints, RLS, and indexes must be derived from this model after review.

## Practice Types

```text
Practice Type =
  Roleplay Practice
  OR Memorization Practice
```

MVP supports exactly two practice types: roleplay and memorization.

## User

```text
Authenticated User =
  Supabase Auth user

Echo User Profile =
  Authenticated User와 1:1로 연결되는 Echo 내부 사용자 엔티티
  AND optional display name
  AND created at
  AND updated at
```

Rules:

- `display name` is optional.
- If `display name` is empty, the app may show a generated fallback/random name.
- The fallback name is display-only and is not stored as the profile value until the user saves it.
- Future user settings should extend `Echo User Profile`.

## Material

```text
Material =
  반복 사용 가능한 연습 템플릿

Material State =
  Active
  OR Deleted
```

Rules:

- Active material appears in material lists and can create new sessions.
- Deleted material is hidden from material lists and cannot create new sessions.
- Deleting material does not delete existing sessions or session snapshots.

## Tags

```text
Tag Value =
  display name
  AND normalized name

Material Tags =
  unordered set of Tag Value

Session Snapshot Tags =
  Material Tags copied at session start
```

Rules:

- Tags are user-managed labels for organizing materials and filtering material/session lists.
- Tags are unordered; no tag order exists in the domain.
- Tag names cannot be empty.
- Leading and trailing whitespace is removed.
- Duplicate detection uses `normalized name`.
- Tag comparison and filtering are case-insensitive.
- UI display uses `display name`.
- Session snapshot tags preserve the material tags as they were when the session started.

## Roleplay Material

```text
Roleplay Material =
  owner
  AND title
  AND situation/context
  AND tags
  AND exactly 2 Roleplay Speakers
  AND list of Roleplay Lines
  AND Material State
```

```text
Roleplay Speaker =
  display name

Roleplay Line =
  line order
  AND speaker
  AND text
  AND optional translation
```

Rules:

- A roleplay material has exactly two speakers.
- Every roleplay line references one of the two speakers.
- `text` is required.
- `translation` is optional.
- Difficulty is excluded from MVP because it is not an intrinsic material property.

## Memorization Material

```text
Memorization Material =
  owner
  AND title
  AND tags
  AND list of Memorization Paragraphs
  AND Material State
```

```text
Memorization Paragraph =
  paragraph order
  AND list of Memorization Sentences

Memorization Sentence =
  sentence order
  AND text
  AND optional translation
```

Rules:

- A memorization material has at least one paragraph.
- Each paragraph has at least one sentence.
- Each sentence requires `text`.
- `translation` is optional.
- MVP memorization sessions use the whole material in paragraph order and sentence order.
- Later versions may support partial sessions by paragraph or sentence range.

## Session

```text
Session =
  Material 기반 실행 기록
  AND session 시작 시점 snapshot
  AND progress

Session State =
  Ready
  OR InProgress
  OR Completed
  OR Deleted
```

Rules:

- A session is separate from its source material.
- A session runs from its session snapshot, not from the current material.
- Material edits or deletion do not mutate existing session snapshots.
- Browser exit does not create an `Abandoned` state in MVP; unfinished sessions remain `InProgress`.
- A deleted session removes or cleans up its snapshot, draft recordings, accepted recordings, analysis jobs, target results, and session summary.

## Roleplay Session

```text
Roleplay Session =
  Roleplay Material에서 생성된 session
  AND selected learner speaker
  AND Roleplay Session Snapshot
  AND Session State
```

```text
Roleplay Session Snapshot =
  material title snapshot
  AND situation/context snapshot
  AND tags snapshot
  AND exactly 2 speaker snapshots
  AND list of line snapshots
```

Rules:

- One roleplay session has exactly one selected learner speaker.
- To practice the other speaker, the user creates a different session.
- If a line speaker is the selected learner speaker, the user records that line.
- If a line speaker is not the selected learner speaker, AI or the app presents that counterpart line.

## Memorization Session

```text
Memorization Session =
  Memorization Material에서 생성된 session
  AND Memorization Session Snapshot
  AND Session State
```

```text
Memorization Session Snapshot =
  material title snapshot
  AND tags snapshot
  AND list of paragraph snapshots
  AND list of sentence snapshots
```

Rules:

- Memorization session flow enters by paragraph.
- Recording and target-level analysis are sentence-snapshot based.
- MVP sessions cover all paragraphs and sentences in order.

## Session Snapshot Lifecycle

```text
Session Snapshot =
  session 시작 시점의 material content 복사본
```

Rules:

- A session snapshot is created with its session.
- A session snapshot is retained while its session exists.
- A session snapshot is deleted with its session.
- Material deletion does not delete session snapshots.
- Snapshot storage grows with retained sessions, but text snapshots are small compared with audio recording storage.

## Practice Target

```text
Practice Target =
  Roleplay Line Snapshot
  OR Memorization Sentence Snapshot
```

Rules:

- Recordings and target-level analysis results attach to a practice target.
- A practice target belongs to a session snapshot, not to the current material.

## Recording

```text
Recording Audio =
  storage bucket
  AND object path
  AND mime type
  AND size
  AND duration
```

```text
Draft Recording =
  session
  AND practice target
  AND recording audio

Accepted Recording =
  session
  AND practice target
  AND recording audio
```

Rules:

- `Recording Audio` is a value object owned by a recording, not an independent entity in MVP.
- `Draft Recording` is persisted in the database.
- `Draft Recording` is not a session result and is not analyzed.
- A practice target has zero or one draft recording.
- A practice target has zero or one accepted recording.
- Creating a new draft discards the previous draft and schedules its audio cleanup.
- Accepting a draft creates or replaces the accepted recording.
- Replaced accepted recordings are not preserved.
- If the user exits before accepting a draft, the draft is not restored and is a cleanup target.
- If future no-script conversation or independent audio processing appears, `Recording Audio` may be promoted to an `Audio File` entity.

## Analysis

```text
Analysis Job =
  completed session에 대해 생성되는 batch 분석 요청

Practice Target Analysis Result =
  하나의 practice target에 대한 분석 결과

Session Analysis Summary =
  세션 전체에 대한 요약 분석 결과
```

Rules:

- MVP does not analyze while the session is in progress.
- Completing a session queues a batch analysis job.
- Analysis uses accepted recordings only.
- Results include target-level results and a session-level summary.
- Later real-time feedback can be added by analyzing accepted recordings earlier without changing the target model.

## Cleanup

```text
Cleanup Failure Log =
  storage cleanup 실패 기록
```

Rules:

- Cleanup failure logs are supporting operational records, not learning results.
- A draft recording cleanup failure creates a cleanup failure log.
- An accepted recording replacement or deletion failure creates a cleanup failure log.
- A session deletion cleanup failure creates a cleanup failure log.
- Cleanup failure logs are the base for later Datadog, Sentry, metric, or retry integration.

## Derived Design Direction

The agreed model is a domain-explicit design:

- Material and Session are separate entities.
- Session snapshot targets are explicit.
- Draft and Accepted recordings are separate entities.
- Audio metadata remains a recording-owned value object in MVP.
- Analysis is session-completion batch based, with target-level and session-level results.

Alternatives rejected:

- A DB-simple model with broad JSON snapshots only, because recordings and analysis need stable target references.
- A material-versioning model, because version management is too heavy for MVP.
