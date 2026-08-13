import type { AnalysisResultDto, AnalysisResultItemDto } from "@/entities/analysis-job";
import type { EvaluationDiffSegment } from "@/shared/lib/evaluation";

export type ResultPracticeKind = "roleplay" | "memorization";

export interface ResultTurnViewModel {
  readonly id: string;
  readonly speaker: "partner" | "me";
  readonly text: string;
  readonly analysis?: AnalysisResultItemDto;
}

export interface AnalysisResultPageViewModel {
  readonly kind: ResultPracticeKind;
  readonly title: string;
  readonly meta: string;
  readonly result: AnalysisResultDto;
  readonly turns: ReadonlyArray<ResultTurnViewModel>;
}

export interface AnalysisResultViewProps {
  readonly viewModel: AnalysisResultPageViewModel;
  readonly retryAction: () => Promise<void>;
}

export interface ResultTurnProps {
  readonly turn: ResultTurnViewModel;
}

export interface AnalysisItemProps {
  readonly item: AnalysisResultItemDto;
}

export interface DiffSegmentsProps {
  readonly segments: ReadonlyArray<EvaluationDiffSegment>;
}

export interface ResultAudioPlayPillProps {
  readonly signedUrl: string;
  readonly durationSec?: number;
}
