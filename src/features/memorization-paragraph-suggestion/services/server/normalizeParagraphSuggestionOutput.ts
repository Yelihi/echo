import { MemorizationParagraphSuggestionInvalidOutputError } from "@/features/memorization-paragraph-suggestion/models/errors";
import {
  memorizationParagraphSuggestionSchema,
  openAIMemorizationParagraphSuggestionOutputSchema,
  type MemorizationParagraphSuggestion,
} from "@/features/memorization-paragraph-suggestion/models/schema";

export function normalizeParagraphSuggestionOutput(
  output: unknown,
): MemorizationParagraphSuggestion {
  const parsed = openAIMemorizationParagraphSuggestionOutputSchema.safeParse(output);

  if (!parsed.success) {
    throw new MemorizationParagraphSuggestionInvalidOutputError({ cause: parsed.error });
  }

  const suggestion = {
    paragraphs: parsed.data.paragraphs.map((paragraph, paragraphIndex) => ({
      order: paragraphIndex + 1,
      sentences: paragraph.sentences.map((sentence, sentenceIndex) => ({
        order: sentenceIndex + 1,
        text: sentence.text,
        translation: sentence.translation,
      })),
    })),
  };

  return memorizationParagraphSuggestionSchema.parse(suggestion);
}
