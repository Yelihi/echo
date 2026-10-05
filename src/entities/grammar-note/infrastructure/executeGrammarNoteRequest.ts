import type { PostgrestError } from "@supabase/supabase-js";
import { GrammarNotePersistenceError } from "../models/persistenceError";
import type { GrammarNotePersistenceErrorCode } from "../models/persistenceError";

const rpcErrors = new Map<string, GrammarNotePersistenceErrorCode>([
  ["GRAMMAR_NOTE_INVALID_INPUT", "INVALID_INPUT"],
  ["GRAMMAR_NOTE_UNAUTHORIZED", "UNAUTHORIZED"],
  ["GRAMMAR_NOTE_NOT_FOUND", "NOT_FOUND"],
  ["GRAMMAR_NOTE_VERSION_CONFLICT", "VERSION_CONFLICT"],
  ["GRAMMAR_NOTE_IDEMPOTENCY_CONFLICT", "IDEMPOTENCY_CONFLICT"],
]);

/** DB 오류와 네트워크 예외를 같은 계약으로 전파한다. 로깅/표시는 요청 경계와 UI가 담당한다. */
export async function executeGrammarNoteRequest<T>(
  request: () => PromiseLike<{ data: unknown; error: PostgrestError | null }>,
  convert: (data: unknown) => T,
): Promise<T> {
  try {
    const { data, error } = await request();
    if (error) {
      const code = error.code === "P0001" ? rpcErrors.get(error.message) : undefined;
      throw new GrammarNotePersistenceError(code ?? "PERSISTENCE_FAILED", { cause: error });
    }
    return convert(data);
  } catch (error) {
    if (error instanceof GrammarNotePersistenceError) throw error;
    throw new GrammarNotePersistenceError("PERSISTENCE_FAILED", { cause: error });
  }
}
