# Roleplay Material Supabase Connection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the `roleplay-material` aggregate to Supabase through a typed repository port, mapper, and infrastructure implementation.

**Architecture:** The domain model remains in `models/entity.ts`. Supabase generated row types are converted by `models/mapper.ts`. Query logic lives in `infrastructure/RoleplayMaterialRepository.ts` and depends on a typed Supabase client injected by the caller.

**Tech Stack:** TypeScript, Jest, Supabase generated database types, `@supabase/supabase-js`.

---

### Task 1: Mapper Test And Mapper

**Files:**

- Create: `src/entities/roleplay-material/models/mapper.ts`
- Create: `src/entities/roleplay-material/models/__tests__/mapper.test.ts`

- [ ] **Step 1: Write mapper tests**

Create tests that build Supabase row objects for `roleplay_materials`, `roleplay_material_tags`, and `roleplay_lines`, then assert the mapped `RoleplayMaterial` domain object.

- [ ] **Step 2: Implement mapper**

Add `mapRoleplayMaterialRowToEntity(input)` that:

- Creates two fixed speaker ids from the material row.
- Converts row date strings to `Date`.
- Sorts tags by `normalized_name`.
- Sorts lines by `line_order`.
- Maps line `speaker_order` to the corresponding speaker id.
- Throws when line `speaker_order` is not `1` or `2`.

- [ ] **Step 3: Run mapper tests**

Run:

```bash
npm test -- --runInBand src/entities/roleplay-material/models/__tests__/mapper.test.ts
```

Expected: PASS.

### Task 2: Repository Port

**Files:**

- Create: `src/entities/roleplay-material/models/repository.ts`
- Modify: `src/entities/roleplay-material/index.ts`

- [ ] **Step 1: Define repository params and port**

Add:

- `FindRoleplayMaterialsParams`
- `RoleplayMaterialRepository`

Initial methods:

- `findById(id: MaterialId): Promise<RoleplayMaterial | null>`
- `findMany(params?: FindRoleplayMaterialsParams): Promise<RoleplayMaterial[]>`

- [ ] **Step 2: Export repository and mapper types/functions**

Update the slice public API from `index.ts`.

### Task 3: Infrastructure Repository

**Files:**

- Create: `src/entities/roleplay-material/infrastructure/RoleplayMaterialRepository.ts`

- [ ] **Step 1: Implement Supabase repository**

The implementation:

- Accepts `SupabaseClient<Database>` in the constructor.
- Reads `roleplay_materials`.
- Reads child `roleplay_material_tags`.
- Reads child `roleplay_lines`.
- Calls `mapRoleplayMaterialRowToEntity`.
- Returns domain entities only.

- [ ] **Step 2: Keep writes deferred**

Do not add create/update/delete methods until feature flows need concrete commands.

### Task 4: Verification

**Files:**

- No new files.

- [ ] **Step 1: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Run tests**

```bash
npm test -- --runInBand
```

Expected: PASS.
