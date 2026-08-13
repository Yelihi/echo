import { notFound } from "next/navigation";

import {
  createAnalysisJobRepository,
  createAnalysisResultDto,
  type AnalysisResultExpectedTargetDto,
} from "@/entities/analysis-job";
import { createAcceptedRecordingRepository } from "@/entities/accepted-recording";
import {
  createMemorizationSessionRepository,
  SessionState as MemorizationSessionState,
  type MemorizationSession,
} from "@/entities/memorization-session";
import { PracticeType } from "@/entities/practice-target";
import type { SessionId } from "@/entities/value-object";
import { RecordingStorageService } from "@/shared/lib/recording-storage/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import type { AnalysisResultPageViewModel } from "@/views/analysis-result/models";

import { requireUser } from "./auth";
import { createAudioBySentenceId } from "./audio";
import { createMeta } from "./meta";
import { mapSourceResults } from "./sourceResult";

export async function getMemorizationResultPageViewModel(
  sessionId: SessionId,
): Promise<AnalysisResultPageViewModel> {
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
  const audioBySentenceId = await createAudioBySentenceId(storage, acceptedRecordings);
  const sentences = flattenSentences(session);
  const expectedTargets: AnalysisResultExpectedTargetDto[] = sentences.map((sentence) => ({
    id: sentence.id,
    original: sentence.text,
    target: {
      practiceType: PracticeType.MEMORIZATION,
      sessionId,
      sentenceSnapshotId: sentence.id,
    },
    audio: audioBySentenceId.get(sentence.id),
  }));
  const result = createAnalysisResultDto({
    job,
    expectedTargets,
    results: mapSourceResults(sourceResults),
  });
  const itemsById = new Map(result.items.map((item) => [item.id, item]));

  return {
    kind: "memorization",
    title: session.materialTitleSnapshot,
    meta: createMeta(session.completedAt ?? session.updatedAt, sentences.length),
    result,
    turns: sentences.map((sentence) => ({
      id: sentence.id,
      speaker: "me",
      text: sentence.text,
      analysis: itemsById.get(sentence.id),
    })),
  };
}

function flattenSentences(session: MemorizationSession) {
  return session.paragraphSnapshots.flatMap((paragraph) => paragraph.sentences);
}
