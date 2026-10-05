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
export function grammarSessionErrorMessage(error: unknown): string {
  if (!(error instanceof GrammarSessionError))
    return "연습을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  const messages = {
    INVALID_INPUT: "연습 입력을 확인해 주세요.",
    NOT_FOUND: "연습을 찾을 수 없습니다.",
    CONFLICT: "다른 화면에서 연습이 변경되었습니다. 연습을 다시 열어 주세요.",
    INCOMPLETE: "모든 문항에 답한 뒤 완료해 주세요.",
    UNAUTHORIZED: "로그인 후 다시 시도해 주세요.",
    FAILED: "연습을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  };
  return messages[error.code];
}
