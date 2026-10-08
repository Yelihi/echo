"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import {
  GrammarSessionRepository,
  GrammarSessionError,
  startGrammarSessionSchema,
  saveGrammarAnswersSchema,
  completeGrammarSessionSchema,
} from "@/entities/grammar-session";
import type { GrammarSession, GrammarSessionRepositoryPort } from "@/entities/grammar-session";
import type { GrammarSessionResult } from "../../models/interface";

async function executeSessionAction(
  operation: string,
  execute: (repository: GrammarSessionRepositoryPort) => Promise<GrammarSession>,
): Promise<GrammarSessionResult> {
  try {
    return await observeOperation({
      operation,
      resourceId: "grammar-session",
      recordEvent: recordOperationEvent,

      execute: async () => {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) throw new GrammarSessionError("UNAUTHORIZED");

        return { ok: true as const, data: await execute(new GrammarSessionRepository(supabase)) };
      },
    });
  } catch (error) {
    return {
      ok: false,
      code:
        error instanceof z.ZodError
          ? "INVALID_INPUT"
          : error instanceof GrammarSessionError
            ? error.code
            : "FAILED",
    };
  }
}

export async function startGrammarSession(input: unknown): Promise<GrammarSessionResult> {
  return executeSessionAction("grammar.session.start", (repository) =>
    repository.start(startGrammarSessionSchema.parse(input)),
  );
}

export async function saveGrammarSessionAnswers(input: unknown): Promise<GrammarSessionResult> {
  return executeSessionAction("grammar.session.save", (repository) =>
    repository.saveAnswers(saveGrammarAnswersSchema.parse(input)),
  );
}

export async function completeGrammarSession(input: unknown): Promise<GrammarSessionResult> {
  return executeSessionAction("grammar.session.complete", (repository) =>
    repository.complete(completeGrammarSessionSchema.parse(input)),
  );
}
