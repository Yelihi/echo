// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createRoleplaySessionRepository } from "@/entities/roleplay-session";
import type { RoleplaySession } from "@/entities/roleplay-session";
import type { SessionId } from "@/entities/value-object";

export async function getRolePlaySession(sessionId: SessionId): Promise<RoleplaySession | null> {
  const supabase = await createSupabaseServerClient();
  return createRoleplaySessionRepository(supabase).findById(sessionId);
}
