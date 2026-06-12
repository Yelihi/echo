import type { RoleplayMaterial } from "@/entities/roleplay-material";
import type { MaterialId, SpeakerId, UserId } from "@/shared/domain/value-objects";

import type { RoleplaySession } from "../entity";

export interface CreateRoleplaySessionInput {
  readonly ownerId: UserId;
  readonly materialId: MaterialId;
  readonly selectedLearnerSpeakerId: SpeakerId;
}

export interface CreateRoleplaySessionSnapshot {
  readonly material: RoleplayMaterial;
  readonly selectedLearnerSpeakerId: SpeakerId;
}

export interface RoleplaySessionBehaviorStructure {
  createSession: (input: CreateRoleplaySessionInput) => Promise<RoleplaySession>;
}
