import type { SupabaseClient } from "@supabase/supabase-js";

import type { EchoUserProfile } from "@/entities/user-profile/models/entity";
import { mapUserProfileRowToEntity } from "@/entities/user-profile/models/mapper";
import type { UserProfileRepositoryPort } from "@/entities/user-profile/models/repository";
import type { UserId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";

export class UserProfileRepository implements UserProfileRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: UserId): Promise<EchoUserProfile | null> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return data ? mapUserProfileRowToEntity(data) : null;
  }
}

export function createUserProfileRepository(
  supabase: SupabaseClient<Database>,
): UserProfileRepositoryPort {
  return new UserProfileRepository(supabase);
}
