import { describe, expect, it } from "@jest/globals";

// views
import { convertMemorizationParagraphSuggestionToEditorParagraphs } from "@/views/memorization/models/converter/convertMemorizationParagraphSuggestionToEditorParagraphs";

describe("convertMemorizationParagraphSuggestionToEditorParagraphs", () => {
  it("joins sentences in each paragraph for the editor draft", () => {
    expect(
      convertMemorizationParagraphSuggestionToEditorParagraphs({
        paragraphs: [
          {
            order: 1,
            sentences: [
              { order: 1, text: "Practice every day.", translation: "매일 연습하세요." },
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
      }),
    ).toEqual([
      "Practice every day. Small steps compound.",
      "Confidence grows through repetition.",
    ]);
  });
});
