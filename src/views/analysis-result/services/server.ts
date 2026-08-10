import { notFound } from "next/navigation";

import {
  createAnalysisResultDto,
  createAnalysisJobRepository,
  type AnalysisResultDto,
  type AnalysisResultExpectedTargetDto,
  type AnalysisResultSourceResultDto,
  type PracticeTargetAnalysisResult,
} from "@/entities/analysis-job";
import {
  createAcceptedRecordingRepository,
  type AcceptedRecording,
} from "@/entities/accepted-recording";
import {
  createMemorizationSessionRepository,
  type MemorizationSession,
} from "@/entities/memorization-session";
import { PracticeType } from "@/entities/practice-target";
import { createRoleplaySessionRepository } from "@/entities/roleplay-session";
import type { LineId, SentenceId, SessionId, UserId } from "@/entities/value-object";
import { RecordingStorageService } from "@/shared/lib/recording-storage/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { evaluationResultV1Schema } from "@/shared/lib/evaluation/schema";

export type ResultPracticeKind = "roleplay" | "memorization";

export interface ResultTurnViewModel {
  readonly id: string;
  readonly speaker: "partner" | "me";
  readonly text: string;
  readonly analysis?: AnalysisResultDto["items"][number];
}

export interface AnalysisResultPageViewModel {
  readonly kind: ResultPracticeKind;
  readonly title: string;
  readonly meta: string;
  readonly result: AnalysisResultDto;
  readonly turns: ReadonlyArray<ResultTurnViewModel>;
}

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
    results: sourceResults.map(mapSourceResult).filter(isAnalysisResultSourceResultDto),
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
    results: sourceResults.map(mapSourceResult).filter(isAnalysisResultSourceResultDto),
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

async function requireUser(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  return { id: user.id as UserId };
}

function mapSourceResult(
  result: PracticeTargetAnalysisResult,
): AnalysisResultSourceResultDto | null {
  const parsed = evaluationResultV1Schema.safeParse({
    ...result.feedback,
    transcript: result.transcript,
  });

  if (!parsed.success) {
    return null;
  }

  return {
    schemaVersion: "v1",
    target: result.target,
    transcript: parsed.data.transcript,
    diff: parsed.data.diff,
    feedback: parsed.data.feedback,
  };
}

function isAnalysisResultSourceResultDto(
  result: AnalysisResultSourceResultDto | null,
): result is AnalysisResultSourceResultDto {
  return result !== null;
}

async function createAudioByLineId(
  storage: RecordingStorageService,
  recordings: ReadonlyArray<AcceptedRecording>,
) {
  const entries = await Promise.all(
    recordings.map(async (recording) => {
      if (recording.target.practiceType !== PracticeType.ROLEPLAY) {
        return null;
      }

      return [recording.target.lineSnapshotId, await createAudioDto(storage, recording)] as const;
    }),
  );

  return new Map(
    entries.filter(
      (entry): entry is readonly [LineId, Awaited<ReturnType<typeof createAudioDto>>] =>
        Boolean(entry),
    ),
  );
}

async function createAudioBySentenceId(
  storage: RecordingStorageService,
  recordings: ReadonlyArray<AcceptedRecording>,
) {
  const entries = await Promise.all(
    recordings.map(async (recording) => {
      if (recording.target.practiceType !== PracticeType.MEMORIZATION) {
        return null;
      }

      return [
        recording.target.sentenceSnapshotId,
        await createAudioDto(storage, recording),
      ] as const;
    }),
  );

  return new Map(
    entries.filter(
      (entry): entry is readonly [SentenceId, Awaited<ReturnType<typeof createAudioDto>>] =>
        Boolean(entry),
    ),
  );
}

async function createAudioDto(storage: RecordingStorageService, recording: AcceptedRecording) {
  const { signedUrl } = await storage.createSignedPlaybackUrl(recording.audio.objectPath);

  return {
    signedUrl,
    durationSec:
      recording.audio.durationMs === null
        ? undefined
        : Math.round(recording.audio.durationMs / 1000),
  };
}

function flattenSentences(session: MemorizationSession) {
  return session.paragraphSnapshots.flatMap((paragraph) => paragraph.sentences);
}

function createMeta(date: Date, count: number): string {
  return `${new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)} · 문장 ${count}개`;
}
