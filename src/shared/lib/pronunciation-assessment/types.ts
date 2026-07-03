export type PronunciationAssessmentProviderName = "noop";
export type PronunciationAssessmentUnavailableReason = "mvp_non_goal";

export interface PronunciationAssessmentInput {
  readonly audio: Blob | Uint8Array | ArrayBuffer;
  readonly filename: string;
  readonly mimeType: string;
}

export interface PronunciationAssessmentUnavailableResult {
  readonly provider: PronunciationAssessmentProviderName;
  readonly status: "unavailable";
  readonly reason: PronunciationAssessmentUnavailableReason;
}

export type PronunciationAssessmentResult = PronunciationAssessmentUnavailableResult;

export interface PronunciationAssessmentProvider {
  assess(input: PronunciationAssessmentInput): Promise<PronunciationAssessmentResult>;
}
