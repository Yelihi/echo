import type { CleanupFailureLog } from "@/entities/cleanup-failure-log/models/entity";
import { CleanupFailureSource } from "@/entities/cleanup-failure-log/models/enums";
import { mapRecordingAudioFields } from "@/entities/value-object";
import type { UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

export type CleanupFailureLogRow = Database["public"]["Tables"]["cleanup_failure_logs"]["Row"];

export function mapCleanupFailureLogRowToEntity(row: CleanupFailureLogRow): CleanupFailureLog {
  return {
    id: row.id,
    ownerId: row.user_id as UserId,
    source: row.source as CleanupFailureSource,
    audio: mapRecordingAudioFields(row, "cleanup failure log"),
    errorMessage: row.error_message,
    attemptedAt: new Date(row.attempted_at),
    createdAt: new Date(row.created_at),
  };
}
