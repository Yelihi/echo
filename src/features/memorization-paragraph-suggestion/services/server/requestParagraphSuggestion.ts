import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import {
  buildParagraphSuggestionPrompt,
  PARAGRAPH_SUGGESTION_SYSTEM_PROMPT,
} from "@/features/memorization-paragraph-suggestion/config/prompt";
import type { RequestParagraphSuggestionInput } from "@/features/memorization-paragraph-suggestion/models/interface";
import { openAIMemorizationParagraphSuggestionOutputSchema } from "@/features/memorization-paragraph-suggestion/models/schema";

export async function requestParagraphSuggestion(
  input: RequestParagraphSuggestionInput,
): Promise<unknown> {
  const response = await input.client.responses.parse({
    model: input.model,
    input: [
      {
        role: "system",
        content: PARAGRAPH_SUGGESTION_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildParagraphSuggestionPrompt(input.text),
      },
    ],
    text: {
      format: zodTextFormat(
        openAIMemorizationParagraphSuggestionOutputSchema,
        "memorization_paragraph_suggestion",
      ),
    },
  });

  return response.output_parsed;
}
