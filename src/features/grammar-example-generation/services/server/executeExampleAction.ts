import "server-only";
import { GrammarNotePersistenceError, GrammarNoteRepository } from "@/entities/grammar-note";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import type { ExampleDependencies, ExampleResult } from "../../models/interface";
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
        const client = await createSupabaseServerClient();
        const { data: auth, error } = await client.auth.getUser();
        if (error || !auth.user) throw new GrammarNotePersistenceError("UNAUTHORIZED");
        return execute({
          repository: new GrammarNoteRepository(client),
          generate: requestExampleOutput,
          consumeRequest: async () => {
            const { data, error: quotaError } = await client.rpc("consume_ai_request", {
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
    const code =
      error instanceof GrammarNotePersistenceError
        ? error.code
        : error instanceof Error
          ? error.message
          : "UNKNOWN";
    const message =
      code === "VERSION_CONFLICT"
        ? "노트가 변경되었습니다. 최신 노트를 불러온 뒤 다시 시도해 주세요."
        : code === "UNAUTHORIZED"
          ? "로그인 후 다시 시도해 주세요."
          : code === "NOT_FOUND"
            ? "노트를 찾을 수 없습니다."
            : code === "rate_limited"
              ? "AI 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요."
              : code === "not_invited"
                ? "AI 기능을 사용할 권한이 없습니다."
                : "예문 작업을 완료하지 못했습니다. 기존 내용은 유지됩니다. 다시 시도해 주세요.";
    return { ok: false, message };
  }
}
