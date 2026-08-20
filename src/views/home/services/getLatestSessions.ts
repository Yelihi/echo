import { createMemorizationSessionRepository } from "@/entities/memorization-session";
import { SessionState as MemorizationSessionState } from "@/entities/memorization-session/models/enums";
import { createRoleplaySessionRepository } from "@/entities/roleplay-session";
import { SessionState as RoleplaySessionState } from "@/entities/roleplay-session/models/enums";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type {
  GetLatestMemorizationSessionsParams,
  GetLatestRoleplaySessionsParams,
} from "@/views/home/models/interface";

export async function getLatestRoleplaySessions(params: GetLatestRoleplaySessionsParams) {
  const supabase = await createSupabaseServerClient();

  return createRoleplaySessionRepository(supabase).findMany({
    page: params.page,
    limit: params.limit ?? 10,
    states: [
      RoleplaySessionState.READY,
      RoleplaySessionState.IN_PROGRESS,
      RoleplaySessionState.COMPLETED,
    ],
  });
}

export async function getLatestMemorizationSessions(params: GetLatestMemorizationSessionsParams) {
  const supabase = await createSupabaseServerClient();

  return createMemorizationSessionRepository(supabase).findMany({
    page: params.page,
    limit: params.limit ?? 10,
    states: [
      MemorizationSessionState.READY,
      MemorizationSessionState.IN_PROGRESS,
      MemorizationSessionState.COMPLETED,
    ],
  });
}
