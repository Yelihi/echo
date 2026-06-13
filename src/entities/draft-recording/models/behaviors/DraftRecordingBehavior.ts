import type { SessionId } from "@/entities/value-object";

export interface AcceptDraftRecordingInput {
  readonly sessionId: SessionId;
  readonly practiceTargetId: string;
}

export interface DraftRecordingBehaviorStructure {
  accept: (input: AcceptDraftRecordingInput) => Promise<void>;
}
