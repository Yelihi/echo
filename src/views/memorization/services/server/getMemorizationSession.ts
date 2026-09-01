// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// entities
import { createMemorizationSessionRepository } from "@/entities/memorization-session";
import type { MemorizationSession } from "@/entities/memorization-session";
import type { SessionId } from "@/entities/value-object";

export async function getMemorizationSession(
  sessionId: SessionId,
): Promise<MemorizationSession | null> {
  const supabase = await createSupabaseServerClient();
  return createMemorizationSessionRepository(supabase).findById(sessionId);
}
