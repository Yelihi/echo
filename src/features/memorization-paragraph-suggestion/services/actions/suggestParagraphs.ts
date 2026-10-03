"use server";

// shared
import { assertSuggestableText } from "../server/validation";
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
    assertSuggestableText(text);
    const { data: permission, error } = await supabase.rpc("consume_ai_request", {
      p_operation: "paragraphs",
    });
    if (error) return { code: "MPS-004" as const };
    if (permission === "not_invited") return { code: "MPS-006" as const };
    if (permission !== "allowed") return { code: "MPS-007" as const };
    const data = await suggestMemorizationParagraphs({ text });
    return { code: "SUCCESS" as const, data };
  } catch (error) {
    if (error instanceof MemorizationParagraphSuggestionError) {
      return { code: error.code };
    }

    throw error;
  }
};
