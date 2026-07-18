import type { MemorizationParagraphSuggestion } from "@/features/memorization-paragraph-suggestion/models/schema";

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

export interface SuggestMemorizationParagraphsInput {
  readonly text: string;
  readonly client?: MemorizationParagraphSuggestionOpenAIClient;
  readonly model?: string;
}

export interface MemorizationParagraphSuggestionTriggerProps {
  readonly onSuggested: (suggestion: MemorizationParagraphSuggestion) => void;
  readonly onCancel?: () => void;
}
