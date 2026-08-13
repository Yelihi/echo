import type {
  AnalysisJob,
  AnalysisResultAudioDto,
  AnalysisResultDto,
  AnalysisResultItemDto,
  PracticeTargetAnalysisResult,
} from "@/entities/analysis-job";
import type { MemorizationSession } from "@/entities/memorization-session";
import type { RoleplaySession } from "@/entities/roleplay-session";
import type { LineId, SentenceId } from "@/entities/value-object";
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

export interface RoleplayResultPageData {
  readonly session: RoleplaySession;
  readonly job: AnalysisJob;
  readonly sourceResults: ReadonlyArray<PracticeTargetAnalysisResult>;
  readonly audioByLineId: ReadonlyMap<LineId, AnalysisResultAudioDto>;
}

export interface MemorizationResultPageData {
  readonly session: MemorizationSession;
  readonly job: AnalysisJob;
  readonly sourceResults: ReadonlyArray<PracticeTargetAnalysisResult>;
  readonly audioBySentenceId: ReadonlyMap<SentenceId, AnalysisResultAudioDto>;
}
