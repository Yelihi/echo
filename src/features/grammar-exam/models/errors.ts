export class GrammarExamError extends Error {
  constructor(
    readonly code: "INVALID_INPUT" | "NOT_READY" | "RATE_LIMITED" | "NOT_INVITED" | "FAILED",
  ) {
    super(code);
    this.name = "GrammarExamError";
  }
}
export function grammarExamErrorMessage(error: unknown) {
  if (!(error instanceof GrammarExamError))
    return "시험을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  const messages = {
    INVALID_INPUT: "시험 입력을 확인해 주세요.",
    NOT_READY: "시험을 완료한 뒤 피드백을 받을 수 있습니다.",
    RATE_LIMITED: "AI 사용 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
    NOT_INVITED: "AI 기능 이용 권한을 확인해 주세요.",
    FAILED: "AI 응답을 처리하지 못했습니다. 다시 시도해 주세요.",
  };
  return messages[error.code];
}
