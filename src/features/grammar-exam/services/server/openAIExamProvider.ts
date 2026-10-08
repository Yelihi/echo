import "server-only";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIServerClient, getOpenAIEvaluationModel } from "@/shared/lib/openai/server";
import { grammarExamPromptOutputSchema, grammarExamGradeOutputSchema } from "../../models/schema";
import type { GrammarExamProvider } from "../../models/interface";
import { EXAM_CONTEXT_PROMPT, EXAM_FEEDBACK_PROMPT } from "../../config/prompts";
export function createOpenAIExamProvider(): GrammarExamProvider {
  return {
    createPrompts: async (input) => {
      const response = await getOpenAIServerClient().responses.parse(
        {
          model: getOpenAIEvaluationModel(),
          input: [
            { role: "system", content: EXAM_CONTEXT_PROMPT },
            { role: "user", content: JSON.stringify(input) },
          ],
          max_output_tokens: 2400,
          text: { format: zodTextFormat(grammarExamPromptOutputSchema, "grammar_exam_contexts") },
        },
        { timeout: 60000, maxRetries: 0 },
      );
      return response.output_parsed;
    },
    grade: async (input) => {
      const response = await getOpenAIServerClient().responses.parse(
        {
          model: getOpenAIEvaluationModel(),
          input: [
            { role: "system", content: EXAM_FEEDBACK_PROMPT },
            { role: "user", content: JSON.stringify(input) },
          ],
          max_output_tokens: 1800,
          text: { format: zodTextFormat(grammarExamGradeOutputSchema, "grammar_exam_feedback") },
        },
        { timeout: 60000, maxRetries: 0 },
      );
      return response.output_parsed;
    },
  };
}
