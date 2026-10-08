import type { ExampleErrorCode } from "../models/errors";

export function exampleErrorMessage(code: ExampleErrorCode): string {
  switch (code) {
    case "VERSION_CONFLICT":
      return "노트가 변경되었습니다. 최신 노트를 불러온 뒤 다시 시도해 주세요.";
    case "UNAUTHORIZED":
      return "로그인 후 다시 시도해 주세요.";
    case "NOT_FOUND":
      return "노트를 찾을 수 없습니다.";
    case "RATE_LIMITED":
      return "AI 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.";
    case "NOT_INVITED":
      return "AI 기능을 사용할 권한이 없습니다.";
    case "GENERATION_FAILED":
      return "예문 생성에 실패했습니다. 기존 후보를 유지했으니 다시 생성해 주세요.";
    case "SAVE_FAILED":
      return "예문을 저장하지 못했습니다. 선택과 수정 내용을 유지했습니다. 다시 저장해 주세요.";
    case "INVALID_SELECTION":
      return "저장할 예문을 선택하고 문장·뜻·어법 설명을 모두 입력해 주세요.";
    default:
      return "예문 작업을 완료하지 못했습니다. 기존 내용은 유지됩니다. 다시 시도해 주세요.";
  }
}
