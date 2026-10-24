export interface OperationEvent {
  readonly operation: string;
  readonly phase: "started" | "succeeded" | "failed" | "canceled";
  readonly operationId: string;
  readonly resourceId: string;
  readonly durationMs?: number;
  readonly stage?: string;
  readonly error?: ReturnType<typeof import("../safeErrorDetails").safeErrorDetails>;
}

export type RecordOperationEvent = (event: OperationEvent) => void;

export interface ObserveOperationInput<Result> {
  readonly operation: string;
  readonly resourceId: string;
  readonly recordEvent: RecordOperationEvent;
  readonly execute: () => Promise<Result>;
  readonly operationId?: string;
  readonly getStage?: () => string;
}
export interface OperationRecorderOptions {
  print?: boolean;
}
export interface OperationEventRecorder {
  events: OperationEvent[];
  recordEvent: RecordOperationEvent;
}
