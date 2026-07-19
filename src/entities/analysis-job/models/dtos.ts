import type { AnalysisJobState } from "@/entities/analysis-job/models/enums";
import type { PracticeTarget } from "@/entities/practice-target";
import type { EvaluationDiffSegment } from "@/shared/lib/evaluation";

export type AnalysisResultState = "pending" | "analyzing" | "done" | "partial" | "failed";
export type AnalysisResultItemState = "ready" | "pending" | "missing";
export type AnalysisResultSchemaVersion = "v1";

export interface AnalysisResultAudioDto {
  readonly signedUrl: string;
  readonly durationSec?: number;
}

export interface AnalysisResultJobDto {
  readonly state: AnalysisJobState;
}

export interface AnalysisResultExpectedTargetDto {
  readonly id: string;
  readonly original: string;
  readonly target: PracticeTarget;
  readonly audio?: AnalysisResultAudioDto;
}

export interface AnalysisResultSourceResultDto {
  readonly schemaVersion: AnalysisResultSchemaVersion;
  readonly target: PracticeTarget;
  readonly transcript: string;
  readonly diff: ReadonlyArray<EvaluationDiffSegment>;
  readonly feedback: string;
}

export interface AnalysisResultItemDto extends AnalysisResultExpectedTargetDto {
  readonly state: AnalysisResultItemState;
  readonly schemaVersion?: AnalysisResultSchemaVersion;
  readonly transcript?: string;
  readonly diff?: ReadonlyArray<EvaluationDiffSegment>;
  readonly feedback?: string;
}

export interface AnalysisResultDto {
  readonly state: AnalysisResultState;
  readonly items: ReadonlyArray<AnalysisResultItemDto>;
}

export interface CreateAnalysisResultDtoInput {
  readonly job: AnalysisResultJobDto;
  readonly expectedTargets: ReadonlyArray<AnalysisResultExpectedTargetDto>;
  readonly results: ReadonlyArray<AnalysisResultSourceResultDto>;
}
