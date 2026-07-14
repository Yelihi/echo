import type { LineId, RecordingId, SentenceId, SessionId, UserId } from "@/entities/value-object";
import type { DraftRecording } from "@/entities/draft-recording/models/entity";

interface CreateDraftRecordingBaseInput {
  readonly id: RecordingId;
  readonly ownerId: UserId;
  readonly bucketId: string;
  readonly objectPath: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly durationMs: number | null;
}

export type CreateDraftRecordingInput =
  | (CreateDraftRecordingBaseInput & {
      readonly practiceType: "roleplay";
      readonly roleplaySessionId: SessionId;
      readonly roleplayLineId: LineId;
    })
  | (CreateDraftRecordingBaseInput & {
      readonly practiceType: "memorization";
      readonly memorizationSessionId: SessionId;
      readonly memorizationSentenceId: SentenceId;
    });

export interface DraftRecordingRepositoryPort {
  create(input: CreateDraftRecordingInput): Promise<DraftRecording>;
  deleteById(id: RecordingId): Promise<void>;
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
