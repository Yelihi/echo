import { describe, expect, it } from "@jest/globals";

import { CleanupFailureSource } from "@/entities/cleanup-failure-log";
import type { CleanupFailureLogRow } from "@/entities/cleanup-failure-log/models/mapper";
import { mapCleanupFailureLogRowToEntity } from "@/entities/cleanup-failure-log/models/mapper";

describe("mapCleanupFailureLogRowToEntity", () => {
  it("maps a cleanup failure log row", () => {
    const row = createCleanupFailureLogRow();

    const entity = mapCleanupFailureLogRowToEntity(row);

    expect(entity).toMatchObject({
      id: row.id,
      ownerId: row.user_id,
      source: CleanupFailureSource.DRAFT_RECORDING,
      audio: {
        bucketId: "recordings",
        objectPath: "users/user-a/orphan.wav",
        mimeType: "audio/wav",
        sizeBytes: 1024,
        durationMs: 3000,
      },
      errorMessage: "Storage object delete failed",
    });
    expect(entity.attemptedAt).toEqual(new Date(row.attempted_at));
    expect(entity.createdAt).toEqual(new Date(row.created_at));
  });

  it("rejects a non-audio mime type", () => {
    const row = createCleanupFailureLogRow({ mime_type: "image/png" });

    expect(() => mapCleanupFailureLogRowToEntity(row)).toThrow(
      "Invalid cleanup failure log mime type: image/png",
    );
  });
});

function createCleanupFailureLogRow(
  overrides: Partial<CleanupFailureLogRow> = {},
): CleanupFailureLogRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    source: "draft_recording",
    bucket_id: "recordings",
    object_path: "users/user-a/orphan.wav",
    mime_type: "audio/wav",
    size_bytes: 1024,
    duration_ms: 3000,
    error_message: "Storage object delete failed",
    attempted_at: "2026-06-13T00:01:00.000Z",
    created_at: "2026-06-13T00:02:00.000Z",
    ...overrides,
  };
}
