import type { ExampleErrorCode } from "../models/errors";

export function exampleErrorMessage(code: ExampleErrorCode): string {
  switch (code) {
    case "VERSION_CONFLICT":
      return "노트가 변경되었습니다. 새로고침으로 최신 노트를 불러온 뒤 다시 생성해 주세요. 저장하지 않은 후보는 사라집니다.";
    case "UNAUTHORIZED":
      return "로그인이 필요해 AI 요청을 실행하지 않았습니다. 로그인 페이지에서 다시 로그인해 주세요. 저장하지 않은 후보는 사라집니다.";
    case "NOT_FOUND":
      return "노트를 찾을 수 없어 AI 요청을 실행하지 않았습니다. 노트 목록에서 다시 선택해 주세요. 저장하지 않은 후보는 사라집니다.";
    case "INVALID_INPUT":
      return "요청할 문장이나 노트 정보가 유효하지 않아 AI 요청을 실행하지 않았습니다. 입력을 확인하고 다시 시도해 주세요.";
    case "IDEMPOTENCY_CONFLICT":
      return "이미 저장된 예문과 내용이 달라 요청을 완료하지 못했습니다. 새로고침으로 최신 노트를 확인해 주세요. 저장하지 않은 후보는 사라집니다.";
    case "INVALID_RESPONSE":
      return "요청 결과를 확인할 수 없습니다. 기존 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.";
    case "PERSISTENCE_FAILED":
      return "노트 정보를 불러오거나 저장하지 못했습니다. 기존 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.";
    case "RATE_LIMITED":
      return "AI 요청 한도에 도달했습니다. 잠시 후 다시 시도하거나 수정 취소로 원문을 복원해 저장하세요.";
    case "NOT_INVITED":
      return "이 계정은 AI 기능을 사용할 권한이 없습니다. 수정 중이면 취소해 기존 예문을 저장하거나 노트 목록으로 돌아가 학습을 계속해 주세요.";
    case "GENERATION_FAILED":
      return "예문 또는 직독직해 생성에 실패했습니다. 수정 내용은 유지됩니다. 다시 시도하거나 수정 취소로 원문을 복원해 저장하세요.";
    case "FAILED":
      return "AI 요청을 완료하지 못했습니다. 정확한 원인은 확인되지 않았습니다. 기존 내용은 유지되므로 다시 시도하거나 수정 취소로 원문을 복원해 주세요.";
    case "SAVE_FAILED":
      return "예문을 저장하지 못했습니다. 선택과 수정 내용을 유지했습니다. 다시 저장해 주세요.";
    case "INVALID_SELECTION":
      return "영어 예문은 영어로, 뜻과 어법 설명은 한국어로 입력해 주세요. 직독직해를 다시 생성하거나 수정을 완료한 뒤 예문을 선택해 주세요.";
    default:
      return "예문 작업을 완료하지 못했습니다. 기존 내용은 유지됩니다. 다시 시도하거나 수정 취소로 원문을 복원해 주세요.";
  }
}
