import { createMemorizationSessionRepository } from "@/entities/memorization-session";
import { createRoleplaySessionRepository } from "@/entities/roleplay-session";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { SessionIntroCardProps } from "@/widgets/session-intro-card/models/interface";

export async function getHomeSessionIntroCount(
  type: SessionIntroCardProps["type"],
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const repository =
    type === "role-play"
      ? createRoleplaySessionRepository(supabase)
      : createMemorizationSessionRepository(supabase);
  const { totalCount } = await repository.getAllSessionsMetadata();

  return totalCount;
}
