import type { AcceptedRecording } from "@/entities/accepted-recording/models/entity";
import type { LineId, RecordingId, SentenceId, SessionId, UserId } from "@/entities/value-object";

interface UpsertAcceptedRecordingFromDraftBaseInput {
  readonly ownerId: UserId;
  readonly bucketId: string;
  readonly objectPath: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly durationMs: number | null;
}

export type UpsertAcceptedRecordingFromDraftInput =
  | (UpsertAcceptedRecordingFromDraftBaseInput & {
      readonly practiceType: "roleplay";
      readonly roleplaySessionId: SessionId;
      readonly roleplayLineId: LineId;
    })
  | (UpsertAcceptedRecordingFromDraftBaseInput & {
      readonly practiceType: "memorization";
      readonly memorizationSessionId: SessionId;
      readonly memorizationSentenceId: SentenceId;
    });

export interface AcceptedRecordingRepositoryPort {
  upsertFromDraft(input: UpsertAcceptedRecordingFromDraftInput): Promise<AcceptedRecording>;
  findByStorageObject(bucketId: string, objectPath: string): Promise<AcceptedRecording | null>;
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
