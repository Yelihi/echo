import { describe, expect, it, jest } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";

// shared
import type { Database } from "@/shared/lib/supabase";

// entities
import { RoleplayMaterialRepository } from "@/entities/roleplay-material/infrastructure/RoleplayMaterialRepository";
import { MaterialState } from "@/entities/roleplay-material/models/enums";
import type {
  RoleplayLineRow,
  RoleplayMaterialRow,
  RoleplayMaterialTagRow,
} from "@/entities/roleplay-material/models/mapper";
import type { MaterialId, UserId } from "@/entities/value-object";

describe("RoleplayMaterialRepository", () => {
  it("assembles a material with tags and lines", async () => {
    const material = createMaterialRow();
    const tags = [createTagRow()];
    const lines = [createLineRow()];
    const { client, from } = createSupabaseStub({
      roleplay_materials: [queryResult(material)],
      roleplay_material_tags: [queryResult(tags)],
      roleplay_lines: [queryResult(lines)],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.findById(material.id as MaterialId);

    expect(result).toMatchObject({
      id: material.id,
      tags: [{ displayName: "Airport", normalizedName: "airport" }],
      lines: [{ id: lines[0].id, text: lines[0].text }],
    });
    expect(from).toHaveBeenNthCalledWith(1, "roleplay_materials");
    expect(from).toHaveBeenNthCalledWith(2, "roleplay_material_tags");
    expect(from).toHaveBeenNthCalledWith(3, "roleplay_lines");
  });

  it("returns null without reading child tables when the material does not exist", async () => {
    const { client, from } = createSupabaseStub({
      roleplay_materials: [queryResult(null)],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.findById("11111111-1111-4111-8111-111111111111" as MaterialId);

    expect(result).toBeNull();
    expect(from).toHaveBeenCalledTimes(1);
  });

  it("applies state and limit when listing materials", async () => {
    const material = createMaterialRow();
    const materialQuery = createQuery(queryResult([material]));
    const { client } = createSupabaseStub({
      roleplay_materials: [materialQuery],
      roleplay_material_tags: [queryResult([createTagRow()])],
      roleplay_lines: [queryResult([createLineRow()])],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.findMany({
      state: MaterialState.ACTIVE,
      limit: 10,
    });

    expect(result).toHaveLength(1);
    expect(materialQuery.eq).toHaveBeenCalledWith("status", MaterialState.ACTIVE);
    expect(materialQuery.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(materialQuery.limit).toHaveBeenCalledWith(10);
  });

  it("counts active materials with an exact head query", async () => {
    const materialQuery = createQuery({ ...queryResult(null), count: 123 });
    const { client } = createSupabaseStub({
      roleplay_materials: [materialQuery],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.countActive();

    expect(result).toBe(123);
    expect(materialQuery.select).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(materialQuery.eq).toHaveBeenCalledWith("status", MaterialState.ACTIVE);
  });

  it("applies page range when listing materials with page and limit", async () => {
    const material = createMaterialRow();
    const materialQuery = createQuery(queryResult([material]));
    const { client } = createSupabaseStub({
      roleplay_materials: [materialQuery],
      roleplay_material_tags: [queryResult([createTagRow()])],
      roleplay_lines: [queryResult([createLineRow()])],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.findMany({
      page: 2,
      limit: 10,
    });

    expect(result).toHaveLength(1);
    expect(materialQuery.range).toHaveBeenCalledWith(10, 19);
    expect(materialQuery.limit).not.toHaveBeenCalled();
  });

  it("filters materials by any of the given tag normalized names", async () => {
    const material = createMaterialRow();
    const tagQuery = createQuery(queryResult([{ material_id: material.id }]));
    const materialQuery = createQuery(queryResult([material]));
    const { client } = createSupabaseStub({
      roleplay_material_tags: [tagQuery, queryResult([createTagRow()])],
      roleplay_materials: [materialQuery],
      roleplay_lines: [queryResult([createLineRow()])],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.findMany({
      tagNormalizedNames: ["airport", "travel"],
    });

    expect(result).toHaveLength(1);
    expect(tagQuery.in).toHaveBeenCalledWith("normalized_name", ["airport", "travel"]);
    expect(materialQuery.in).toHaveBeenCalledWith("id", [material.id]);
  });

  it("returns distinct tags from active materials", async () => {
    const material = createMaterialRow();
    const { client } = createSupabaseStub({
      roleplay_materials: [queryResult([{ id: material.id }])],
      roleplay_material_tags: [
        queryResult([
          createTagRow({ display_name: "Travel", normalized_name: "travel" }),
          createTagRow({ display_name: "Travel", normalized_name: "travel" }),
          createTagRow({ display_name: "Airport", normalized_name: "airport" }),
        ]),
      ],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.findDistinctTags();

    expect(result).toEqual([
      { displayName: "Airport", normalizedName: "airport" },
      { displayName: "Travel", normalizedName: "travel" },
    ]);
  });

  it("counts materials matching state and tags", async () => {
    const material = createMaterialRow();
    const tagQuery = createQuery(queryResult([{ material_id: material.id }]));
    const materialQuery = createQuery(queryResult(null, null, 12));
    const { client } = createSupabaseStub({
      roleplay_material_tags: [tagQuery],
      roleplay_materials: [materialQuery],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.count({
      state: MaterialState.ACTIVE,
      tagNormalizedNames: ["airport"],
    });

    expect(result).toBe(12);
    expect(tagQuery.in).toHaveBeenCalledWith("normalized_name", ["airport"]);
    expect(materialQuery.select).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(materialQuery.eq).toHaveBeenCalledWith("status", MaterialState.ACTIVE);
    expect(materialQuery.in).toHaveBeenCalledWith("id", [material.id]);
  });

  it("returns 0 without counting materials when no tags match", async () => {
    const { client, from } = createSupabaseStub({
      roleplay_material_tags: [queryResult([])],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.count({
      tagNormalizedNames: ["missing"],
    });

    expect(result).toBe(0);
    expect(from).toHaveBeenCalledTimes(1);
  });

  it("throws a repository error when Supabase returns an error", async () => {
    const { client } = createSupabaseStub({
      roleplay_materials: [
        queryResult(null, {
          message: "database unavailable",
        }),
      ],
    });
    const repository = new RoleplayMaterialRepository(client);

    await expect(
      repository.findById("11111111-1111-4111-8111-111111111111" as MaterialId),
    ).rejects.toThrow("Failed to fetch roleplay material: database unavailable");
  });

  it("creates a material with tags and lines", async () => {
    const material = createMaterialRow();
    const tags = [createTagRow()];
    const lines = [createLineRow()];
    const materialQuery = createMutationQuery(queryResult(material));
    const tagQuery = createMutationQuery(queryResult(tags));
    const lineQuery = createMutationQuery(queryResult(lines));
    const { client, from } = createSupabaseStub({
      roleplay_materials: [materialQuery],
      roleplay_material_tags: [tagQuery],
      roleplay_lines: [lineQuery],
    });
    const repository = new RoleplayMaterialRepository(client);

    const result = await repository.create({
      ownerId: material.user_id as UserId,
      title: material.title,
      situation: material.situation,
      speakerOneName: material.speaker_one_name,
      speakerTwoName: material.speaker_two_name,
      tags: [{ displayName: "Airport", normalizedName: "airport" }],
      lines: [{ order: 0, speakerOrder: 1, text: "How can I help you?" }],
    });

    expect(result).toMatchObject({
      id: material.id,
      title: material.title,
      tags: [{ displayName: "Airport", normalizedName: "airport" }],
      lines: [{ text: lines[0].text }],
    });
    expect(from).toHaveBeenNthCalledWith(1, "roleplay_materials");
    expect(from).toHaveBeenNthCalledWith(2, "roleplay_material_tags");
    expect(from).toHaveBeenNthCalledWith(3, "roleplay_lines");
    expect(materialQuery.insert).toHaveBeenCalledWith({
      user_id: material.user_id,
      title: material.title,
      situation: material.situation,
      speaker_one_name: material.speaker_one_name,
      speaker_two_name: material.speaker_two_name,
    });
    expect(tagQuery.insert).toHaveBeenCalledWith([
      {
        material_id: material.id,
        user_id: material.user_id,
        display_name: "Airport",
        normalized_name: "airport",
      },
    ]);
    expect(lineQuery.insert).toHaveBeenCalledWith([
      {
        material_id: material.id,
        user_id: material.user_id,
        line_order: 0,
        speaker_order: 1,
        text: "How can I help you?",
        translation: null,
      },
    ]);
  });
});

interface QueryError {
  readonly message: string;
}

interface QueryResult<TData> {
  readonly data: TData;
  readonly error: QueryError | null;
  readonly count: number | null;
}

type QueryStub = ReturnType<typeof createQuery> | ReturnType<typeof createMutationQuery>;
type QueryInput = QueryStub | QueryResult<unknown>;

function queryResult<TData>(
  data: TData,
  error: QueryError | null = null,
  count: number | null = null,
): QueryResult<TData> {
  return { data, error, count };
}

function createQuery(result: QueryResult<unknown>) {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    in: jest.fn(),
    limit: jest.fn(),
    range: jest.fn(),
    maybeSingle: jest.fn(async () => result),
    then: (
      onFulfilled: (value: QueryResult<unknown>) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.range.mockReturnValue(query);

  return query;
}

function createMutationQuery(result: QueryResult<unknown>) {
  const query = {
    insert: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(async () => result),
    then: (
      onFulfilled: (value: QueryResult<unknown>) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  query.insert.mockReturnValue(query);
  query.delete.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);

  return query;
}

function createSupabaseStub(tableQueries: Record<string, QueryInput[]>) {
  const queues = Object.fromEntries(
    Object.entries(tableQueries).map(([table, queries]) => [
      table,
      queries.map((query) => ("select" in query ? query : createQuery(query))),
    ]),
  ) as Record<string, QueryStub[]>;
  const from = jest.fn((table: string) => {
    const query = queues[table]?.shift();

    if (!query) {
      throw new Error(`Missing Supabase query stub for table: ${table}`);
    }

    return query;
  });

  return {
    client: { from } as unknown as SupabaseClient<Database>,
    from,
  };
}

function createMaterialRow(overrides: Partial<RoleplayMaterialRow> = {}): RoleplayMaterialRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Airport Check-in",
    situation: "Checking in at the airport counter.",
    speaker_one_name: "Staff",
    speaker_two_name: "Passenger",
    status: "active",
    deleted_at: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:10:00.000Z",
    ...overrides,
  };
}

function createTagRow(overrides: Partial<RoleplayMaterialTagRow> = {}): RoleplayMaterialTagRow {
  return {
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    display_name: "Airport",
    normalized_name: "airport",
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createLineRow(overrides: Partial<RoleplayLineRow> = {}): RoleplayLineRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    line_order: 0,
    speaker_order: 1,
    text: "How can I help you?",
    translation: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}
