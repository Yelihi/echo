"use server";

import { revalidatePath } from "next/cache";

import { createAnalysisJobRepository } from "@/entities/analysis-job";
import type { SessionId } from "@/entities/value-object";
import { requireUser } from "@/features/login";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function retryRoleplayAnalysis(sessionId: SessionId): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { id: ownerId } = await requireUser(supabase);

  await createAnalysisJobRepository(supabase).requestAnalysisJob({
    ownerId,
    roleplaySessionId: sessionId,
  });
  revalidatePath(`/roleplay-sessions/${sessionId}/result`);
}

export async function retryMemorizationAnalysis(sessionId: SessionId): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { id: ownerId } = await requireUser(supabase);

  await createAnalysisJobRepository(supabase).requestAnalysisJob({
    ownerId,
    memorizationSessionId: sessionId,
  });
  revalidatePath(`/memorization-sessions/${sessionId}/result`);
}
