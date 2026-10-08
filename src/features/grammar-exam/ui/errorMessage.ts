import { grammarSessionErrorMessage } from "@/entities/grammar-session";
import type { GrammarExamErrorCode } from "../models/interface";

export function grammarExamErrorMessage(code: GrammarExamErrorCode): string {
  switch (code) {
    case "INVALID_INPUT":
      return "시험 입력을 확인해 주세요.";
    case "NOT_READY":
      return "시험을 완료한 뒤 피드백을 받을 수 있습니다.";
    case "RATE_LIMITED":
      return "AI 사용 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.";
    case "NOT_INVITED":
      return "AI 기능 이용 권한을 확인해 주세요.";
    case "FAILED":
      return "시험을 처리하지 못했습니다. 입력을 유지한 채 다시 시도해 주세요.";
    default:
      return grammarSessionErrorMessage(code);
  }
}
