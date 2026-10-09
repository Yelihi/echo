import type { GrammarAnalysisErrorCode } from "./interface";

const messages: Record<GrammarAnalysisErrorCode, string> = {
  INVALID_INPUT: "영어 문장과 핵심 어법 설명을 모두 입력해 주세요.",
  INVALID_OUTPUT: "분석 결과를 확인할 수 없습니다. 입력을 유지한 채 다시 분석해 주세요.",
  PROVIDER_FAILED: "분석을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  UNAUTHORIZED: "로그인 후 다시 시도해 주세요.",
  NOT_INVITED: "AI 기능 사용 권한이 필요합니다.",
  RATE_LIMITED: "AI 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
};
export class GrammarAnalysisError extends Error {
  constructor(
    readonly code: GrammarAnalysisErrorCode,
    readonly diagnostics?: {
      stage: string;
      issues: { code: string; path: (string | number)[] }[];
    },
  ) {
    super(messages[code]);
    this.name = "GrammarAnalysisError";
  }
}
export function grammarAnalysisFailure(error: unknown) {
  const failure =
    error instanceof GrammarAnalysisError ? error : new GrammarAnalysisError("PROVIDER_FAILED");
  return { status: "error" as const, code: failure.code, message: failure.message };
}

export function invalidGrammarOutput(
  stage:
    | "precheck.response"
    | "precheck.shape"
    | "precheck.consistency"
    | "precheck.content"
    | "analysis.response"
    | "analysis.shape"
    | "analysis.content",
  issues: readonly { code: string; path: (string | number)[] }[],
) {
  return new GrammarAnalysisError("INVALID_OUTPUT", {
    stage,
    // 메시지·응답 값·알 수 없는 필드명은 기록하지 않는다.
    issues: issues.slice(0, 20).map(({ code, path }) => ({ code, path })),
  });
}
