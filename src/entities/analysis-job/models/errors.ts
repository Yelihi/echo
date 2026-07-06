import { CustomError, type CustomErrorOptions } from "@/shared/errors";

export class AnalysisJobFetchError extends CustomError {
  constructor(message: string, options: CustomErrorOptions = {}) {
    super("ANALYSIS-001", message, { cause: options.cause });
  }
}

export class AnalysisJobRequestError extends CustomError {
  constructor(options: CustomErrorOptions = {}) {
    super("ANALYSIS-002", "Failed to request analysis job.", {
      cause: options.cause,
    });
  }
}

export class AnalysisJobNotReturnedError extends CustomError {
  constructor(operation: string) {
    super("ANALYSIS-003", `Analysis job was not returned after ${operation}.`);
  }
}

export class AnalysisJobClaimError extends CustomError {
  constructor(options: CustomErrorOptions = {}) {
    super("ANALYSIS-004", "Failed to claim next analysis job.", {
      cause: options.cause,
    });
  }
}

export class AnalysisJobCompleteError extends CustomError {
  constructor(options: CustomErrorOptions = {}) {
    super("ANALYSIS-005", "Failed to complete analysis job.", {
      cause: options.cause,
    });
  }
}

export class AnalysisJobFailError extends CustomError {
  constructor(options: CustomErrorOptions = {}) {
    super("ANALYSIS-006", "Failed to fail analysis job.", {
      cause: options.cause,
    });
  }
}

export class AnalysisJobInvalidRowError extends CustomError {
  constructor(message: string) {
    super("ANALYSIS-007", message);
  }
}
