import { describe, expect, it } from "@jest/globals";

import { PracticeType } from "@/entities/practice-target";
import type { DraftRecordingRow } from "@/entities/draft-recording/models/mapper";
import { mapDraftRecordingRowToEntity } from "@/entities/draft-recording/models/mapper";

describe("mapDraftRecordingRowToEntity", () => {
  it("maps a roleplay draft recording row", () => {
    const row = createDraftRecordingRow();

    const entity = mapDraftRecordingRowToEntity(row);

    expect(entity).toMatchObject({
      id: row.id,
      ownerId: row.user_id,
      target: {
        practiceType: PracticeType.ROLEPLAY,
        sessionId: row.roleplay_session_id,
        lineSnapshotId: row.roleplay_line_id,
      },
      audio: {
        bucketId: "recordings",
        objectPath: "users/user-a/roleplay.wav",
        mimeType: "audio/wav",
        sizeBytes: 1024,
        durationMs: 3000,
      },
    });
    expect(entity.createdAt).toEqual(new Date(row.created_at));
    expect(entity.updatedAt).toEqual(new Date(row.updated_at));
  });

  it("maps a memorization draft recording row", () => {
    const row = createDraftRecordingRow({
      roleplay_session_id: null,
      roleplay_line_id: null,
      memorization_session_id: "33333333-3333-4333-8333-333333333333",
      memorization_sentence_id: "44444444-4444-4444-8444-444444444444",
    });

    const entity = mapDraftRecordingRowToEntity(row);

    expect(entity.target).toEqual({
      practiceType: PracticeType.MEMORIZATION,
      sessionId: row.memorization_session_id,
      sentenceSnapshotId: row.memorization_sentence_id,
    });
  });

  it("rejects a row with mixed roleplay and memorization target", () => {
    const row = createDraftRecordingRow({
      memorization_session_id: "33333333-3333-4333-8333-333333333333",
      memorization_sentence_id: "44444444-4444-4444-8444-444444444444",
    });

    expect(() => mapDraftRecordingRowToEntity(row)).toThrow(
      `Invalid draft recording target: ${row.id}`,
    );
  });

  it("rejects a non-audio mime type", () => {
    const row = createDraftRecordingRow({ mime_type: "video/mp4" });

    expect(() => mapDraftRecordingRowToEntity(row)).toThrow(
      "Invalid draft recording mime type: video/mp4",
    );
  });
});

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
