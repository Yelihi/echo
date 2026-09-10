import "server-only";
import { notFound } from "next/navigation";
import { loadSessionAnalysis } from "./loadSessionAnalysis";
import { SessionAnalysisUnavailable } from "../../models/sessionAnalysisReader";

import { createAnalysisJobRepository } from "@/entities/analysis-job";
import { createAcceptedRecordingRepository } from "@/entities/accepted-recording";
import { createMemorizationSessionRepository } from "@/entities/memorization-session";
import type { SessionId } from "@/entities/value-object";
import { RecordingStorageService } from "@/shared/lib/recording-storage/server";
import { requireUser } from "@/features/login";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { MemorizationResultPageData } from "@/views/analysis-result/models";

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
  const { session, job, acceptedRecordings, sourceResults } = await loadSessionAnalysis(
    sessionId,
    user.id,
    {
      findSession: (id) => sessions.findById(id),
      findHistory: (id) => analysisJobs.findHistoryByMemorizationSessionId({ sessionId: id }),
      findRecordings: (id) => recordings.findManyByMemorizationSessionId(id),
      findResults: (id) => analysisJobs.findResultsByJobId(id),
    },
  ).catch((error: unknown) => {
    if (error instanceof SessionAnalysisUnavailable) notFound();
    throw error;
  });
  const audioBySentenceId = await createMemorizationAudioBySentenceId(storage, acceptedRecordings);

  return {
    session,
    job: job ?? null,
    sourceResults,
    audioBySentenceId,
  };
}
