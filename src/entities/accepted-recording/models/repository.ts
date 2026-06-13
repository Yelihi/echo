import type { AcceptedRecording } from "@/entities/accepted-recording/models/entity";
import type { LineId, RecordingId, SentenceId, SessionId } from "@/entities/value-object";

export interface AcceptedRecordingRepositoryPort {
  findById(id: RecordingId): Promise<AcceptedRecording | null>;
  findByRoleplayTarget(
    sessionId: SessionId,
    lineSnapshotId: LineId,
  ): Promise<AcceptedRecording | null>;
  findByMemorizationTarget(
    sessionId: SessionId,
    sentenceSnapshotId: SentenceId,
  ): Promise<AcceptedRecording | null>;
}
