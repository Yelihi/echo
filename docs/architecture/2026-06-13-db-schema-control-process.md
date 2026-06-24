# DB Schema Control Process

## Decision

Echo manages database schema changes directly with Supabase SQL migrations.

Drizzle is not used in the current MVP stage. The priority is to understand and control SQL, Supabase migrations, RLS policies, auth references, storage cleanup, triggers, and generated Supabase types directly.

## Why No Drizzle For Now

Supabase projects inevitably require SQL that is not just table DDL:

- RLS policies
- auth schema references
- storage setup
- triggers
- functions
- extensions
- operational cleanup tables and policies

Drizzle can help generate table-level SQL, but it does not remove the need to understand and review Supabase-specific SQL. Introducing Drizzle now would add another control surface:

```text
Domain Entity
Drizzle Schema
Supabase Migration SQL
Generated Supabase Types
Mapper
```

For the current project stage, this is more process overhead than benefit. Drizzle can be reconsidered later if SQL migration repetition becomes a real maintenance cost.

## Schema Surfaces

### Domain Entity

Location:

```text
src/entities/{root-aggregate}/
src/entities/value-object/
```

Purpose:

- Business meaning.
- Root aggregate import boundary.
- UI/API/DB independent domain shape.

Domain entity interfaces do not generate database DDL directly.

### Repository Port

Location:

```text
src/entities/{root-aggregate}/models/repository.ts
```

Purpose:

- Defines what the domain/application layer needs from persistence.
- Does not import Supabase client.
- Does not expose raw Supabase row types to callers.

### Mapper

Location:

```text
src/entities/{root-aggregate}/models/mapper.ts
src/entities/{root-aggregate}/models/__tests__/mapper.test.ts
```

Purpose:

- Converts Supabase generated row types to domain entities.
- Converts domain command data to insert/update shapes when needed.
- Catches mismatch between SQL tables and TypeScript entities.

### Infrastructure Repository

Location:

```text
src/entities/{root-aggregate}/infrastructure/{Aggregate}Repository.ts
```

Purpose:

- Implements the repository port.
- Uses Supabase client and generated database types.
- Calls mapper before returning domain entities.
- Owns aggregate-specific persistence details.

### Supabase Client Setup

Location:

```text
src/shared/lib/supabase/client.ts
src/shared/lib/supabase/server.ts
src/shared/lib/supabase/service-role.ts
src/shared/lib/supabase/database.types.ts
```

Purpose:

- Creates Supabase clients.
- Owns environment variable wiring.
- Provides generated DB types.
- Does not own aggregate-specific persistence behavior.

### Supabase Migration

Location:

```text
supabase/migrations/*.sql
```

Purpose:

- Actual deployable database migration history.
- Owns table DDL, enum DDL, FK, constraints, indexes, triggers, functions, RLS policies, and Supabase-specific SQL.
- Is global because migration order is global and one migration can affect multiple aggregates.

Do not place migration SQL inside `src/entities/*`. Even when a migration is closely related to one aggregate, it is still deployment history, not domain code.

### Generated Supabase Types

Location:

```text
src/shared/lib/supabase/database.types.ts
```

Purpose:

- TypeScript view of the applied Supabase database schema.
- Generated from the local or remote database after migration is applied.
- Used by Supabase clients, infrastructure repositories, and mapper tests.

## Change Flow

```text
Domain model change
  ↓
Update src/entities/{root-aggregate}/models/entity.ts
  ↓
Update or add repository port
  ↓
Create Supabase migration file
  ↓
Write SQL migration directly
  ↓
Apply to local Supabase DB
  ↓
Regenerate Supabase database.types.ts
  ↓
Update mapper and mapper tests
  ↓
Run type/lint/test checks
  ↓
Open PR
  ↓
Manual production db push
```

## Commands

### Create a Supabase Migration File

Use Supabase CLI to create timestamped migration files.

```bash
npm run supabase -- migration new add_example_table
```

Do not create migration filenames manually.

### Apply and Verify Locally

```bash
npm run supabase -- db reset
npm run supabase -- db lint --local
./node_modules/.bin/supabase gen types typescript --local > src/shared/lib/supabase/database.types.ts
npm run typecheck
npm run lint
npm test -- --runInBand
```

`db reset` is local-only. Do not use it against production.

## Entity and DB Consistency Check

Domain entity and DB row types are intentionally separate.

Consistency is checked through mapper tests:

```text
Supabase Row type
  ↓ mapper
Domain Entity type
```

Each aggregate that reads from Supabase should have:

```text
src/entities/{root-aggregate}/models/mapper.ts
src/entities/{root-aggregate}/models/__tests__/mapper.test.ts
```

Mapper tests should import row types from `src/shared/lib/supabase/database.types.ts`.

Aggregates with multi-table assembly, filters, ordering, or other non-trivial query behavior should also have:

```text
src/entities/{root-aggregate}/infrastructure/__tests__/{Aggregate}Repository.test.ts
```

Repository tests should verify the relevant table names, query filters, child-row assembly, not-found behavior, and Supabase error propagation.

## Folder Rule

Recommended aggregate structure:

```text
src/entities/{root-aggregate}/
  index.ts
  models/
    entity.ts
    enums.ts
    repository.ts
    mapper.ts
    __tests__/
      mapper.test.ts
    behaviors/
      {Aggregate}Behavior.ts
  infrastructure/
    {Aggregate}Repository.ts
    __tests__/                       # when query behavior is non-trivial
      {Aggregate}Repository.test.ts
```

Keep these boundaries:

- `models/entity.ts` is pure domain shape.
- `models/repository.ts` defines the `{Aggregate}RepositoryPort`.
- `models/mapper.ts` maps database types and domain types.
- `infrastructure/*Repository.ts` talks to Supabase.
- `shared/lib/supabase/*` creates clients and exposes generated DB types.
- `supabase/migrations/*` owns deployable SQL history.

## PR Gate

Every DB shape PR should include:

- Domain entity change, if the domain model changed.
- Supabase migration SQL.
- Regenerated `database.types.ts`.
- Repository port changes, if persistence behavior changed.
- Infrastructure repository changes, if a table is read or written.
- Mapper tests when a table maps to a domain entity.
- Infrastructure repository tests when query behavior or aggregate assembly changes.
- Verification command output.

Required checks:

```bash
npm run supabase -- db reset
npm run supabase -- db lint --local
npm run typecheck
npm run lint
npm test -- --runInBand
```

## Production Control

There is no staging environment yet.

Until staging exists:

- Do not auto-apply production DB migrations from CI.
- Merge only after local Supabase verification passes.
- Apply production DB changes manually with Supabase CLI.
- Confirm backup or rollback plan before applying.
- Run a smoke test after applying.

Production apply command:

```bash
npm run supabase -- db push
```

When a staging Supabase project exists, the process should become:

```text
PR local verification
  ↓
merge to main
  ↓
auto db push to staging
  ↓
staging smoke test
  ↓
manual approval
  ↓
db push to production
```

## When To Reconsider Drizzle

Reconsider Drizzle only when one of these becomes a real cost:

- SQL table DDL is repetitive enough to slow development.
- Multiple developers frequently edit table schema concurrently.
- Manual SQL review repeatedly misses column/type/index drift.
- The team wants a TypeScript schema DSL as a primary DB design tool.

Until then, SQL-first Supabase migrations are the control system.
