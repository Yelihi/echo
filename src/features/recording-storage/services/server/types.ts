import type { AcceptedRecordingRepositoryPort } from "@/entities/accepted-recording/models/repository";
import type { CleanupFailureLogRepositoryPort } from "@/entities/cleanup-failure-log/models/repository";
import type { DraftRecordingRepositoryPort } from "@/entities/draft-recording/models/repository";
import type { LineId, RecordingId, SentenceId, SessionId, UserId } from "@/entities/value-object";

export type RecordingStoragePort = {
  upload(input: { objectPath: string; file: Blob; contentType: string }): Promise<void>;
  createSignedPlaybackUrl(
    objectPath: string,
  ): Promise<{ signedUrl: string; expiresInSeconds: number }>;
  remove(objectPath: string): Promise<void>;
};

export type DraftRecordingTargetInput =
  | {
      readonly practiceType: "roleplay";
      readonly sessionId: SessionId;
      readonly lineSnapshotId: LineId;
    }
  | {
      readonly practiceType: "memorization";
      readonly sessionId: SessionId;
      readonly sentenceSnapshotId: SentenceId;
    };

export interface CreateDraftRecordingWorkflowInput {
  readonly userId: UserId;
  readonly target: DraftRecordingTargetInput;
  readonly file: Blob;
  readonly durationMs: number | null;
  readonly recordingId?: RecordingId;
  readonly storage: RecordingStoragePort;
  readonly draftRepository: DraftRecordingRepositoryPort;
  readonly cleanupFailureLogRepository?: CleanupFailureLogRepositoryPort;
}

export interface AcceptDraftRecordingWorkflowInput {
  readonly userId: UserId;
  readonly draftRecordingId: RecordingId;
  readonly draftRepository: DraftRecordingRepositoryPort;
  readonly acceptedRepository: AcceptedRecordingRepositoryPort;
  readonly storage: Pick<RecordingStoragePort, "remove">;
  readonly cleanupFailureLogRepository?: CleanupFailureLogRepositoryPort;
}

export interface CreateAcceptedRecordingPlaybackUrlWorkflowInput {
  readonly userId: UserId;
  readonly recordingId: RecordingId;
  readonly acceptedRepository: AcceptedRecordingRepositoryPort;
  readonly storage: RecordingStoragePort;
}

export interface DeleteUnacceptedDraftRecordingWorkflowInput {
  readonly userId: UserId;
  readonly draftRecordingId: RecordingId;
  readonly draftRepository: DraftRecordingRepositoryPort;
  readonly acceptedRepository: AcceptedRecordingRepositoryPort;
  readonly storage: RecordingStoragePort;
  readonly cleanupFailureLogRepository?: CleanupFailureLogRepositoryPort;
}
