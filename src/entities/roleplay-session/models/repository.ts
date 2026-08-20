import type { SessionId } from "@/entities/value-object";

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

export interface RoleplaySessionRepositoryPort {
  findById(id: SessionId): Promise<RoleplaySession | null>;
  findMany(params?: FindRoleplaySessionsParams): Promise<RoleplaySession[]>;
  getAllSessionsMetadata(): Promise<SummaryRoleplaySessions>;
}
