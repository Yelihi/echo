import type { SessionId } from "@/entities/value-object";

import type { RoleplaySession } from "@/entities/roleplay-session/models/entity";
import type { SessionState } from "@/entities/roleplay-session/models/enums";

export interface FindRoleplaySessionsParams {
  readonly state?: SessionState;
  readonly tagNormalizedName?: string;
  readonly limit?: number;
}

export interface RoleplaySessionRepositoryPort {
  findById(id: SessionId): Promise<RoleplaySession | null>;
  findMany(params?: FindRoleplaySessionsParams): Promise<RoleplaySession[]>;
}
