import "server-only";
import { GrammarNotePersistenceError, GrammarNoteRepository } from "@/entities/grammar-note";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import type { ExampleDependencies, ExampleResult } from "../../models/interface";
import { grammarExampleErrorCode } from "../../models/errors";
import { requestExampleOutput } from "./requestExampleOutput";

export async function executeExampleAction<T>(
  operation: string,
  execute: (dependencies: ExampleDependencies) => Promise<T>,
): Promise<ExampleResult<T>> {
  try {
    const data = await observeOperation({
      operation,
      resourceId: "grammar-note",
      recordEvent: recordOperationEvent,

      execute: async () => {
        const supabase = await createSupabaseServerClient();
        const { data: auth, error } = await supabase.auth.getUser();

        if (error || !auth.user) throw new GrammarNotePersistenceError("UNAUTHORIZED");

        return execute({
          repository: new GrammarNoteRepository(supabase),
          generate: requestExampleOutput,

          consumeRequest: async () => {
            const { data, error: quotaError } = await supabase.rpc("consume_ai_request", {
              p_operation: "analysis",
            });

            if (
              quotaError ||
              (data !== "allowed" && data !== "not_invited" && data !== "rate_limited")
            )
              throw new Error("QUOTA_FAILED");

            return data;
          },
        });
      },
    });

    return { ok: true, data };
  } catch (error) {
    return { ok: false, code: grammarExampleErrorCode(error) };
  }
}
