import "server-only";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIEvaluationModel, getOpenAIServerClient } from "@/shared/lib/openai/server";
import type { GrammarSource } from "@/entities/grammar-note";
import type { GrammarAnalysisProvider } from "../../models/interface";
import { analysisOutputSchema, precheckOutputSchema } from "../../models/providerSchema";
import { GRAMMAR_ANALYSIS_PROMPT, GRAMMAR_PRECHECK_PROMPT } from "../../config/prompts";

export function createOpenAIGrammarProvider(): GrammarAnalysisProvider {
  const requestInput = (prompt: string, source: GrammarSource) => [
    { role: "system" as const, content: prompt },
    {
      role: "user" as const,
      content: JSON.stringify({ sentence: source.sentence, learningNote: source.learningNote }),
    },
  ];
  return {
    precheck: async (source) => {
      const response = await getOpenAIServerClient().responses.parse(
        {
          model: getOpenAIEvaluationModel(),
          input: requestInput(GRAMMAR_PRECHECK_PROMPT, source),
          max_output_tokens: 1800,
          text: { format: zodTextFormat(precheckOutputSchema, "grammar_precheck") },
        },
        { timeout: 60000, maxRetries: 0 },
      );
      return response.output_parsed;
    },
    analyze: async (source) => {
      const response = await getOpenAIServerClient().responses.parse(
        {
          model: getOpenAIEvaluationModel(),
          input: requestInput(GRAMMAR_ANALYSIS_PROMPT, source),
          max_output_tokens: 8000,
          text: { format: zodTextFormat(analysisOutputSchema, "grammar_analysis") },
        },
        { timeout: 60000, maxRetries: 0 },
      );
      return response.output_parsed;
    },
  };
}
