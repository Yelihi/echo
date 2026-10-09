"use server";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import { GrammarAnalysisError, grammarAnalysisFailure } from "../../models/errors";
import type { GrammarAnalysisResult } from "../../models/interface";
import { analyzeGrammar } from "../analyzeGrammar";
import { createOpenAIGrammarProvider } from "../server/openAIGrammarProvider";

export async function requestGrammarAnalysis(input: unknown): Promise<GrammarAnalysisResult> {
  let failure: GrammarAnalysisError | undefined;

  try {
    return await observeOperation({
      operation: "grammar.analyze",
      resourceId: "grammar-source",
      recordEvent: (event) =>
        recordOperationEvent(event, event.phase === "failed" ? failure?.diagnostics : undefined),
      execute: async () => {
        try {
          const supabase = await createSupabaseServerClient();
          const { data, error } = await supabase.auth.getUser();
          if (error || !data.user) throw new GrammarAnalysisError("UNAUTHORIZED");
          return await analyzeGrammar(input, {
            provider: createOpenAIGrammarProvider(),
            consumeRequest: async () => {
              const { data: permission, error: quotaError } = await supabase.rpc(
                "consume_ai_request",
                { p_operation: "analysis" },
              );
              if (quotaError) throw new GrammarAnalysisError("PROVIDER_FAILED");
              if (
                permission === "allowed" ||
                permission === "not_invited" ||
                permission === "rate_limited"
              )
                return permission;
              throw new GrammarAnalysisError("PROVIDER_FAILED");
            },
          });
        } catch (error) {
          if (error instanceof GrammarAnalysisError) failure = error;
          throw error;
        }
      },
    });
  } catch (error) {
    return grammarAnalysisFailure(error);
  }
}
