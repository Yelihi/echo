import {
  createAnalysisResultDto,
  type AnalysisResultExpectedTargetDto,
} from "@/entities/analysis-job";
import { type MemorizationSession } from "@/entities/memorization-session";
import { PracticeType } from "@/entities/practice-target";
import type {
  AnalysisResultPageViewModel,
  MemorizationResultPageData,
} from "@/views/analysis-result/models";

import { createMeta } from "./meta";
import { mapSourceResults } from "./sourceResult";

export function createMemorizationResultPageViewModel(
  data: MemorizationResultPageData,
): AnalysisResultPageViewModel {
  const { session, job, audioBySentenceId } = data;
  const sentences = flattenSentences(session);
  const expectedTargets: AnalysisResultExpectedTargetDto[] = sentences.map((sentence) => ({
    id: sentence.id,
    original: sentence.text,
    target: {
      practiceType: PracticeType.MEMORIZATION,
      sessionId: session.id,
      sentenceSnapshotId: sentence.id,
    },
    audio: audioBySentenceId.get(sentence.id),
  }));
  const result = createAnalysisResultDto({
    job,
    expectedTargets,
    results: mapSourceResults(data.sourceResults),
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
