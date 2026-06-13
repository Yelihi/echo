# DB Schema Control Process

## Decision

Echo uses Drizzle as the TypeScript source of truth for table-level database schema.
Supabase migration files remain the deployment unit.

This is a hybrid process:

- Drizzle controls table, column, enum, FK, check constraint, unique constraint, and index definitions.
- Supabase migrations apply database changes.
- Supabase-specific SQL such as RLS policies, triggers, extensions, and storage setup remains in migration SQL.
- Zod is not introduced for DDL control.

## Why Drizzle Only

Drizzle solves the current problem: TypeScript-based schema definition and SQL migration generation.

Zod solves a different problem: runtime input validation. It does not own table DDL.

For the current MVP, introducing both would create three schema surfaces:

- domain entity interfaces
- Drizzle table schema
- Zod runtime schema

The project will first stabilize the database control flow with Drizzle. Zod can be introduced later for form, API payload, or mapper validation if needed.

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

### Drizzle Schema

Location:

```text
src/shared/lib/db/schema.ts
drizzle.config.ts
```

Purpose:

- TypeScript source of truth for table-level DDL.
- Defines table names, columns, enums, FK, unique constraints, check constraints, and indexes.
- Used to generate or review SQL changes before writing final Supabase migration files.
- Does not own Supabase-managed tables such as `auth.users`.

### Supabase Migration

Location:

```text
supabase/migrations/*.sql
```

Purpose:

- Actual deployable database migration history.
- Includes generated/reviewed table DDL.
- Includes Supabase-specific SQL: RLS, policies, triggers, extensions, and storage setup.
- Owns references to Supabase-managed schemas such as `auth.users`.

### Generated Supabase Types

Location:

```text
src/shared/lib/supabase/database.types.ts
```

Purpose:

- TypeScript view of the applied Supabase database schema.
- Generated from the local or remote database after migration is applied.
- Used by Supabase clients and mapper tests.

## Change Flow

```text
Domain model change
  ↓
Update src/entities/{root-aggregate}
  ↓
Update src/shared/lib/db/schema.ts
  ↓
Generate or inspect Drizzle SQL
  ↓
Write final Supabase migration SQL
  ↓
Apply to local Supabase DB
  ↓
Regenerate Supabase database.types.ts
  ↓
Run mapper/type/test checks
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

### Check Drizzle Schema

```bash
npm run db:schema:check
```

### Generate Drizzle SQL Draft

```bash
npm run db:schema:generate
```

Generated Drizzle SQL is a draft. Review it before copying or adapting it into `supabase/migrations`.

The committed `drizzle/0000_baseline_core_domain.sql` is a Drizzle baseline snapshot for future diffs. It is not the production deployment unit. The deployable migration remains under `supabase/migrations`.

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

Each aggregate that reads from Supabase should eventually have:

```text
src/entities/{root-aggregate}/models/mapper.ts
src/entities/{root-aggregate}/models/__tests__/mapper.test.ts
```

Mapper tests should import row types from `src/shared/lib/supabase/database.types.ts`.

## PR Gate

Every DB shape PR should include:

- Domain entity change, if the domain model changed.
- Drizzle schema change.
- Supabase migration SQL.
- Regenerated `database.types.ts`.
- Mapper tests when a table maps to a domain entity.
- Verification command output.

Required checks:

```bash
npm run db:schema:check
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
