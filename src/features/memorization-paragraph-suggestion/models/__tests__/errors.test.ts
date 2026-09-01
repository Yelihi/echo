import { describe, expect, it } from "@jest/globals";

import {
  createMemorizationParagraphSuggestionErrorFromCode,
  MemorizationParagraphSuggestionEmptyTextError,
  MemorizationParagraphSuggestionProviderFailedError,
  MemorizationParagraphSuggestionUnauthorizedError,
} from "@/features/memorization-paragraph-suggestion/models/errors";

describe("createMemorizationParagraphSuggestionErrorFromCode", () => {
  it("should map MPS-001 to an empty text error", () => {
    const error = createMemorizationParagraphSuggestionErrorFromCode(
      MemorizationParagraphSuggestionEmptyTextError.CODE,
    );

    expect(error).toBeInstanceOf(MemorizationParagraphSuggestionEmptyTextError);
    expect(error.code).toBe("MPS-001");
    expect(error.title).toBe("본문을 입력해주세요");
  });

  it("should map MPS-005 to an unauthorized error", () => {
    const error = createMemorizationParagraphSuggestionErrorFromCode(
      MemorizationParagraphSuggestionUnauthorizedError.CODE,
    );

    expect(error).toBeInstanceOf(MemorizationParagraphSuggestionUnauthorizedError);
    expect(error.code).toBe("MPS-005");
    expect(error.title).toBe("로그인이 필요합니다");
  });

  it("should fall back to a provider error for an unknown code", () => {
    const error = createMemorizationParagraphSuggestionErrorFromCode("UNKNOWN");

    expect(error).toBeInstanceOf(MemorizationParagraphSuggestionProviderFailedError);
    expect(error.code).toBe("MPS-004");
  });
});
