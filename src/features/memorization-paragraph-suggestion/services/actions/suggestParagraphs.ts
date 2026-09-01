"use server";

// shared
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

// features
import {
  MemorizationParagraphSuggestionError,
  MemorizationParagraphSuggestionUnauthorizedError,
} from "@/features/memorization-paragraph-suggestion/models/errors";
import { suggestMemorizationParagraphs } from "@/features/memorization-paragraph-suggestion/services/server/suggestMemorizationParagraphs";

export const suggestParagraphs = async (text: string) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { code: MemorizationParagraphSuggestionUnauthorizedError.CODE };
  }

  try {
    const data = await suggestMemorizationParagraphs({ text });
    return { code: "SUCCESS" as const, data };
  } catch (error) {
    if (error instanceof MemorizationParagraphSuggestionError) {
      return { code: error.code };
    }

    throw error;
  }
};
