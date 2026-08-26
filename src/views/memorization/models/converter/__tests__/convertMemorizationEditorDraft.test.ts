import { describe, expect, it } from "@jest/globals";

// entities
import type { MemorizationMaterial } from "@/entities/memorization-material";
import { MaterialState } from "@/entities/memorization-material";
import type { MaterialId, ParagraphId, SentenceId, UserId } from "@/entities/value-object";

// views
import { convertMemorizationMaterialToEditorDraft } from "@/views/memorization/models/converter/convertMemorizationEditorDraft";

describe("convertMemorizationMaterialToEditorDraft", () => {
  it("should join stored paragraphs into the editor draft instead of matching mock text", () => {
    const materialId = "11111111-1111-4111-8111-111111111111" as MaterialId;
    const material: MemorizationMaterial = {
      id: materialId,
      ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
      title: "Daily Speaking",
      tags: [{ displayName: "Speech", normalizedName: "speech" }],
      paragraphs: [
        {
          id: "22222222-2222-4222-8222-222222222222" as ParagraphId,
          order: 0,
          sentences: [
            {
              id: "44444444-4444-4444-8444-444444444444" as SentenceId,
              order: 0,
              text: "English is a daily habit.",
              translation: null,
            },
            {
              id: "55555555-5555-4555-8555-555555555555" as SentenceId,
              order: 1,
              text: "I practice speaking every day.",
              translation: null,
            },
          ],
        },
        {
          id: "33333333-3333-4333-8333-333333333333" as ParagraphId,
          order: 1,
          sentences: [
            {
              id: "66666666-6666-4666-8666-666666666666" as SentenceId,
              order: 0,
              text: "Small progress compounds.",
              translation: null,
            },
          ],
        },
      ],
      state: MaterialState.ACTIVE,
      deletedAt: null,
      createdAt: new Date("2026-06-13T00:00:00.000Z"),
      updatedAt: new Date("2026-06-13T00:10:00.000Z"),
    };

    expect(convertMemorizationMaterialToEditorDraft(material)).toEqual({
      title: "Daily Speaking",
      tags: ["Speech"],
      rawText:
        "English is a daily habit. I practice speaking every day.\n\nSmall progress compounds.",
      paragraphs: [
        "English is a daily habit. I practice speaking every day.",
        "Small progress compounds.",
      ],
      confirmed: true,
    });
  });
});
