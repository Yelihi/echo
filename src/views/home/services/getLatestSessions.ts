import { createMemorizationSessionRepository } from "@/entities/memorization-session";
import { createRoleplaySessionRepository } from "@/entities/roleplay-session";
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
  });
}

export async function getLatestMemorizationSessions(params: GetLatestMemorizationSessionsParams) {
  const supabase = await createSupabaseServerClient();

  return createMemorizationSessionRepository(supabase).findMany({
    page: params.page,
    limit: params.limit ?? 10,
  });
}
