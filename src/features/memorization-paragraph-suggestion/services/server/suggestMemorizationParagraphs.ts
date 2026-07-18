import "server-only";

import { getOpenAIEvaluationModel, getOpenAIServerClient } from "@/shared/lib/openai/server";

import {
  MemorizationParagraphSuggestionError,
  MemorizationParagraphSuggestionInvalidOutputError,
  MemorizationParagraphSuggestionProviderFailedError,
} from "@/features/memorization-paragraph-suggestion/models/errors";
import type {
  MemorizationParagraphSuggestionOpenAIClient,
  SuggestMemorizationParagraphsInput,
} from "@/features/memorization-paragraph-suggestion/models/interface";
import type { MemorizationParagraphSuggestion } from "@/features/memorization-paragraph-suggestion/models/schema";
import { requestParagraphSuggestion } from "@/features/memorization-paragraph-suggestion/services/server/requestParagraphSuggestion";
import { normalizeParagraphSuggestionOutput } from "@/features/memorization-paragraph-suggestion/services/server/normalizeParagraphSuggestionOutput";
import { assertSuggestableText } from "@/features/memorization-paragraph-suggestion/services/server/validation";

export type { MemorizationParagraphSuggestionOpenAIClient };

export async function suggestMemorizationParagraphs(
  input: SuggestMemorizationParagraphsInput,
): Promise<MemorizationParagraphSuggestion> {
  const text = assertSuggestableText(input.text);

  try {
    const output = await requestParagraphSuggestion({
      text,
      client: input.client ?? getOpenAIServerClient(),
      model: input.model ?? getOpenAIEvaluationModel(),
    });

    if (!output) {
      throw new MemorizationParagraphSuggestionInvalidOutputError();
    }

    return normalizeParagraphSuggestionOutput(output);
  } catch (error) {
    if (error instanceof MemorizationParagraphSuggestionError) {
      throw error;
    }

    throw new MemorizationParagraphSuggestionProviderFailedError({ cause: error });
  }
}
