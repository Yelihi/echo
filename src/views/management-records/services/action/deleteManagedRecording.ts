"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RecordingStorageService } from "@/shared/lib/recording-storage/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import { createAcceptedRecordingRepository } from "@/entities/accepted-recording";
import { createCleanupFailureLogRepository } from "@/entities/cleanup-failure-log";
import { createDraftRecordingRepository } from "@/entities/draft-recording";
import type { RecordingId, UserId } from "@/entities/value-object";
import { deleteUnacceptedDraftRecording } from "@/features/recording-storage/services/server";

export async function deleteManagedRecording(
  recordId: string,
): Promise<{ code: "SUCCESS" | "INVALID_INPUT" | "UNAUTHORIZED" | "DELETE_FAILED" }> {
  if (!z.string().uuid().safeParse(recordId).success) return { code: "INVALID_INPUT" };
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { code: "UNAUTHORIZED" };
  try {
    // Storage deletion is server-only; the workflow validates draft ownership first.
    const serviceSupabase = getSupabaseServiceRoleClient();
    await deleteUnacceptedDraftRecording({
      userId: user.id as UserId,
      draftRecordingId: recordId as RecordingId,
      draftRepository: createDraftRecordingRepository(supabase),
      acceptedRepository: createAcceptedRecordingRepository(serviceSupabase),
      cleanupFailureLogRepository: createCleanupFailureLogRepository(supabase),
      storage: new RecordingStorageService(serviceSupabase),
    });
    revalidatePath("/recording-management");
    return { code: "SUCCESS" };
  } catch {
    // Failed storage deletion is logged by the workflow; refresh the failed status as well.
    revalidatePath("/recording-management");
    return { code: "DELETE_FAILED" };
  }
}
