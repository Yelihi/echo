import { describe, expect, it, jest } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";

import { CleanupFailureSource } from "@/entities/cleanup-failure-log";
import { CleanupFailureLogRepository } from "@/entities/cleanup-failure-log/infrastructure/CleanupFailureLogRepository";
import type { CleanupFailureLogRow } from "@/entities/cleanup-failure-log/models/mapper";
import type { UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

describe("CleanupFailureLogRepository", () => {
  it("creates a cleanup failure log with input audio metadata", async () => {
    const row = createCleanupFailureLogRow();
    const query = createQuery(queryResult(row));
    const { client } = createSupabaseStub({
      tables: {
        cleanup_failure_logs: [query],
      },
    });
    const repository = new CleanupFailureLogRepository(client);

    const log = await repository.create({
      source: CleanupFailureSource.DRAFT_RECORDING,
      userId: row.user_id as UserId,
      bucketId: row.bucket_id,
      objectPath: row.object_path,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      durationMs: row.duration_ms,
      errorMessage: row.error_message,
    });

    expect(log.id).toBe(row.id);
    expect(query.insert).toHaveBeenCalledWith({
      source: row.source,
      user_id: row.user_id,
      bucket_id: row.bucket_id,
      object_path: row.object_path,
      mime_type: row.mime_type,
      size_bytes: row.size_bytes,
      duration_ms: row.duration_ms,
      error_message: row.error_message,
    });
    expect(row.size_bytes).toBeGreaterThan(0);
    expect(query.select).toHaveBeenCalledWith("*");
    expect(query.single).toHaveBeenCalledTimes(1);
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
    insert: jest.fn(),
    select: jest.fn(),
    single: jest.fn(async () => result),
  };

  query.insert.mockReturnValue(query);
  query.select.mockReturnValue(query);

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

function createCleanupFailureLogRow(
  overrides: Partial<CleanupFailureLogRow> = {},
): CleanupFailureLogRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    source: "draft_recording",
    bucket_id: "recordings",
    object_path: "users/user-a/orphan.webm",
    mime_type: "audio/webm",
    size_bytes: 64,
    duration_ms: 4200,
    error_message: "Storage object delete failed",
    attempted_at: "2026-06-13T00:01:00.000Z",
    created_at: "2026-06-13T00:02:00.000Z",
    ...overrides,
  };
}
