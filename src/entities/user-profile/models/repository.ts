import type { EchoUserProfile } from "@/entities/user-profile/models/entity";
import type { UserId } from "@/entities/value-object";
import type { GrammarDifficulty } from "./entity";

export interface UserProfileRepositoryPort {
  findById(id: UserId): Promise<EchoUserProfile | null>;
  saveDifficulty(id: UserId, difficulty: GrammarDifficulty): Promise<void>;
}
