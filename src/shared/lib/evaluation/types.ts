export type EvaluationPracticeType = "roleplay" | "memorization";
export type EvaluationMode = "exact" | "context";
export type EvaluationProviderName = "openai";
export type EvaluationDiffOperation = "equal" | "insert" | "delete" | "replace";

export interface EvaluationDiffSegment {
  readonly op: EvaluationDiffOperation;
  readonly expected?: string;
  readonly actual?: string;
}

export interface EvaluationResultV1 {
  readonly schema_version: "v1";
  readonly transcript: string;
  readonly diff: ReadonlyArray<EvaluationDiffSegment>;
  readonly feedback: string;
  readonly score?: number;
}

export interface EvaluationExpectedSnapshot {
  readonly text: string;
  readonly context?: string;
}

export interface EvaluationRequest {
  readonly practiceType: EvaluationPracticeType;
  readonly mode: EvaluationMode;
  readonly expected: EvaluationExpectedSnapshot;
  readonly transcript: string;
}

export type DiffProviderInput = EvaluationRequest;

export type EvaluationProviderInput = EvaluationRequest;

export interface EvaluationFeedbackResult {
  readonly provider: EvaluationProviderName;
  readonly model: string;
  readonly feedback: string;
  readonly score?: number;
}

export interface DiffProvider {
  createDiff(input: DiffProviderInput): Promise<ReadonlyArray<EvaluationDiffSegment>>;
}

export interface EvaluationProvider {
  evaluate(input: EvaluationProviderInput): Promise<EvaluationFeedbackResult>;
}

export type EvaluationProviderKey = Pick<EvaluationRequest, "practiceType" | "mode">;

export interface EvaluationProviderEntry {
  readonly diffProvider: DiffProvider;
  readonly evaluationProvider: EvaluationProvider;
}

export interface EvaluationProviderRegistry {
  resolve(key: EvaluationProviderKey): EvaluationProviderEntry;
}
