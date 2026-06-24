import { describe, expect, it } from "@jest/globals";

import type { AcceptedRecordingRow } from "@/entities/accepted-recording/models/mapper";
import { mapAcceptedRecordingRowToEntity } from "@/entities/accepted-recording/models/mapper";
import { PracticeType } from "@/entities/practice-target";

describe("mapAcceptedRecordingRowToEntity", () => {
  it("maps a roleplay accepted recording row", () => {
    const row = createAcceptedRecordingRow();

    const entity = mapAcceptedRecordingRowToEntity(row);

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
        objectPath: "users/user-a/accepted-roleplay.wav",
        mimeType: "audio/wav",
        sizeBytes: 2048,
        durationMs: 4500,
      },
    });
    expect(entity.acceptedAt).toEqual(new Date(row.accepted_at));
    expect(entity.createdAt).toEqual(new Date(row.created_at));
    expect(entity.updatedAt).toEqual(new Date(row.updated_at));
  });

  it("maps a memorization accepted recording row", () => {
    const row = createAcceptedRecordingRow({
      roleplay_session_id: null,
      roleplay_line_id: null,
      memorization_session_id: "33333333-3333-4333-8333-333333333333",
      memorization_sentence_id: "44444444-4444-4444-8444-444444444444",
    });

    const entity = mapAcceptedRecordingRowToEntity(row);

    expect(entity.target).toEqual({
      practiceType: PracticeType.MEMORIZATION,
      sessionId: row.memorization_session_id,
      sentenceSnapshotId: row.memorization_sentence_id,
    });
  });

  it("rejects a row with mixed roleplay and memorization target", () => {
    const row = createAcceptedRecordingRow({
      memorization_session_id: "33333333-3333-4333-8333-333333333333",
      memorization_sentence_id: "44444444-4444-4444-8444-444444444444",
    });

    expect(() => mapAcceptedRecordingRowToEntity(row)).toThrow(
      `Invalid accepted recording target: ${row.id}`,
    );
  });

  it("rejects a non-audio mime type", () => {
    const row = createAcceptedRecordingRow({ mime_type: "application/json" });

    expect(() => mapAcceptedRecordingRowToEntity(row)).toThrow(
      "Invalid accepted recording mime type: application/json",
    );
  });
});

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
