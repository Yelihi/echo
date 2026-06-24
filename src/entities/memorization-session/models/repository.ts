import type { SessionId } from "@/entities/value-object";

import type { MemorizationSession } from "@/entities/memorization-session/models/entity";
import type { SessionState } from "@/entities/memorization-session/models/enums";

export interface FindMemorizationSessionsParams {
  readonly state?: SessionState;
  readonly tagNormalizedName?: string;
  readonly limit?: number;
}

export interface MemorizationSessionRepositoryPort {
  findById(id: SessionId): Promise<MemorizationSession | null>;
  findMany(params?: FindMemorizationSessionsParams): Promise<MemorizationSession[]>;
}
