import type { CleanupFailureLog } from "@/entities/cleanup-failure-log/models/entity";
import { CleanupFailureSource } from "@/entities/cleanup-failure-log/models/enums";
import type { RecordingAudio, UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

export type CleanupFailureLogRow = Database["public"]["Tables"]["cleanup_failure_logs"]["Row"];

export function mapCleanupFailureLogRowToEntity(row: CleanupFailureLogRow): CleanupFailureLog {
  return {
    id: row.id,
    ownerId: row.user_id as UserId,
    source: row.source as CleanupFailureSource,
    audio: mapRecordingAudio(row),
    errorMessage: row.error_message,
    attemptedAt: new Date(row.attempted_at),
    createdAt: new Date(row.created_at),
  };
}

function mapRecordingAudio(row: CleanupFailureLogRow): RecordingAudio {
  if (!row.mime_type.startsWith("audio/")) {
    throw new Error(`Invalid cleanup failure log mime type: ${row.mime_type}`);
  }

  return {
    bucketId: row.bucket_id,
    objectPath: row.object_path,
    mimeType: row.mime_type as `audio/${string}`,
    sizeBytes: row.size_bytes,
    durationMs: row.duration_ms,
  };
}
