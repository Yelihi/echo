import { GrammarNotePersistenceError } from "@/entities/grammar-note";
import type { GrammarNotePersistenceErrorCode } from "@/entities/grammar-note";

export type ExampleErrorCode =
  | GrammarNotePersistenceErrorCode
  | "NOT_INVITED"
  | "RATE_LIMITED"
  | "FAILED"
  | "GENERATION_FAILED"
  | "SAVE_FAILED"
  | "INVALID_SELECTION";

export function grammarExampleErrorCode(error: unknown): ExampleErrorCode {
  if (error instanceof GrammarNotePersistenceError) return error.code;

  if (error instanceof Error && error.message === "not_invited") return "NOT_INVITED";

  if (error instanceof Error && error.message === "rate_limited") return "RATE_LIMITED";

  return "FAILED";
}
