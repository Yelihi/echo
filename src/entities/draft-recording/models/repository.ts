import type { LineId, RecordingId, SentenceId, SessionId } from "@/entities/value-object";
import type { DraftRecording } from "@/entities/draft-recording/models/entity";

export interface DraftRecordingRepositoryPort {
  findById(id: RecordingId): Promise<DraftRecording | null>;
  findByRoleplayTarget(
    sessionId: SessionId,
    lineSnapshotId: LineId,
  ): Promise<DraftRecording | null>;
  findByMemorizationTarget(
    sessionId: SessionId,
    sentenceSnapshotId: SentenceId,
  ): Promise<DraftRecording | null>;
}
