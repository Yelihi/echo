import "server-only";
import { z } from "zod";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import { GrammarSessionError } from "@/entities/grammar-session";
import { GrammarExamError } from "../../models/errors";
import type { GrammarExamErrorCode } from "../../models/interface";
export async function observeExamAction<T>(
  operation: string,
  execute: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; code: GrammarExamErrorCode }> {
  try {
    return {
      ok: true,
      data: await observeOperation({
        operation,
        resourceId: "grammar-exam",
        recordEvent: recordOperationEvent,
        execute,
      }),
    };
  } catch (error) {
    const code =
      error instanceof z.ZodError
        ? "INVALID_INPUT"
        : error instanceof GrammarSessionError || error instanceof GrammarExamError
          ? error.code
          : "FAILED";
    return { ok: false, code };
  }
}
