import { UnsupportedEvaluationModeError } from "@/shared/lib/evaluation/errors";
import type { EvaluationMode, EvaluationPracticeType } from "@/shared/lib/evaluation/types";

export interface EvaluationSupportKey {
  readonly practiceType: EvaluationPracticeType;
  readonly mode: EvaluationMode;
}

export function isSupportedEvaluationRequest(key: EvaluationSupportKey): boolean {
  if (key.practiceType === "roleplay") {
    return key.mode === "exact" || key.mode === "context";
  }

  return key.mode === "exact";
}

export function assertSupportedEvaluationRequest(key: EvaluationSupportKey): void {
  if (!isSupportedEvaluationRequest(key)) {
    throw new UnsupportedEvaluationModeError(key.practiceType, key.mode);
  }
}
