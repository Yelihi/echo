import type { RoleplayMaterial } from "@/entities/roleplay-material";
import type { MaterialId, SpeakerId, UserId } from "@/entities/value-object";

import type { RoleplaySession } from "@/entities/roleplay-session/models/entity";

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
