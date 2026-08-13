import { notFound } from "next/navigation";

import { createAnalysisJobRepository } from "@/entities/analysis-job";
import { createAcceptedRecordingRepository } from "@/entities/accepted-recording";
import {
  createMemorizationSessionRepository,
  SessionState as MemorizationSessionState,
} from "@/entities/memorization-session";
import type { SessionId } from "@/entities/value-object";
import { RecordingStorageService } from "@/shared/lib/recording-storage/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { MemorizationResultPageData } from "@/views/analysis-result/models";

import { requireUser } from "./auth";
import { createMemorizationAudioBySentenceId } from "./memorizationAudio";

export async function getMemorizationResultPageData(
  sessionId: SessionId,
): Promise<MemorizationResultPageData> {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);
  const sessions = createMemorizationSessionRepository(supabase);
  const analysisJobs = createAnalysisJobRepository(supabase);
  const recordings = createAcceptedRecordingRepository(supabase);
  const storage = new RecordingStorageService(supabase);
  const session = await sessions.findById(sessionId);

  if (!session || session.ownerId !== user.id) {
    notFound();
  }
  if (session.state !== MemorizationSessionState.COMPLETED) {
    notFound();
  }

  const job =
    (await analysisJobs.findCurrentByMemorizationSessionId({ sessionId })) ??
    (await analysisJobs.requestAnalysisJob({
      ownerId: user.id,
      memorizationSessionId: sessionId,
    }));
  const [acceptedRecordings, sourceResults] = await Promise.all([
    recordings.findManyByMemorizationSessionId(sessionId),
    analysisJobs.findResultsByJobId(job.id),
  ]);
  const audioBySentenceId = await createMemorizationAudioBySentenceId(storage, acceptedRecordings);

  return {
    session,
    job,
    sourceResults,
    audioBySentenceId,
  };
}
