import "server-only";

import { zodTextFormat } from "openai/helpers/zod";

import { openAIMemorizationParagraphSuggestionOutputSchema } from "@/features/memorization-paragraph-suggestion/models/schema";
import { buildParagraphSuggestionPrompt } from "@/features/memorization-paragraph-suggestion/services/server/prompt";

export interface MemorizationParagraphSuggestionOpenAIClient {
  readonly responses: {
    parse(body: unknown): Promise<{ readonly output_parsed: unknown }>;
  };
}

export interface RequestParagraphSuggestionInput {
  readonly client: MemorizationParagraphSuggestionOpenAIClient;
  readonly model: string;
  readonly text: string;
}

export async function requestParagraphSuggestion(
  input: RequestParagraphSuggestionInput,
): Promise<unknown> {
  const response = await input.client.responses.parse({
    model: input.model,
    input: [
      {
        role: "system",
        content:
          "Suggest paragraph splits for English sentence memorization. Return only schema-valid output.",
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
