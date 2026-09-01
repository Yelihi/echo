import { describe, expect, it, jest } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";

// shared
import type { Database } from "@/shared/lib/supabase";

// entities
import type { MemorizationMaterial } from "@/entities/memorization-material";
import { MaterialState } from "@/entities/memorization-material/models/enums";
import { MemorizationSessionRepository } from "@/entities/memorization-session/infrastructure/MemorizationSessionRepository";
import type {
  MemorizationSessionParagraphRow,
  MemorizationSessionRow,
  MemorizationSessionSentenceRow,
  MemorizationSessionTagRow,
} from "@/entities/memorization-session/models/mapper";
import type { MaterialId, ParagraphId, SentenceId, UserId } from "@/entities/value-object";

describe("MemorizationSessionRepository", () => {
  it("should create a session snapshot with tags, paragraphs, and sentences", async () => {
    const session = createSessionRow();
    const tags = [createTagRow()];
    const paragraphs = [createParagraphRow()];
    const sentences = [createSentenceRow()];
    const sessionQuery = createMutationQuery(queryResult(session));
    const tagQuery = createMutationQuery(queryResult(tags));
    const paragraphQuery = createMutationQuery(queryResult(paragraphs));
    const sentenceQuery = createMutationQuery(queryResult(sentences));
    const { client, from, rpc } = createSupabaseStub(
      {
        memorization_sessions: [sessionQuery],
        memorization_session_tags: [tagQuery],
        memorization_session_paragraphs: [paragraphQuery],
        memorization_session_sentences: [sentenceQuery],
      },
      queryResult(session.id),
    );
    const repository = new MemorizationSessionRepository(client);
    const material = createMaterial();

    const result = await repository.createSession({ material });

    expect(result).toMatchObject({
      id: session.id,
      sourceMaterialId: material.id,
      materialTitleSnapshot: material.title,
      tagsSnapshot: [{ displayName: "Speech", normalizedName: "speech" }],
      paragraphSnapshots: [{ order: 0, sentences: [{ text: sentences[0].text_snapshot }] }],
      state: "ready",
    });
    expect(rpc).toHaveBeenCalledWith("create_memorization_session_snapshot", {
      p_material_id: material.id,
      p_material_title: material.title,
      p_tags: [{ display_name: "Speech", normalized_name: "speech" }],
      p_paragraphs: [
        {
          paragraph_order: 0,
          sentences: [
            {
              sentence_order: 0,
              text_snapshot: "English is a daily habit.",
              translation_snapshot: null,
            },
          ],
        },
      ],
    });
    expect(from).toHaveBeenNthCalledWith(1, "memorization_sessions");
    expect(from).toHaveBeenNthCalledWith(2, "memorization_session_tags");
    expect(from).toHaveBeenNthCalledWith(3, "memorization_session_paragraphs");
    expect(from).toHaveBeenNthCalledWith(4, "memorization_session_sentences");
    expect(sessionQuery.maybeSingle).toHaveBeenCalled();
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

type QueryStub = ReturnType<typeof createMutationQuery>;
type QueryInput = QueryStub | QueryResult<unknown>;

function queryResult<TData>(
  data: TData,
  error: QueryError | null = null,
  count: number | null = null,
): QueryResult<TData> {
  return { data, error, count };
}

function createMutationQuery(result: QueryResult<unknown>) {
  const query = {
    insert: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(async () => result),
    maybeSingle: jest.fn(async () => result),
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

function createSupabaseStub(
  tableQueries: Record<string, QueryInput[]>,
  rpcResult: QueryResult<unknown> = queryResult(null),
) {
  const queues = Object.fromEntries(
    Object.entries(tableQueries).map(([table, queries]) => [
      table,
      queries.map((query) => ("select" in query ? query : createMutationQuery(query))),
    ]),
  ) as Record<string, QueryStub[]>;
  const from = jest.fn((table: string) => {
    const query = queues[table]?.shift();

    if (!query) {
      throw new Error(`Missing Supabase query stub for table: ${table}`);
    }

    return query;
  });
  const rpc = jest.fn(async () => rpcResult);

  return {
    client: { from, rpc } as unknown as SupabaseClient<Database>,
    from,
    rpc,
  };
}

function createMaterial(): MemorizationMaterial {
  return {
    id: "99999999-9999-4999-8999-999999999999" as MaterialId,
    ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
    title: "Daily Speaking",
    tags: [{ displayName: "Speech", normalizedName: "speech" }],
    paragraphs: [
      {
        id: "33333333-3333-4333-8333-333333333333" as ParagraphId,
        order: 0,
        sentences: [
          {
            id: "44444444-4444-4444-8444-444444444444" as SentenceId,
            order: 0,
            text: "English is a daily habit.",
            translation: null,
          },
        ],
      },
    ],
    state: MaterialState.ACTIVE,
    deletedAt: null,
    createdAt: new Date("2026-06-13T00:00:00.000Z"),
    updatedAt: new Date("2026-06-13T00:10:00.000Z"),
  };
}

function createSessionRow(overrides: Partial<MemorizationSessionRow> = {}): MemorizationSessionRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    material_id: "99999999-9999-4999-8999-999999999999",
    material_title_snapshot: "Daily Speaking",
    current_paragraph_order: 0,
    current_sentence_order: 0,
    status: "ready",
    started_at: null,
    completed_at: null,
    deleted_at: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createTagRow(
  overrides: Partial<MemorizationSessionTagRow> = {},
): MemorizationSessionTagRow {
  return {
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    display_name: "Speech",
    normalized_name: "speech",
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createParagraphRow(
  overrides: Partial<MemorizationSessionParagraphRow> = {},
): MemorizationSessionParagraphRow {
  return {
    id: "55555555-5555-4555-8555-555555555555",
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    paragraph_order: 0,
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createSentenceRow(
  overrides: Partial<MemorizationSessionSentenceRow> = {},
): MemorizationSessionSentenceRow {
  return {
    id: "66666666-6666-4666-8666-666666666666",
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    paragraph_id: "55555555-5555-4555-8555-555555555555",
    sentence_order: 0,
    text_snapshot: "English is a daily habit.",
    translation_snapshot: null,
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}
