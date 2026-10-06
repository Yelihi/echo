import { GrammarNotePersistenceError } from "@/entities/grammar-note";

const messages = new Map<string, string>([
  ["VERSION_CONFLICT", "노트가 변경되었습니다. 최신 노트를 불러온 뒤 다시 시도해 주세요."],
  ["UNAUTHORIZED", "로그인 후 다시 시도해 주세요."],
  ["NOT_FOUND", "노트를 찾을 수 없습니다."],
  ["rate_limited", "AI 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요."],
  ["not_invited", "AI 기능을 사용할 권한이 없습니다."],
]);

export function grammarExampleErrorMessage(error: unknown): string {
  const code =
    error instanceof GrammarNotePersistenceError
      ? error.code
      : error instanceof Error
        ? error.message
        : "UNKNOWN";
  return (
    messages.get(code) ??
    "예문 작업을 완료하지 못했습니다. 기존 내용은 유지됩니다. 다시 시도해 주세요."
  );
}
