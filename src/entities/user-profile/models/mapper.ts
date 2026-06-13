import type { EchoUserProfile } from "@/entities/user-profile/models/entity";
import type { UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

export type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

export function mapUserProfileRowToEntity(row: UserProfileRow): EchoUserProfile {
  return {
    id: row.id as UserId,
    displayName: row.display_name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
