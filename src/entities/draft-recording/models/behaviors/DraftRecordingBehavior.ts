import type { SessionId } from "@/shared/domain/value-objects";

export interface AcceptDraftRecordingInput {
  readonly sessionId: SessionId;
  readonly practiceTargetId: string;
}

export interface DraftRecordingBehaviorStructure {
  accept: (input: AcceptDraftRecordingInput) => Promise<void>;
}
