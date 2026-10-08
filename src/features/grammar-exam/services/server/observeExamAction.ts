import "server-only";
import { z } from "zod";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import { GrammarSessionError, grammarSessionErrorMessage } from "@/entities/grammar-session";
import { GrammarExamError, grammarExamErrorMessage } from "../../models/errors";
export async function observeExamAction<T>(
  operation: string,
  execute: () => Promise<T>,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
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
    const message =
      error instanceof GrammarSessionError
        ? grammarSessionErrorMessage(error)
        : grammarExamErrorMessage(
            error instanceof z.ZodError ? new GrammarExamError("INVALID_INPUT") : error,
          );
    return { ok: false, message };
  }
}
