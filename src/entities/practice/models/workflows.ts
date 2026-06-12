import type { RoleplayMaterial, RoleplaySession } from "./entities";
import type { MaterialId, SessionId, SpeakerId, UserId } from "./value-objects";

export interface CreateRoleplaySessionInput {
  readonly ownerId: UserId;
  readonly materialId: MaterialId;
  readonly selectedLearnerSpeakerId: SpeakerId;
}

export interface CreateRoleplaySessionSnapshot {
  readonly material: RoleplayMaterial;
  readonly selectedLearnerSpeakerId: SpeakerId;
}

export type CreateRoleplaySession = (input: CreateRoleplaySessionInput) => Promise<RoleplaySession>;

export interface AcceptDraftRecordingInput {
  readonly sessionId: SessionId;
  readonly practiceTargetId: string;
}

export type AcceptDraftRecording = (input: AcceptDraftRecordingInput) => Promise<void>;
