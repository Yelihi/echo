import type { MaterialId, SessionId, UserId, SpeakerId } from "@/entities/value-object";
import type { RoleplayMaterial } from "@/entities/roleplay-material";

import type {
  RoleplaySession,
  SummaryRoleplaySessions,
} from "@/entities/roleplay-session/models/entity";
import type { SessionState } from "@/entities/roleplay-session/models/enums";

export interface FindRoleplaySessionsParams {
  readonly state?: SessionState;
  readonly states?: readonly SessionState[];
  readonly tagNormalizedName?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface CreateRoleplaySessionInput {
  readonly ownerId: UserId;
  readonly materialId: MaterialId;
  readonly selectedLearnerSpeakerId: SpeakerId;
}

export interface CreateRoleplaySessionSnapshot {
  readonly material: RoleplayMaterial;
  readonly selectedLearnerSpeakerId: SpeakerId;
}

export interface RoleplaySessionRepositoryPort {
  findById(id: SessionId): Promise<RoleplaySession | null>;
  findMany(params?: FindRoleplaySessionsParams): Promise<RoleplaySession[]>;
  getAllSessionsMetadata(): Promise<SummaryRoleplaySessions>;
  createSession: (snapshot: CreateRoleplaySessionSnapshot) => Promise<RoleplaySession>;
}
