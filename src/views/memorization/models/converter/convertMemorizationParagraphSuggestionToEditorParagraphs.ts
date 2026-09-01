// features
import type { MemorizationParagraphSuggestion } from "@/features/memorization-paragraph-suggestion/models/schema";

export function convertMemorizationParagraphSuggestionToEditorParagraphs(
  suggestion: MemorizationParagraphSuggestion,
): string[] {
  return suggestion.paragraphs
    .map((paragraph) =>
      paragraph.sentences
        .map((sentence) => sentence.text.trim())
        .filter((text) => text.length > 0)
        .join(" "),
    )
    .filter((paragraph) => paragraph.length > 0);
}
