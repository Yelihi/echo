import { notFound } from "next/navigation";

import {
  createAnalysisJobRepository,
  createAnalysisResultDto,
  type AnalysisResultExpectedTargetDto,
} from "@/entities/analysis-job";
import { createAcceptedRecordingRepository } from "@/entities/accepted-recording";
import { PracticeType } from "@/entities/practice-target";
import {
  createRoleplaySessionRepository,
  SessionState as RoleplaySessionState,
} from "@/entities/roleplay-session";
import type { SessionId } from "@/entities/value-object";
import { RecordingStorageService } from "@/shared/lib/recording-storage/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { AnalysisResultPageViewModel } from "@/views/analysis-result/models";

import { requireUser } from "./auth";
import { createAudioByLineId } from "./audio";
import { createMeta } from "./meta";
import { mapSourceResults } from "./sourceResult";

export async function getRoleplayResultPageViewModel(
  sessionId: SessionId,
): Promise<AnalysisResultPageViewModel> {
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
  const audioByLineId = await createAudioByLineId(storage, acceptedRecordings);
  const expectedTargets: AnalysisResultExpectedTargetDto[] = session.lineSnapshots
    .filter((line) => line.speakerOrder === session.selectedLearnerSpeakerOrder)
    .map((line) => ({
      id: line.id,
      original: line.text,
      target: {
        practiceType: PracticeType.ROLEPLAY,
        sessionId,
        lineSnapshotId: line.id,
      },
      audio: audioByLineId.get(line.id),
    }));
  const result = createAnalysisResultDto({
    job,
    expectedTargets,
    results: mapSourceResults(sourceResults),
  });
  const itemsById = new Map(result.items.map((item) => [item.id, item]));

  return {
    kind: "roleplay",
    title: session.materialTitleSnapshot,
    meta: createMeta(session.completedAt ?? session.updatedAt, session.lineSnapshots.length),
    result,
    turns: session.lineSnapshots.map((line) => ({
      id: line.id,
      speaker: line.speakerOrder === session.selectedLearnerSpeakerOrder ? "me" : "partner",
      text: line.text,
      analysis: itemsById.get(line.id),
    })),
  };
}
