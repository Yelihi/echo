import "server-only";
import { notFound } from "next/navigation";
import { loadSessionAnalysis } from "./loadSessionAnalysis";
import { SessionAnalysisUnavailable } from "../../models/sessionAnalysisReader";

import { createAnalysisJobRepository } from "@/entities/analysis-job";
import { createAcceptedRecordingRepository } from "@/entities/accepted-recording";
import { createRoleplaySessionRepository } from "@/entities/roleplay-session";
import type { SessionId } from "@/entities/value-object";
import { RecordingStorageService } from "@/shared/lib/recording-storage/server";
import { requireUser } from "@/features/login";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { RoleplayResultPageData } from "@/views/analysis-result/models";

import { createRoleplayAudioByLineId } from "./roleplayAudio";

export async function getRoleplayResultPageData(
  sessionId: SessionId,
): Promise<RoleplayResultPageData> {
  const supabase = await createSupabaseServerClient();
  const user = await requireUser(supabase);
  const sessions = createRoleplaySessionRepository(supabase);
  const analysisJobs = createAnalysisJobRepository(supabase);
  const recordings = createAcceptedRecordingRepository(supabase);
  const storage = new RecordingStorageService(supabase);
  const { session, job, acceptedRecordings, sourceResults } = await loadSessionAnalysis(
    sessionId,
    user.id,
    {
      findSession: (id) => sessions.findById(id),
      findHistory: (id) => analysisJobs.findHistoryByRoleplaySessionId({ sessionId: id }),
      findRecordings: (id) => recordings.findManyByRoleplaySessionId(id),
      findResults: (id) => analysisJobs.findResultsByJobId(id),
    },
  ).catch((error: unknown) => {
    if (error instanceof SessionAnalysisUnavailable) notFound();
    throw error;
  });
  const audioByLineId = await createRoleplayAudioByLineId(storage, acceptedRecordings);

  return {
    session,
    job: job ?? null,
    sourceResults,
    audioByLineId,
  };
}
