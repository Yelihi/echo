import { createMemorizationMaterialRepository } from "@/entities/memorization-material";
import { createRoleplayMaterialRepository } from "@/entities/roleplay-material";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { SessionIntroCardProps } from "@/widgets/session-intro-card/models/interface";

export async function getHomeSessionIntroCount(
  type: SessionIntroCardProps["type"],
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const repository =
    type === "role-play"
      ? createRoleplayMaterialRepository(supabase)
      : createMemorizationMaterialRepository(supabase);

  return repository.countActive();
}
