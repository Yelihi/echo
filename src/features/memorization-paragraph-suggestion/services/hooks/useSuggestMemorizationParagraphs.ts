"use client";

import { useTransition } from "react";

// shared
import { errorPopupManager } from "@/shared/lib/error-popup";

// features
import {
  createMemorizationParagraphSuggestionErrorFromCode,
  MemorizationParagraphSuggestionError,
  MemorizationParagraphSuggestionProviderFailedError,
} from "@/features/memorization-paragraph-suggestion/models/errors";
import type { MemorizationParagraphSuggestionProps } from "@/features/memorization-paragraph-suggestion/models/interface";
import type { MemorizationParagraphSuggestion } from "@/features/memorization-paragraph-suggestion/models/schema";
import { suggestParagraphs } from "@/features/memorization-paragraph-suggestion/services/actions/suggestParagraphs";

export const useSuggestMemorizationParagraphs = (
  onSuggested: (suggestion: MemorizationParagraphSuggestion) => void,
): MemorizationParagraphSuggestionProps => {
  const [isPending, startTransition] = useTransition();

  const suggest = (text: string) => {
    startTransition(async () => {
      try {
        const result = await suggestParagraphs(text);

        if (result.code === "SUCCESS" && result.data) {
          onSuggested(result.data);
          return;
        }

        openSuggestionError(createMemorizationParagraphSuggestionErrorFromCode(result.code));
      } catch {
        openSuggestionError(new MemorizationParagraphSuggestionProviderFailedError());
      }
    });
  };

  return {
    isPending,
    suggest,
  };
};

function openSuggestionError(error: MemorizationParagraphSuggestionError) {
  errorPopupManager.open({
    title: error.title,
    message: error.message,
    code: error.code,
  });
}
