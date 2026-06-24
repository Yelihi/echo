import { mapPracticeTargetFields } from "@/entities/practice-target";
import type { DraftRecording } from "@/entities/draft-recording/models/entity";
import type { Database } from "@/shared/lib/supabase";
import { mapRecordingAudioFields } from "@/entities/value-object";
import type { RecordingId, UserId } from "@/entities/value-object";

export type DraftRecordingRow = Database["public"]["Tables"]["draft_recordings"]["Row"];

export function mapDraftRecordingRowToEntity(row: DraftRecordingRow): DraftRecording {
  return {
    id: row.id as RecordingId,
    ownerId: row.user_id as UserId,
    target: mapPracticeTargetFields(row, "draft recording"),
    audio: mapRecordingAudioFields(row, "draft recording"),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
