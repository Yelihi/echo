import { describe, expect, it, jest } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";

import { DraftRecordingRepository } from "@/entities/draft-recording/infrastructure/DraftRecordingRepository";
import type { DraftRecordingRow } from "@/entities/draft-recording/models/mapper";
import type { LineId, RecordingId, SentenceId, SessionId, UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

describe("DraftRecordingRepository", () => {
  it("creates a roleplay draft recording row", async () => {
    const row = createDraftRecordingRow();
    const query = createMutationQuery(queryResult(row));
    const { client } = createSupabaseStub({
      tables: {
        draft_recordings: [query],
      },
    });
    const repository = new DraftRecordingRepository(client);

    const recording = await repository.create({
      id: row.id as RecordingId,
      ownerId: row.user_id as UserId,
      practiceType: "roleplay",
      roleplaySessionId: row.roleplay_session_id as SessionId,
      roleplayLineId: row.roleplay_line_id as LineId,
      bucketId: row.bucket_id,
      objectPath: row.object_path,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      durationMs: row.duration_ms,
    });

    expect(recording).toMatchObject({
      id: row.id,
      ownerId: row.user_id,
      audio: {
        bucketId: row.bucket_id,
        objectPath: row.object_path,
        mimeType: row.mime_type,
        sizeBytes: row.size_bytes,
        durationMs: row.duration_ms,
      },
    });
    expect(query.insert).toHaveBeenCalledWith({
      id: row.id,
      user_id: row.user_id,
      roleplay_session_id: row.roleplay_session_id,
      roleplay_line_id: row.roleplay_line_id,
      memorization_session_id: null,
      memorization_sentence_id: null,
      bucket_id: row.bucket_id,
      object_path: row.object_path,
      mime_type: row.mime_type,
      size_bytes: row.size_bytes,
      duration_ms: row.duration_ms,
    });
    expect(query.select).toHaveBeenCalledWith("*");
    expect(query.single).toHaveBeenCalledTimes(1);
  });

  it("creates a memorization draft recording row", async () => {
    const row = createDraftRecordingRow({
      roleplay_session_id: null,
      roleplay_line_id: null,
      memorization_session_id: "33333333-3333-4333-8333-333333333333",
      memorization_sentence_id: "44444444-4444-4444-8444-444444444444",
      object_path: "users/user-a/memorization.wav",
      duration_ms: null,
    });
    const query = createMutationQuery(queryResult(row));
    const { client } = createSupabaseStub({
      tables: {
        draft_recordings: [query],
      },
    });
    const repository = new DraftRecordingRepository(client);

    const recording = await repository.create({
      id: row.id as RecordingId,
      ownerId: row.user_id as UserId,
      practiceType: "memorization",
      memorizationSessionId: row.memorization_session_id as SessionId,
      memorizationSentenceId: row.memorization_sentence_id as SentenceId,
      bucketId: row.bucket_id,
      objectPath: row.object_path,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      durationMs: row.duration_ms,
    });

    expect(recording.id).toBe(row.id);
    expect(query.insert).toHaveBeenCalledWith({
      id: row.id,
      user_id: row.user_id,
      roleplay_session_id: null,
      roleplay_line_id: null,
      memorization_session_id: row.memorization_session_id,
      memorization_sentence_id: row.memorization_sentence_id,
      bucket_id: row.bucket_id,
      object_path: row.object_path,
      mime_type: row.mime_type,
      size_bytes: row.size_bytes,
      duration_ms: row.duration_ms,
    });
    expect(query.select).toHaveBeenCalledWith("*");
    expect(query.single).toHaveBeenCalledTimes(1);
  });

  it("deletes by id", async () => {
    const query = createMutationQuery(queryResult(null));
    const { client } = createSupabaseStub({
      tables: {
        draft_recordings: [query],
      },
    });
    const repository = new DraftRecordingRepository(client);
    const id = "11111111-1111-4111-8111-111111111111" as RecordingId;

    await repository.deleteById(id);

    expect(query.delete).toHaveBeenCalledTimes(1);
    expect(query.eq).toHaveBeenCalledWith("id", id);
  });
});

interface QueryError {
  readonly message: string;
}

interface QueryResult<TData> {
  readonly data: TData;
  readonly error: QueryError | null;
}

type QueryStub = ReturnType<typeof createMutationQuery>;

function queryResult<TData>(data: TData, error: QueryError | null = null): QueryResult<TData> {
  return { data, error };
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

function createSupabaseStub({ tables = {} }: { readonly tables?: Record<string, QueryStub[]> }) {
  const queues = Object.fromEntries(
    Object.entries(tables).map(([table, queries]) => [table, [...queries]]),
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

function createDraftRecordingRow(overrides: Partial<DraftRecordingRow> = {}): DraftRecordingRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    roleplay_session_id: "22222222-2222-4222-8222-222222222222",
    roleplay_line_id: "55555555-5555-4555-8555-555555555555",
    memorization_session_id: null,
    memorization_sentence_id: null,
    bucket_id: "recordings",
    object_path: "users/user-a/roleplay.wav",
    mime_type: "audio/wav",
    size_bytes: 1024,
    duration_ms: 3000,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:10:00.000Z",
    ...overrides,
  };
}
