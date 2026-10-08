export class GrammarSessionError extends Error {
  constructor(
    readonly code:
      | "INVALID_INPUT"
      | "NOT_FOUND"
      | "CONFLICT"
      | "INCOMPLETE"
      | "UNAUTHORIZED"
      | "FAILED",
  ) {
    super(code);
    this.name = "GrammarSessionError";
  }
}
