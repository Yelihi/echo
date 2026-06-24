export type { EchoUserProfile } from "@/entities/user-profile/models/entity";
export { mapUserProfileRowToEntity } from "@/entities/user-profile/models/mapper";
export type { UserProfileRow } from "@/entities/user-profile/models/mapper";
export type { UserProfileRepositoryPort } from "@/entities/user-profile/models/repository";
export {
  UserProfileRepository,
  createUserProfileRepository,
} from "@/entities/user-profile/infrastructure/UserProfileRepository";
