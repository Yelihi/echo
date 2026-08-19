// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createMemorizationSessionRepository } from "@/entities/memorization-session";
import { createRoleplaySessionRepository } from "@/entities/roleplay-session";

// views
import { convertMemorizationStudySessions } from "@/views/home/models/converter/convertMemorizationStudySessions";
import { convertRoleplayStudySessions } from "@/views/home/models/converter/convertRoleplayStudySessions";
import type { GetLatestStudySession } from "@/views/home/models/interface";

export const getLatestStudySessions = async (): Promise<GetLatestStudySession[]> => {
  const supabase = await createSupabaseServerClient();
  const roleplaySessionRepository = createRoleplaySessionRepository(supabase);
  const memorizationSessionRepository = createMemorizationSessionRepository(supabase);

  const [roleplayLatestTenSessions, memorizationLatestTenSessions] = await Promise.all([
    roleplaySessionRepository.findMany({ page: 1, limit: 10 }),
    memorizationSessionRepository.findMany({ page: 1, limit: 10 }),
  ]);

  if (roleplayLatestTenSessions.length === 0 && memorizationLatestTenSessions.length === 0) {
    return [];
  }

  return [
    ...convertRoleplayStudySessions(roleplayLatestTenSessions),
    ...convertMemorizationStudySessions(memorizationLatestTenSessions),
  ]
    .sort((prev, next) => next.sessionDate.getTime() - prev.sessionDate.getTime())
    .slice(0, 5);
};
