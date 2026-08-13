import {
  createAnalysisResultDto,
  type AnalysisResultExpectedTargetDto,
} from "@/entities/analysis-job";
import { PracticeType } from "@/entities/practice-target";
import type {
  AnalysisResultPageViewModel,
  RoleplayResultPageData,
} from "@/views/analysis-result/models";

import { createMeta } from "./meta";
import { mapSourceResults } from "./sourceResult";

export function createRoleplayResultPageViewModel(
  data: RoleplayResultPageData,
): AnalysisResultPageViewModel {
  const { session, job, audioByLineId } = data;
  const expectedTargets: AnalysisResultExpectedTargetDto[] = session.lineSnapshots
    .filter((line) => line.speakerOrder === session.selectedLearnerSpeakerOrder)
    .map((line) => ({
      id: line.id,
      original: line.text,
      target: {
        practiceType: PracticeType.ROLEPLAY,
        sessionId: session.id,
        lineSnapshotId: line.id,
      },
      audio: audioByLineId.get(line.id),
    }));
  const result = createAnalysisResultDto({
    job,
    expectedTargets,
    results: mapSourceResults(data.sourceResults),
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
