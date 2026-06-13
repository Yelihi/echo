import type { AcceptedRecording } from "@/entities/accepted-recording/models/entity";
import type { PracticeTarget } from "@/entities/practice-target";
import { PracticeType } from "@/entities/practice-target";
import type {
  LineId,
  RecordingAudio,
  RecordingId,
  SentenceId,
  SessionId,
  UserId,
} from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

export type AcceptedRecordingRow = Database["public"]["Tables"]["accepted_recordings"]["Row"];

export function mapAcceptedRecordingRowToEntity(row: AcceptedRecordingRow): AcceptedRecording {
  return {
    id: row.id as RecordingId,
    ownerId: row.user_id as UserId,
    target: mapPracticeTarget(row),
    audio: mapRecordingAudio(row),
    acceptedAt: new Date(row.accepted_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapPracticeTarget(row: AcceptedRecordingRow): PracticeTarget {
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

  throw new Error(`Invalid accepted recording target: ${row.id}`);
}

function mapRecordingAudio(row: AcceptedRecordingRow): RecordingAudio {
  if (!row.mime_type.startsWith("audio/")) {
    throw new Error(`Invalid accepted recording mime type: ${row.mime_type}`);
  }

  return {
    bucketId: row.bucket_id,
    objectPath: row.object_path,
    mimeType: row.mime_type as `audio/${string}`,
    sizeBytes: row.size_bytes,
    durationMs: row.duration_ms,
  };
}

function assertNoMemorizationTarget(row: AcceptedRecordingRow): void {
  if (row.memorization_session_id || row.memorization_sentence_id) {
    throw new Error(`Invalid accepted recording target: ${row.id}`);
  }
}

function assertNoRoleplayTarget(row: AcceptedRecordingRow): void {
  if (row.roleplay_session_id || row.roleplay_line_id) {
    throw new Error(`Invalid accepted recording target: ${row.id}`);
  }
}
