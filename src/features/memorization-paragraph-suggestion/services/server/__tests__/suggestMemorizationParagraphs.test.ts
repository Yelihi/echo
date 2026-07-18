import { describe, expect, it, jest } from "@jest/globals";

import {
  MemorizationParagraphSuggestionEmptyTextError,
  MemorizationParagraphSuggestionProviderFailedError,
  MemorizationParagraphSuggestionTextTooLongError,
} from "@/features/memorization-paragraph-suggestion/models/errors";
import {
  suggestMemorizationParagraphs,
  type MemorizationParagraphSuggestionOpenAIClient,
} from "@/features/memorization-paragraph-suggestion/services/server/suggestMemorizationParagraphs";

jest.mock("server-only", () => ({}));

describe("suggestMemorizationParagraphs", () => {
  it("should reject empty text before calling OpenAI", async () => {
    // Given
    const parse = jest.fn();

    // When & Then
    await expect(
      suggestMemorizationParagraphs({
        text: "   ",
        client: createClient(parse),
        model: "test-model",
      }),
    ).rejects.toBeInstanceOf(MemorizationParagraphSuggestionEmptyTextError);
    expect(parse).not.toHaveBeenCalled();
  });

  it("should reject text longer than max length before calling OpenAI", async () => {
    // Given
    const parse = jest.fn();

    // When & Then
    await expect(
      suggestMemorizationParagraphs({
        text: "a".repeat(10_001),
        client: createClient(parse),
        model: "test-model",
      }),
    ).rejects.toBeInstanceOf(MemorizationParagraphSuggestionTextTooLongError);
    expect(parse).not.toHaveBeenCalled();
  });

  it("should return normalized paragraph suggestions from OpenAI output", async () => {
    // Given
    const parse = jest.fn(async () => ({
      output_parsed: {
        paragraphs: [
          {
            sentences: [
              { text: "Practice every day.", translation: null },
              { text: "Small steps compound.", translation: null },
            ],
          },
          {
            sentences: [{ text: "Confidence grows through repetition.", translation: null }],
          },
        ],
      },
    }));

    // When
    const suggestion = await suggestMemorizationParagraphs({
      text: "Practice every day. Small steps compound.\nConfidence grows through repetition.",
      client: createClient(parse),
      model: "test-model",
    });

    // Then
    expect(suggestion).toEqual({
      paragraphs: [
        {
          order: 1,
          sentences: [
            { order: 1, text: "Practice every day.", translation: null },
            { order: 2, text: "Small steps compound.", translation: null },
          ],
        },
        {
          order: 2,
          sentences: [
            { order: 1, text: "Confidence grows through repetition.", translation: null },
          ],
        },
      ],
    });
    expect(parse).toHaveBeenCalledWith(expect.objectContaining({ model: "test-model" }));
  });

  it("should map OpenAI request failures to provider failed error", async () => {
    // Given
    const parse = jest.fn(async () => {
      throw new Error("provider unavailable");
    });

    // When & Then
    await expect(
      suggestMemorizationParagraphs({
        text: "Practice every day.",
        client: createClient(parse),
        model: "test-model",
      }),
    ).rejects.toBeInstanceOf(MemorizationParagraphSuggestionProviderFailedError);
  });
});

function createClient(parse: jest.Mock): MemorizationParagraphSuggestionOpenAIClient {
  return {
    responses: {
      parse: parse as MemorizationParagraphSuggestionOpenAIClient["responses"]["parse"],
    },
  };
}
