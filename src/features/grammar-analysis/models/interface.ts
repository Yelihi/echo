import type {
  GrammarMetadata,
  GrammarSource,
  PrecheckResult,
  SentenceAnalysis,
} from "@/entities/grammar-note";

export interface GrammarAnalysisOutput {
  readonly metadata: GrammarMetadata;
  readonly analysis: SentenceAnalysis;
}
export type GrammarAnalysisResult =
  | { readonly status: "analyzed"; readonly data: GrammarAnalysisOutput }
  | {
      readonly status: "needs-input";
      readonly precheck: Exclude<PrecheckResult, { status: "passed" }>;
    }
  | { readonly status: "error"; readonly code: GrammarAnalysisErrorCode; readonly message: string };

export type GrammarAnalysisErrorCode =
  | "INVALID_INPUT"
  | "INVALID_OUTPUT"
  | "PROVIDER_FAILED"
  | "UNAUTHORIZED"
  | "NOT_INVITED"
  | "RATE_LIMITED";

export interface GrammarAnalysisProvider {
  precheck: (source: GrammarSource) => Promise<unknown>;
  analyze: (source: GrammarSource) => Promise<unknown>;
}
export interface GrammarAnalysisDependencies {
  provider: GrammarAnalysisProvider;
  /** Called before EACH external generation, using existing authenticated quotas. */
  consumeRequest: () => Promise<"allowed" | "not_invited" | "rate_limited">;
}
export type AnalysisRequestState =
  | { status: "idle" }
  | { status: "pending"; sourceRevision: number }
  | { status: "settled"; result: GrammarAnalysisResult; sourceRevision: number };

export interface GrammarAnalysisController {
  getState: () => AnalysisRequestState;
  subscribe: (listener: () => void) => () => void;
  request: (source: GrammarSource) => Promise<void>;
  cancel: () => void;
}
