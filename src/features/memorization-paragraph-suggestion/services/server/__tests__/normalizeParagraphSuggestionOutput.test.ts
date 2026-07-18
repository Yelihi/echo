import { describe, expect, it } from "@jest/globals";

import { MemorizationParagraphSuggestionInvalidOutputError } from "@/features/memorization-paragraph-suggestion/models/errors";
import { normalizeParagraphSuggestionOutput } from "@/features/memorization-paragraph-suggestion/services/server/normalizeParagraphSuggestionOutput";

describe("normalizeParagraphSuggestionOutput", () => {
  it("should add stable paragraph and sentence order", () => {
    // Given
    const output = {
      paragraphs: [
        {
          sentences: [
            { text: "First sentence.", translation: null },
            { text: "Second sentence.", translation: "두 번째 문장." },
          ],
        },
      ],
    };

    // When
    const suggestion = normalizeParagraphSuggestionOutput(output);

    // Then
    expect(suggestion).toEqual({
      paragraphs: [
        {
          order: 1,
          sentences: [
            { order: 1, text: "First sentence.", translation: null },
            { order: 2, text: "Second sentence.", translation: "두 번째 문장." },
          ],
        },
      ],
    });
  });

  it("should reject empty paragraph array", () => {
    // Given
    const output = { paragraphs: [] };

    // When & Then
    expect(() => normalizeParagraphSuggestionOutput(output)).toThrow(
      MemorizationParagraphSuggestionInvalidOutputError,
    );
  });

  it("should reject paragraphs without sentences", () => {
    // Given
    const output = { paragraphs: [{ sentences: [] }] };

    // When & Then
    expect(() => normalizeParagraphSuggestionOutput(output)).toThrow(
      MemorizationParagraphSuggestionInvalidOutputError,
    );
  });

  it("should reject empty sentence text", () => {
    // Given
    const output = {
      paragraphs: [{ sentences: [{ text: " ", translation: null }] }],
    };

    // When & Then
    expect(() => normalizeParagraphSuggestionOutput(output)).toThrow(
      MemorizationParagraphSuggestionInvalidOutputError,
    );
  });
});
