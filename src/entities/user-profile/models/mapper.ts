import type { EchoUserProfile } from "@/entities/user-profile/models/entity";
import type { UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";
import { DEFAULT_GRAMMAR_DIFFICULTY, grammarDifficultySchema } from "./entity";

export type UserProfileRow = Database["public"]["Tables"]["user_profiles"]["Row"];

export function mapUserProfileRowToEntity(row: UserProfileRow): EchoUserProfile {
  return {
    id: row.id as UserId,
    displayName: row.display_name,
    exampleDifficulty: grammarDifficultySchema.parse(
      row.example_difficulty ?? DEFAULT_GRAMMAR_DIFFICULTY,
    ),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
