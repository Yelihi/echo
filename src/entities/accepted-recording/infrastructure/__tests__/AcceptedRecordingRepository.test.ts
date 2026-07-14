import { describe, expect, it, jest } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";

import { AcceptedRecordingRepository } from "@/entities/accepted-recording/infrastructure/AcceptedRecordingRepository";
import type { AcceptedRecordingRow } from "@/entities/accepted-recording/models/mapper";
import type { LineId, SentenceId, SessionId, UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

describe("AcceptedRecordingRepository", () => {
  it("updates an existing roleplay accepted recording from draft metadata", async () => {
    const row = createAcceptedRecordingRow();
    const existingRow = createAcceptedRecordingRow({
      bucket_id: "old-recordings",
      object_path: "users/user-a/old-roleplay.wav",
      size_bytes: 512,
      duration_ms: 1000,
    });
    const findQuery = createQuery(queryResult(existingRow));
    const updateQuery = createQuery(queryResult(row));
    const { client } = createSupabaseStub({
      tables: {
        accepted_recordings: [findQuery, updateQuery],
      },
    });
    const repository = new AcceptedRecordingRepository(client);

    const recording = await repository.upsertFromDraft({
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
    expect(findQuery.select).toHaveBeenCalledWith("*");
    expect(findQuery.eq).toHaveBeenCalledWith("roleplay_session_id", row.roleplay_session_id);
    expect(findQuery.eq).toHaveBeenCalledWith("roleplay_line_id", row.roleplay_line_id);
    expect(findQuery.maybeSingle).toHaveBeenCalledTimes(1);
    expect(updateQuery.update).toHaveBeenCalledWith({
      bucket_id: row.bucket_id,
      object_path: row.object_path,
      mime_type: row.mime_type,
      size_bytes: row.size_bytes,
      duration_ms: row.duration_ms,
    });
    expect(updateQuery.eq).toHaveBeenCalledWith("id", existingRow.id);
    expect(updateQuery.select).toHaveBeenCalledWith("*");
    expect(updateQuery.single).toHaveBeenCalledTimes(1);
    expect(updateQuery.insert).not.toHaveBeenCalled();
  });

  it("inserts a missing roleplay accepted recording from draft metadata", async () => {
    const row = createAcceptedRecordingRow();
    const findQuery = createQuery(queryResult(null));
    const insertQuery = createQuery(queryResult(row));
    const { client } = createSupabaseStub({
      tables: {
        accepted_recordings: [findQuery, insertQuery],
      },
    });
    const repository = new AcceptedRecordingRepository(client);

    const recording = await repository.upsertFromDraft({
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

    expect(recording.id).toBe(row.id);
    expect(findQuery.select).toHaveBeenCalledWith("*");
    expect(findQuery.eq).toHaveBeenCalledWith("roleplay_session_id", row.roleplay_session_id);
    expect(findQuery.eq).toHaveBeenCalledWith("roleplay_line_id", row.roleplay_line_id);
    expect(insertQuery.insert).toHaveBeenCalledWith({
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
    expect(insertQuery.select).toHaveBeenCalledWith("*");
    expect(insertQuery.single).toHaveBeenCalledTimes(1);
    expect(insertQuery.update).not.toHaveBeenCalled();
  });

  it("inserts a missing memorization accepted recording from draft metadata", async () => {
    const row = createAcceptedRecordingRow({
      roleplay_session_id: null,
      roleplay_line_id: null,
      memorization_session_id: "33333333-3333-4333-8333-333333333333",
      memorization_sentence_id: "44444444-4444-4444-8444-444444444444",
      object_path: "users/user-a/accepted-memorization.wav",
      duration_ms: null,
    });
    const findQuery = createQuery(queryResult(null));
    const insertQuery = createQuery(queryResult(row));
    const { client } = createSupabaseStub({
      tables: {
        accepted_recordings: [findQuery, insertQuery],
      },
    });
    const repository = new AcceptedRecordingRepository(client);

    const recording = await repository.upsertFromDraft({
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
    expect(findQuery.select).toHaveBeenCalledWith("*");
    expect(findQuery.eq).toHaveBeenCalledWith(
      "memorization_session_id",
      row.memorization_session_id,
    );
    expect(findQuery.eq).toHaveBeenCalledWith(
      "memorization_sentence_id",
      row.memorization_sentence_id,
    );
    expect(insertQuery.insert).toHaveBeenCalledWith({
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
    expect(insertQuery.select).toHaveBeenCalledWith("*");
    expect(insertQuery.single).toHaveBeenCalledTimes(1);
  });

  it("finds by storage object", async () => {
    const row = createAcceptedRecordingRow();
    const query = createQuery(queryResult(row));
    const { client } = createSupabaseStub({
      tables: {
        accepted_recordings: [query],
      },
    });
    const repository = new AcceptedRecordingRepository(client);

    const recording = await repository.findByStorageObject(row.bucket_id, row.object_path);

    expect(recording?.id).toBe(row.id);
    expect(query.select).toHaveBeenCalledWith("*");
    expect(query.eq).toHaveBeenCalledWith("bucket_id", row.bucket_id);
    expect(query.eq).toHaveBeenCalledWith("object_path", row.object_path);
    expect(query.maybeSingle).toHaveBeenCalledTimes(1);
  });
});

interface QueryError {
  readonly message: string;
}

interface QueryResult<TData> {
  readonly data: TData;
  readonly error: QueryError | null;
}

type QueryStub = ReturnType<typeof createQuery>;

function queryResult<TData>(data: TData, error: QueryError | null = null): QueryResult<TData> {
  return { data, error };
}

function createQuery(result: QueryResult<unknown>) {
  const query = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(async () => result),
    maybeSingle: jest.fn(async () => result),
  };

  query.select.mockReturnValue(query);
  query.insert.mockReturnValue(query);
  query.update.mockReturnValue(query);
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

function createAcceptedRecordingRow(
  overrides: Partial<AcceptedRecordingRow> = {},
): AcceptedRecordingRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    roleplay_session_id: "22222222-2222-4222-8222-222222222222",
    roleplay_line_id: "55555555-5555-4555-8555-555555555555",
    memorization_session_id: null,
    memorization_sentence_id: null,
    bucket_id: "recordings",
    object_path: "users/user-a/accepted-roleplay.wav",
    mime_type: "audio/wav",
    size_bytes: 2048,
    duration_ms: 4500,
    accepted_at: "2026-06-13T00:09:00.000Z",
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:10:00.000Z",
    ...overrides,
  };
}
