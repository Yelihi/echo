export class GrammarExamError extends Error {
  constructor(
    readonly code: "INVALID_INPUT" | "NOT_READY" | "RATE_LIMITED" | "NOT_INVITED" | "FAILED",
  ) {
    super(code);
    this.name = "GrammarExamError";
  }
}
