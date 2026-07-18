import type { MemorizationParagraphSuggestion } from "@/features/memorization-paragraph-suggestion/models/schema";

export interface MemorizationParagraphSuggestionTriggerProps {
  readonly onSuggested: (suggestion: MemorizationParagraphSuggestion) => void;
  readonly onCancel?: () => void;
}
