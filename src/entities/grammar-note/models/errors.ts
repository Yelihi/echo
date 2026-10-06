export type GrammarNotePersistenceErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VERSION_CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "INVALID_RESPONSE"
  | "PERSISTENCE_FAILED";

/** 소비자는 code를 UI 문구로 변환한다. 원래 오류는 내부 로깅용 cause에만 보존한다. */
export class GrammarNotePersistenceError extends Error {
  constructor(
    readonly code: GrammarNotePersistenceErrorCode,
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = "GrammarNotePersistenceError";
  }
}
