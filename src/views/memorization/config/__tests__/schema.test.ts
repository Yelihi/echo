import { describe, expect, it } from "@jest/globals";

// entities
import type { UserId } from "@/entities/value-object";

// views
import { memorizationEditorDraftSchema } from "@/views/memorization/config/schema";
import { convertMemorizationEditorDraftToCreateInput } from "@/views/memorization/models/converter/convertMemorizationEditorDraft";

describe("memorizationEditorDraftSchema", () => {
  it("drops empty paragraphs and trims fields before create conversion", () => {
    const parsed = memorizationEditorDraftSchema.parse({
      title: "  Daily Speaking  ",
      tags: ["  Speech  ", "", "Speech", "speech"],
      confirmed: true,
      rawText: "ignored",
      paragraphs: ["  English is a daily habit.  ", "   ", "Small progress compounds."],
    });

    expect(parsed).toEqual({
      title: "Daily Speaking",
      tags: ["Speech"],
      confirmed: true,
      paragraphs: ["English is a daily habit.", "Small progress compounds."],
    });

    expect(
      convertMemorizationEditorDraftToCreateInput(
        parsed,
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
      ),
    ).toMatchObject({
      title: "Daily Speaking",
      tags: [{ displayName: "Speech", normalizedName: "speech" }],
      paragraphs: [
        {
          order: 0,
          sentences: [{ order: 0, text: "English is a daily habit.", translation: null }],
        },
        {
          order: 1,
          sentences: [{ order: 0, text: "Small progress compounds.", translation: null }],
        },
      ],
    });
  });

  it("rejects a draft without a confirmed valid paragraph", () => {
    const unconfirmed = memorizationEditorDraftSchema.safeParse({
      title: "Daily Speaking",
      tags: [],
      confirmed: false,
      paragraphs: ["English is a daily habit."],
    });
    const emptyParagraphs = memorizationEditorDraftSchema.safeParse({
      title: "Daily Speaking",
      tags: [],
      confirmed: true,
      paragraphs: ["   "],
    });

    expect(unconfirmed.success).toBe(false);
    expect(emptyParagraphs.success).toBe(false);
  });
});
