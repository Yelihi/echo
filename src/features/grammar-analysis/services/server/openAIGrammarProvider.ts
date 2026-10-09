import "server-only";
import { ZodError } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIEvaluationModel, getOpenAIServerClient } from "@/shared/lib/openai/server";
import type { GrammarSource } from "@/entities/grammar-note";
import type { GrammarAnalysisProvider } from "../../models/interface";
import { invalidGrammarOutput } from "../../models/errors";
import { analysisOutputSchema, precheckOutputSchema } from "../../models/schema";
import { GRAMMAR_ANALYSIS_PROMPT, GRAMMAR_PRECHECK_PROMPT } from "../../config/prompts";

export function createOpenAIGrammarProvider(): GrammarAnalysisProvider {
  const requestInput = (prompt: string, source: GrammarSource, withSpans = false) => [
    { role: "system" as const, content: prompt },
    {
      role: "user" as const,
      content: JSON.stringify({
        sentence: source.sentence,
        learningNote: source.learningNote,
        ...(withSpans
          ? {
              sentenceLength: source.sentence.length,
              sourceSpans: Array.from(source.sentence.matchAll(/\s*\S+\s*/gu), (match) => ({
                text: match[0],
                start: match.index,
                end: match.index + match[0].length,
              })),
            }
          : {}),
      }),
    },
  ];
  return {
    precheck: async (source) => {
      const response = await getOpenAIServerClient()
        .responses.parse(
          {
            model: getOpenAIEvaluationModel(),
            input: requestInput(GRAMMAR_PRECHECK_PROMPT, source),
            max_output_tokens: 1800,
            text: { format: zodTextFormat(precheckOutputSchema, "grammar_precheck") },
          },
          { timeout: 60000, maxRetries: 0 },
        )
        .catch((error: unknown) => {
          if (error instanceof ZodError) throw invalidGrammarOutput("precheck.shape", error.issues);
          throw error;
        });

      if (response.status !== "completed" || response.output_parsed === null) {
        throw invalidGrammarOutput("precheck.response", [
          {
            code: response.status === "completed" ? "empty_output" : "incomplete_response",
            path: [],
          },
        ]);
      }

      return response.output_parsed;
    },
    analyze: async (source) => {
      const response = await getOpenAIServerClient()
        .responses.parse(
          {
            model: getOpenAIEvaluationModel(),
            input: requestInput(GRAMMAR_ANALYSIS_PROMPT, source, true),
            max_output_tokens: 8000,
            text: { format: zodTextFormat(analysisOutputSchema, "grammar_analysis") },
          },
          { timeout: 60000, maxRetries: 0 },
        )
        .catch((error: unknown) => {
          if (error instanceof ZodError) throw invalidGrammarOutput("analysis.shape", error.issues);
          throw error;
        });

      if (response.status !== "completed" || response.output_parsed === null) {
        throw invalidGrammarOutput("analysis.response", [
          {
            code: response.status === "completed" ? "empty_output" : "incomplete_response",
            path: [],
          },
        ]);
      }

      return response.output_parsed;
    },
  };
}
