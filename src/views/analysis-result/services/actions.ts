"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { createAnalysisJobRepository } from "@/entities/analysis-job";
import type { SessionId, UserId } from "@/entities/value-object";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function retryRoleplayAnalysis(sessionId: SessionId): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const ownerId = await requireUserId(supabase);

  await createAnalysisJobRepository(supabase).requestAnalysisJob({
    ownerId,
    roleplaySessionId: sessionId,
  });
  revalidatePath(`/roleplay-sessions/${sessionId}/result`);
}

export async function retryMemorizationAnalysis(sessionId: SessionId): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const ownerId = await requireUserId(supabase);

  await createAnalysisJobRepository(supabase).requestAnalysisJob({
    ownerId,
    memorizationSessionId: sessionId,
  });
  revalidatePath(`/memorization-sessions/${sessionId}/result`);
}

async function requireUserId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<UserId> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  return user.id as UserId;
}
