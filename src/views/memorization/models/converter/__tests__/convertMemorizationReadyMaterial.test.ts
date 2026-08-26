import { describe, expect, it } from "@jest/globals";

// entities
import type { MemorizationMaterial } from "@/entities/memorization-material";
import { MaterialState } from "@/entities/memorization-material";
import type { MaterialId, ParagraphId, SentenceId, UserId } from "@/entities/value-object";

// views
import { convertMemorizationMaterialToReadyMaterial } from "@/views/memorization/models/converter/convertMemorizationReadyMaterial";

describe("convertMemorizationMaterialToReadyMaterial", () => {
  it("should use paragraph and sentence counts from the material instead of mock card values", () => {
    const material = createMaterial();

    expect(convertMemorizationMaterialToReadyMaterial(material)).toEqual({
      id: material.id,
      tags: ["Speech", "Daily"],
      title: "Daily Speaking",
      description: "English is a daily habit.",
      paragraphCount: 2,
      wordCount: 13,
      estimatedMinutes: 1,
      difficulty: "Daily",
    });
  });
});

function createMaterial(): MemorizationMaterial {
  const materialId = "11111111-1111-4111-8111-111111111111" as MaterialId;

  return {
    id: materialId,
    ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
    title: "Daily Speaking",
    tags: [
      { displayName: "Speech", normalizedName: "speech" },
      { displayName: "Daily", normalizedName: "daily" },
    ],
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
}
