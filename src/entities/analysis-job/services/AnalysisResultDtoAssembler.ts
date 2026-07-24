import { AnalysisJobState } from "@/entities/analysis-job/models/enums";
import type {
  AnalysisResultDto,
  AnalysisResultExpectedTargetDto,
  AnalysisResultItemDto,
  AnalysisResultSourceResultDto,
  AnalysisResultState,
  CreateAnalysisResultDtoInput,
} from "@/entities/analysis-job/models/dtos";
import { PracticeType, type PracticeTarget } from "@/entities/practice-target";

export function createAnalysisResultDto(input: CreateAnalysisResultDtoInput): AnalysisResultDto {
  const resultsByTarget = new Map(
    input.results.map((result) => [targetKey(result.target), result]),
  );

  return {
    state: mapAnalysisResultState(
      input.job.state,
      input.expectedTargets.length,
      input.results.length,
    ),
    items: input.expectedTargets.map((expectedTarget) =>
      mapAnalysisResultItemDto(
        expectedTarget,
        resultsByTarget.get(targetKey(expectedTarget.target)),
        input.job.state,
      ),
    ),
  };
}

export function mapAnalysisResultState(
  jobState: AnalysisJobState,
  expectedTargetCount: number,
  resultCount: number,
): AnalysisResultState {
  if (jobState === AnalysisJobState.QUEUED) {
    return "pending";
  }

  if (jobState === AnalysisJobState.PROCESSING) {
    return "analyzing";
  }

  if (jobState === AnalysisJobState.COMPLETED) {
    return resultCount >= expectedTargetCount ? "done" : "partial";
  }

  if (jobState === AnalysisJobState.FAILED && resultCount > 0) {
    return "partial";
  }

  return "failed";
}

function mapAnalysisResultItemDto(
  expectedTarget: AnalysisResultExpectedTargetDto,
  result: AnalysisResultSourceResultDto | undefined,
  jobState: AnalysisJobState,
): AnalysisResultItemDto {
  if (!result) {
    return {
      ...expectedTarget,
      state:
        jobState === AnalysisJobState.QUEUED || jobState === AnalysisJobState.PROCESSING
          ? "pending"
          : "missing",
    };
  }

  return {
    ...expectedTarget,
    state: "ready",
    schemaVersion: result.schemaVersion,
    transcript: result.transcript,
    diff: result.diff,
    feedback: result.feedback,
  };
}

function targetKey(target: PracticeTarget): string {
  if (target.practiceType === PracticeType.ROLEPLAY) {
    return `roleplay:${target.lineSnapshotId}`;
  }

  return `memorization:${target.sentenceSnapshotId}`;
}
