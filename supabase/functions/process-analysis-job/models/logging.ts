export type AnalysisOperation =
  | "audio.download"
  | "audio.transcribe"
  | "text.evaluate"
  | "result.save";

export interface AnalysisEvent {
  readonly operation: AnalysisOperation;
  readonly phase: "started" | "succeeded" | "failed";
  readonly operationId: string;
  readonly jobId: string;
  readonly targetId: string;
  readonly durationMs?: number;
}

export type RecordAnalysisEvent = (event: AnalysisEvent) => void;

export interface ObserveAnalysisOperationInput<Result> {
  operation: AnalysisOperation;
  jobId: string;
  targetId: string;
  execute: () => Promise<Result>;
  recordEvent?: RecordAnalysisEvent;
}
