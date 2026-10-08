"use server";

import { z } from "zod";
import { GrammarSessionRepository, GrammarSessionError } from "@/entities/grammar-session";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import type { GrammarHistoryResult } from "../../models/interface";

export async function getGrammarHistory(noteId: string, page = 1): Promise<GrammarHistoryResult> {
  try {
    return await observeOperation({
      operation: "grammar.history",
      resourceId: "grammar-note",
      recordEvent: recordOperationEvent,

      execute: async () => {
        const id = z.string().uuid().parse(noteId);
        const requestedPage = z.number().int().min(1).max(2147483647).parse(page);
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) throw new GrammarSessionError("UNAUTHORIZED");

        const history = await new GrammarSessionRepository(supabase).findHistory({
          noteId: id,
          page: requestedPage,
          pageSize: 10,
        });

        return { ok: true as const, data: history };
      },
    });
  } catch {
    return { ok: false, code: "LOAD_FAILED" };
  }
}
