import {
  MemorizationParagraphSuggestionEmptyTextError,
  MemorizationParagraphSuggestionTextTooLongError,
} from "@/features/memorization-paragraph-suggestion/models/errors";
import { MEMORIZATION_PARAGRAPH_SUGGESTION_MAX_TEXT_LENGTH } from "@/features/memorization-paragraph-suggestion/config/const";

export function assertSuggestableText(text: string): string {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new MemorizationParagraphSuggestionEmptyTextError();
  }

  if (trimmedText.length > MEMORIZATION_PARAGRAPH_SUGGESTION_MAX_TEXT_LENGTH) {
    throw new MemorizationParagraphSuggestionTextTooLongError();
  }

  return trimmedText;
}
