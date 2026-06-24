import type { AcceptedRecording } from "@/entities/accepted-recording/models/entity";
import { mapPracticeTargetFields } from "@/entities/practice-target";
import { mapRecordingAudioFields } from "@/entities/value-object";
import type { RecordingId, UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

export type AcceptedRecordingRow = Database["public"]["Tables"]["accepted_recordings"]["Row"];

export function mapAcceptedRecordingRowToEntity(row: AcceptedRecordingRow): AcceptedRecording {
  return {
    id: row.id as RecordingId,
    ownerId: row.user_id as UserId,
    target: mapPracticeTargetFields(row, "accepted recording"),
    audio: mapRecordingAudioFields(row, "accepted recording"),
    acceptedAt: new Date(row.accepted_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
