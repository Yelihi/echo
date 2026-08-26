import { describe, expect, it } from "@jest/globals";

// entities
import type { MemorizationMaterial } from "@/entities/memorization-material";
import { MaterialState } from "@/entities/memorization-material";
import type { MaterialId, ParagraphId, SentenceId, UserId } from "@/entities/value-object";

// views
import { convertMemorizationSessionCard } from "@/views/memorization/models/converter/convertMemorizationSessionCard";

describe("convertMemorizationSessionCard", () => {
  it("should use paragraph count and the first sentence as the card subtitle", () => {
    const materialId = "11111111-1111-4111-8111-111111111111" as MaterialId;
    const material: MemorizationMaterial = {
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
          ],
        },
        {
          id: "33333333-3333-4333-8333-333333333333" as ParagraphId,
          order: 1,
          sentences: [],
        },
      ],
      state: MaterialState.ACTIVE,
      deletedAt: null,
      createdAt: new Date("2026-06-13T00:00:00.000Z"),
      updatedAt: new Date("2026-06-13T00:10:00.000Z"),
    };

    expect(convertMemorizationSessionCard(material, "black")).toEqual({
      id: materialId,
      tags: [
        { label: "Speech", value: "speech" },
        { label: "Daily", value: "daily" },
      ],
      title: "Daily Speaking",
      subTitle: "English is a daily habit.",
      theme: "black",
      contentValue: 2,
    });
  });

  it("should use an empty subtitle when the material has no sentences", () => {
    const material: MemorizationMaterial = {
      id: "11111111-1111-4111-8111-111111111111" as MaterialId,
      ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
      title: "Empty Source",
      tags: [],
      paragraphs: [],
      state: MaterialState.ACTIVE,
      deletedAt: null,
      createdAt: new Date("2026-06-13T00:00:00.000Z"),
      updatedAt: new Date("2026-06-13T00:10:00.000Z"),
    };

    expect(convertMemorizationSessionCard(material, "black").subTitle).toBe("");
    expect(convertMemorizationSessionCard(material, "black").contentValue).toBe(0);
  });
});
