// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createAnalysisJobRepository } from "@/entities/analysis-job";
import { createMemorizationSessionRepository } from "@/entities/memorization-session";
import { SessionState as MemorizationSessionState } from "@/entities/memorization-session/models/enums";
import { createRoleplaySessionRepository } from "@/entities/roleplay-session";
import { SessionState as RoleplaySessionState } from "@/entities/roleplay-session/models/enums";
import type { SessionId } from "@/entities/value-object";

// views
import { convertMemorizationStudySessions } from "@/views/home/models/converter/convertMemorizationStudySessions";
import { convertRoleplayStudySessions } from "@/views/home/models/converter/convertRoleplayStudySessions";
import { mapAnalysisJobState } from "@/views/home/models/converter/mapStudySessionState";
import type { GetLatestStudySession } from "@/views/home/models/interface";

export const getLatestStudySessions = async (): Promise<GetLatestStudySession[]> => {
  const supabase = await createSupabaseServerClient();
  const roleplaySessionRepository = createRoleplaySessionRepository(supabase);
  const memorizationSessionRepository = createMemorizationSessionRepository(supabase);
  const analysisJobRepository = createAnalysisJobRepository(supabase);

  const [roleplayLatestTenSessions, memorizationLatestTenSessions] = await Promise.all([
    roleplaySessionRepository.findMany({
      page: 1,
      limit: 10,
      states: [
        RoleplaySessionState.READY,
        RoleplaySessionState.IN_PROGRESS,
        RoleplaySessionState.COMPLETED,
      ],
    }),
    memorizationSessionRepository.findMany({
      page: 1,
      limit: 10,
      states: [
        MemorizationSessionState.READY,
        MemorizationSessionState.IN_PROGRESS,
        MemorizationSessionState.COMPLETED,
      ],
    }),
  ]);

  if (roleplayLatestTenSessions.length === 0 && memorizationLatestTenSessions.length === 0) {
    return [];
  }

  const [roleplayAnalysisJobs, memorizationAnalysisJobs] = await Promise.all([
    analysisJobRepository.findLatestByRoleplaySessionIds({
      sessionIds: roleplayLatestTenSessions.map((session) => session.id),
    }),
    analysisJobRepository.findLatestByMemorizationSessionIds({
      sessionIds: memorizationLatestTenSessions.map((session) => session.id),
    }),
  ]);
  const roleplayAnalysisStateById = new Map<SessionId, GetLatestStudySession["sessionState"]>(
    roleplayAnalysisJobs.map((job) => [job.sessionId, mapAnalysisJobState(job.state)]),
  );
  const memorizationAnalysisStateById = new Map<SessionId, GetLatestStudySession["sessionState"]>(
    memorizationAnalysisJobs.map((job) => [job.sessionId, mapAnalysisJobState(job.state)]),
  );

  return [
    ...convertRoleplayStudySessions(roleplayLatestTenSessions, roleplayAnalysisStateById),
    ...convertMemorizationStudySessions(
      memorizationLatestTenSessions,
      memorizationAnalysisStateById,
    ),
  ]
    .sort((prev, next) => next.sessionDate.getTime() - prev.sessionDate.getTime())
    .slice(0, 5);
};
