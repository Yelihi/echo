import type { EchoUserProfile } from "@/entities/user-profile/models/entity";
import type { UserId } from "@/entities/value-object";

export interface UserProfileRepositoryPort {
  findById(id: UserId): Promise<EchoUserProfile | null>;
}
