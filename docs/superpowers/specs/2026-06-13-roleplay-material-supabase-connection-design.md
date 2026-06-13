# Roleplay Material Supabase Connection Design

## Goal

Implement the first vertical Supabase connection for the `roleplay-material` aggregate.

This work establishes the repeatable pattern for later aggregates:

- Repository port in the aggregate model layer.
- Supabase row to domain mapper in the aggregate model layer.
- Supabase repository implementation in the aggregate infrastructure layer.
- Mapper tests that prove the generated Supabase schema shape can be converted into the domain entity.

## Scope

Included:

- `src/entities/roleplay-material/models/repository.ts`
- `src/entities/roleplay-material/models/mapper.ts`
- `src/entities/roleplay-material/models/__tests__/mapper.test.ts`
- `src/entities/roleplay-material/infrastructure/RoleplayMaterialRepository.ts`
- Public exports from `src/entities/roleplay-material/index.ts`

Excluded:

- Remote Supabase `db push`.
- UI integration.
- Session creation.
- Audio storage.
- Analysis jobs.
- Repository implementations for other aggregates.

## Domain Mapping

`RoleplayMaterial` is assembled from three database tables:

- `roleplay_materials`
- `roleplay_material_tags`
- `roleplay_lines`

Speaker data is stored on `roleplay_materials` as `speaker_one_name` and `speaker_two_name`.
The mapper reconstructs two `RoleplaySpeaker` values from those columns.

Line `speaker_order` is converted to the matching speaker id:

- `1` maps to `speaker-one`
- `2` maps to `speaker-two`

Tags and lines are sorted in mapper output so callers receive stable domain objects:

- tags by `normalized_name`
- lines by `line_order`

## Repository Contract

The initial repository port stays intentionally small:

- `findById(id)`
- `findMany(params)`

The repository returns domain entities only. It does not expose Supabase row types or query builders to callers.

Create/update/delete commands are deferred until the feature layer needs concrete write flows.

## Infrastructure

The Supabase repository receives a typed `SupabaseClient<Database>` through its constructor.
This keeps client creation in `shared/lib/supabase` and keeps aggregate-specific query logic inside the aggregate infrastructure folder.

The repository performs separate typed queries for material, tags, and lines, then calls the mapper.
This avoids depending on nested PostgREST response inference for the first implementation.

## Errors

For the first implementation:

- Supabase query errors are thrown as `Error`.
- Not-found material lookup returns `null`.
- Mapper invariant failures throw `Error`.

More specific error classes can be added later when feature flows need user-facing recovery behavior.

## Verification

Required checks:

- Mapper unit tests.
- `npm run typecheck`
- `npm run lint`
- `npm test -- --runInBand`
