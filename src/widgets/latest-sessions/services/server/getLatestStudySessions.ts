import "server-only";
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
import { convertMemorizationStudySessions } from "@/widgets/latest-sessions/models/convertMemorizationStudySessions";
import { convertRoleplayStudySessions } from "@/widgets/latest-sessions/models/convertRoleplayStudySessions";
import { mapAnalysisJobState } from "@/widgets/latest-sessions/models/mapStudySessionState";
import type { GetLatestStudySession } from "@/widgets/latest-sessions/models/studySession";

export const getLatestStudySessions = async (limit = 5): Promise<GetLatestStudySession[]> => {
  const supabase = await createSupabaseServerClient();
  const roleplaySessionRepository = createRoleplaySessionRepository(supabase);
  const memorizationSessionRepository = createMemorizationSessionRepository(supabase);
  const analysisJobRepository = createAnalysisJobRepository(supabase);

  const [recentRoleplaySessions, recentMemorizationSessions] = await Promise.all([
    roleplaySessionRepository.findMany({
      page: 1,
      limit,
      states: [
        RoleplaySessionState.READY,
        RoleplaySessionState.IN_PROGRESS,
        RoleplaySessionState.COMPLETED,
      ],
    }),
    memorizationSessionRepository.findMany({
      page: 1,
      limit,
      states: [
        MemorizationSessionState.READY,
        MemorizationSessionState.IN_PROGRESS,
        MemorizationSessionState.COMPLETED,
      ],
    }),
  ]);

  if (recentRoleplaySessions.length === 0 && recentMemorizationSessions.length === 0) {
    return [];
  }

  const [roleplayAnalysisJobs, memorizationAnalysisJobs] = await Promise.all([
    analysisJobRepository.findLatestByRoleplaySessionIds({
      sessionIds: recentRoleplaySessions.map((session) => session.id),
    }),
    analysisJobRepository.findLatestByMemorizationSessionIds({
      sessionIds: recentMemorizationSessions.map((session) => session.id),
    }),
  ]);
  const roleplayAnalysisStateById = new Map<SessionId, GetLatestStudySession["sessionState"]>(
    roleplayAnalysisJobs.map((job) => [job.sessionId, mapAnalysisJobState(job.state)]),
  );
  const memorizationAnalysisStateById = new Map<SessionId, GetLatestStudySession["sessionState"]>(
    memorizationAnalysisJobs.map((job) => [job.sessionId, mapAnalysisJobState(job.state)]),
  );

  return [
    ...convertRoleplayStudySessions(recentRoleplaySessions, roleplayAnalysisStateById),
    ...convertMemorizationStudySessions(recentMemorizationSessions, memorizationAnalysisStateById),
  ]
    .sort((prev, next) => next.sessionDate.getTime() - prev.sessionDate.getTime())
    .slice(0, limit);
};
