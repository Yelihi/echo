import { notFound } from "next/navigation";

import { createAnalysisJobRepository } from "@/entities/analysis-job";
import { createAcceptedRecordingRepository } from "@/entities/accepted-recording";
import {
  createRoleplaySessionRepository,
  SessionState as RoleplaySessionState,
} from "@/entities/roleplay-session";
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
  const session = await sessions.findById(sessionId);

  if (!session || session.ownerId !== user.id) {
    notFound();
  }
  if (session.state !== RoleplaySessionState.COMPLETED) {
    notFound();
  }

  const job =
    (await analysisJobs.findCurrentByRoleplaySessionId({ sessionId })) ??
    (await analysisJobs.requestAnalysisJob({
      ownerId: user.id,
      roleplaySessionId: sessionId,
    }));
  const [acceptedRecordings, sourceResults] = await Promise.all([
    recordings.findManyByRoleplaySessionId(sessionId),
    analysisJobs.findResultsByJobId(job.id),
  ]);
  const audioByLineId = await createRoleplayAudioByLineId(storage, acceptedRecordings);

  return {
    session,
    job,
    sourceResults,
    audioByLineId,
  };
}
