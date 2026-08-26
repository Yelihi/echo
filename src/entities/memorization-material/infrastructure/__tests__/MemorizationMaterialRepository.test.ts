import { describe, expect, it, jest } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";

// shared
import type { Database } from "@/shared/lib/supabase";

// entities
import { MemorizationMaterialRepository } from "@/entities/memorization-material/infrastructure/MemorizationMaterialRepository";
import { MaterialState } from "@/entities/memorization-material/models/enums";
import type {
  MemorizationMaterialParagraphRow,
  MemorizationMaterialRow,
  MemorizationMaterialSentenceRow,
  MemorizationMaterialTagRow,
} from "@/entities/memorization-material/models/mapper";
import type { MaterialId } from "@/entities/value-object";

describe("MemorizationMaterialRepository", () => {
  it("assembles a material with tags, paragraphs, and sentences", async () => {
    const material = createMaterialRow();
    const tags = [createTagRow()];
    const paragraphs = [createParagraphRow()];
    const sentences = [createSentenceRow()];
    const { client, from } = createSupabaseStub({
      memorization_materials: [queryResult(material)],
      memorization_material_tags: [queryResult(tags)],
      memorization_material_paragraphs: [queryResult(paragraphs)],
      memorization_material_sentences: [queryResult(sentences)],
    });
    const repository = new MemorizationMaterialRepository(client);

    const result = await repository.findById(material.id as MaterialId);

    expect(result).toMatchObject({
      id: material.id,
      tags: [{ displayName: "Speech", normalizedName: "speech" }],
      paragraphs: [{ id: paragraphs[0].id, sentences: [{ text: sentences[0].text }] }],
    });
    expect(from).toHaveBeenNthCalledWith(1, "memorization_materials");
    expect(from).toHaveBeenNthCalledWith(2, "memorization_material_tags");
    expect(from).toHaveBeenNthCalledWith(3, "memorization_material_paragraphs");
    expect(from).toHaveBeenNthCalledWith(4, "memorization_material_sentences");
  });

  it("returns null without reading child tables when the material does not exist", async () => {
    const { client, from } = createSupabaseStub({
      memorization_materials: [queryResult(null)],
    });
    const repository = new MemorizationMaterialRepository(client);

    const result = await repository.findById("11111111-1111-4111-8111-111111111111" as MaterialId);

    expect(result).toBeNull();
    expect(from).toHaveBeenCalledTimes(1);
  });

  it("applies state and limit when listing materials", async () => {
    const material = createMaterialRow();
    const materialQuery = createQuery(queryResult([material]));
    const { client } = createSupabaseStub({
      memorization_materials: [materialQuery],
      memorization_material_tags: [queryResult([createTagRow()])],
      memorization_material_paragraphs: [queryResult([createParagraphRow()])],
      memorization_material_sentences: [queryResult([createSentenceRow()])],
    });
    const repository = new MemorizationMaterialRepository(client);

    const result = await repository.findMany({
      state: MaterialState.ACTIVE,
      limit: 10,
    });

    expect(result).toHaveLength(1);
    expect(materialQuery.eq).toHaveBeenCalledWith("status", MaterialState.ACTIVE);
    expect(materialQuery.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(materialQuery.order).toHaveBeenCalledWith("id", { ascending: false });
    expect(materialQuery.limit).toHaveBeenCalledWith(10);
  });

  it("counts active materials with an exact head query", async () => {
    const materialQuery = createQuery({ ...queryResult(null), count: 123 });
    const { client } = createSupabaseStub({
      memorization_materials: [materialQuery],
    });
    const repository = new MemorizationMaterialRepository(client);

    const result = await repository.countActive();

    expect(result).toBe(123);
    expect(materialQuery.select).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(materialQuery.eq).toHaveBeenCalledWith("status", MaterialState.ACTIVE);
  });

  it("applies page range when listing materials with page and limit", async () => {
    const material = createMaterialRow();
    const materialQuery = createQuery(queryResult([material]));
    const { client } = createSupabaseStub({
      memorization_materials: [materialQuery],
      memorization_material_tags: [queryResult([createTagRow()])],
      memorization_material_paragraphs: [queryResult([createParagraphRow()])],
      memorization_material_sentences: [queryResult([createSentenceRow()])],
    });
    const repository = new MemorizationMaterialRepository(client);

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
      memorization_material_tags: [tagQuery, queryResult([createTagRow()])],
      memorization_materials: [materialQuery],
      memorization_material_paragraphs: [queryResult([createParagraphRow()])],
      memorization_material_sentences: [queryResult([createSentenceRow()])],
    });
    const repository = new MemorizationMaterialRepository(client);

    const result = await repository.findMany({
      tagNormalizedNames: ["speech", "daily"],
    });

    expect(result).toHaveLength(1);
    expect(tagQuery.in).toHaveBeenCalledWith("normalized_name", ["speech", "daily"]);
    expect(materialQuery.in).toHaveBeenCalledWith("id", [material.id]);
  });

  it("returns distinct tags from active materials", async () => {
    const material = createMaterialRow();
    const { client } = createSupabaseStub({
      memorization_materials: [queryResult([{ id: material.id }])],
      memorization_material_tags: [
        queryResult([
          createTagRow({ display_name: "Travel", normalized_name: "travel" }),
          createTagRow({ display_name: "Travel", normalized_name: "travel" }),
          createTagRow({ display_name: "Airport", normalized_name: "airport" }),
        ]),
      ],
    });
    const repository = new MemorizationMaterialRepository(client);

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
      memorization_material_tags: [tagQuery],
      memorization_materials: [materialQuery],
    });
    const repository = new MemorizationMaterialRepository(client);

    const result = await repository.count({
      state: MaterialState.ACTIVE,
      tagNormalizedNames: ["speech"],
    });

    expect(result).toBe(12);
    expect(tagQuery.in).toHaveBeenCalledWith("normalized_name", ["speech"]);
    expect(materialQuery.select).toHaveBeenCalledWith("id", { count: "exact", head: true });
    expect(materialQuery.eq).toHaveBeenCalledWith("status", MaterialState.ACTIVE);
    expect(materialQuery.in).toHaveBeenCalledWith("id", [material.id]);
  });

  it("returns 0 without counting materials when no tags match", async () => {
    const { client, from } = createSupabaseStub({
      memorization_material_tags: [queryResult([])],
    });
    const repository = new MemorizationMaterialRepository(client);

    const result = await repository.count({
      tagNormalizedNames: ["missing"],
    });

    expect(result).toBe(0);
    expect(from).toHaveBeenCalledTimes(1);
  });

  it("throws a repository error when Supabase returns an error", async () => {
    const { client } = createSupabaseStub({
      memorization_materials: [
        queryResult(null, {
          message: "database unavailable",
        }),
      ],
    });
    const repository = new MemorizationMaterialRepository(client);

    await expect(
      repository.findById("11111111-1111-4111-8111-111111111111" as MaterialId),
    ).rejects.toThrow("Failed to fetch memorization material: database unavailable");
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

type QueryStub = ReturnType<typeof createQuery>;
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

function createMaterialRow(
  overrides: Partial<MemorizationMaterialRow> = {},
): MemorizationMaterialRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Daily Speaking",
    status: "active",
    deleted_at: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:10:00.000Z",
    ...overrides,
  };
}

function createTagRow(
  overrides: Partial<MemorizationMaterialTagRow> = {},
): MemorizationMaterialTagRow {
  return {
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    display_name: "Speech",
    normalized_name: "speech",
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createParagraphRow(
  overrides: Partial<MemorizationMaterialParagraphRow> = {},
): MemorizationMaterialParagraphRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    paragraph_order: 0,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createSentenceRow(
  overrides: Partial<MemorizationMaterialSentenceRow> = {},
): MemorizationMaterialSentenceRow {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    paragraph_id: "22222222-2222-4222-8222-222222222222",
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    sentence_order: 0,
    text: "English is a daily habit.",
    translation: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}
