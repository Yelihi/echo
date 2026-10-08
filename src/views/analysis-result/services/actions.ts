"use server";

import { revalidatePath } from "next/cache";

import { createAnalysisJobRepository } from "@/entities/analysis-job";
import type { SessionId } from "@/entities/value-object";
import { requireUser } from "@/features/login/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function retryRoleplayAnalysis(sessionId: SessionId): Promise<string | void> {
  return retryAnalysis(sessionId, "roleplay");
}

export async function retryMemorizationAnalysis(sessionId: SessionId): Promise<string | void> {
  return retryAnalysis(sessionId, "memorization");
}

async function retryAnalysis(
  sessionId: SessionId,
  kind: "roleplay" | "memorization",
): Promise<string | void> {
  const supabase = await createSupabaseServerClient();
  const { id: ownerId } = await requireUser(supabase);
  try {
    await createAnalysisJobRepository(supabase).requestAnalysisJob({
      ownerId,
      ...(kind === "roleplay"
        ? { roleplaySessionId: sessionId }
        : { memorizationSessionId: sessionId }),
    });
    revalidatePath(`/${kind}-sessions/${sessionId}/result`);
    revalidatePath("/my-page");
    revalidatePath("/sessions");
  } catch (error) {
    const cause = error instanceof Error ? error.cause : null;
    const message = cause && typeof cause === "object" && "message" in cause ? cause.message : null;
    if (message === "AI_NOT_INVITED") return "AI 분석은 초대된 계정에서 사용할 수 있습니다.";
    if (message === "AI_RATE_LIMIT") return "오늘의 분석 요청 한도에 도달했습니다.";
    if (message === "AI_RETRY_LIMIT")
      return "이 세션의 분석 요청 한도(3회)에 도달했습니다. 기존 결과는 유지됩니다.";
    return "분석을 요청하지 못했습니다. 잠시 후 다시 시도해주세요.";
  }
}
