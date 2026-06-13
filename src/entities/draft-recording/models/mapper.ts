import type { PracticeTarget } from "@/entities/practice-target";
import { PracticeType } from "@/entities/practice-target";
import type { DraftRecording } from "@/entities/draft-recording/models/entity";
import type { Database } from "@/shared/lib/supabase";
import type {
  LineId,
  RecordingAudio,
  RecordingId,
  SentenceId,
  SessionId,
  UserId,
} from "@/entities/value-object";

export type DraftRecordingRow = Database["public"]["Tables"]["draft_recordings"]["Row"];

export function mapDraftRecordingRowToEntity(row: DraftRecordingRow): DraftRecording {
  return {
    id: row.id as RecordingId,
    ownerId: row.user_id as UserId,
    target: mapPracticeTarget(row),
    audio: mapRecordingAudio(row),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapPracticeTarget(row: DraftRecordingRow): PracticeTarget {
  if (row.roleplay_session_id && row.roleplay_line_id) {
    assertNoMemorizationTarget(row);

    return {
      practiceType: PracticeType.ROLEPLAY,
      sessionId: row.roleplay_session_id as SessionId,
      lineSnapshotId: row.roleplay_line_id as LineId,
    };
  }

  if (row.memorization_session_id && row.memorization_sentence_id) {
    assertNoRoleplayTarget(row);

    return {
      practiceType: PracticeType.MEMORIZATION,
      sessionId: row.memorization_session_id as SessionId,
      sentenceSnapshotId: row.memorization_sentence_id as SentenceId,
    };
  }

  throw new Error(`Invalid draft recording target: ${row.id}`);
}

function mapRecordingAudio(row: DraftRecordingRow): RecordingAudio {
  if (!row.mime_type.startsWith("audio/")) {
    throw new Error(`Invalid draft recording mime type: ${row.mime_type}`);
  }

  return {
    bucketId: row.bucket_id,
    objectPath: row.object_path,
    mimeType: row.mime_type as `audio/${string}`,
    sizeBytes: row.size_bytes,
    durationMs: row.duration_ms,
  };
}

function assertNoMemorizationTarget(row: DraftRecordingRow): void {
  if (row.memorization_session_id || row.memorization_sentence_id) {
    throw new Error(`Invalid draft recording target: ${row.id}`);
  }
}

function assertNoRoleplayTarget(row: DraftRecordingRow): void {
  if (row.roleplay_session_id || row.roleplay_line_id) {
    throw new Error(`Invalid draft recording target: ${row.id}`);
  }
}
