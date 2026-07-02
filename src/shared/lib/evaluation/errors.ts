import { CustomError, type CustomErrorOptions } from "@/shared/errors";
import type { EvaluationMode, EvaluationPracticeType } from "@/shared/lib/evaluation/types";

export class UnsupportedEvaluationModeError extends CustomError {
  constructor(practiceType: EvaluationPracticeType, mode: EvaluationMode) {
    super("EVAL-001", `Unsupported evaluation mode: ${practiceType}:${mode}.`);
  }
}

export class EvaluationProviderInvalidResponseError extends CustomError {
  constructor(options: CustomErrorOptions = {}) {
    super("EVAL-002", "Evaluation provider returned an invalid response.", {
      cause: options.cause,
    });
  }
}

export class EvaluationProviderFailedError extends CustomError {
  constructor(options: CustomErrorOptions = {}) {
    super("EVAL-003", "Evaluation provider failed.", {
      cause: options.cause,
    });
  }
}
