import { describe, expect, it } from "@jest/globals";

// entities
import type { MemorizationMaterial } from "@/entities/memorization-material";
import { MaterialState } from "@/entities/memorization-material/models/enums";
import type { MaterialId, ParagraphId, SentenceId, UserId } from "@/entities/value-object";

// views
import { convertMemorizationMaterialToSessionSnapshot } from "@/views/memorization/models/converter/convertMemorizationMaterialToSessionSnapshot";

describe("convertMemorizationMaterialToSessionSnapshot", () => {
  it("should copy the source material instead of reusing the same references", () => {
    const material: MemorizationMaterial = {
      id: "11111111-1111-4111-8111-111111111111" as MaterialId,
      ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
      title: "Daily Speaking",
      tags: [{ displayName: "Speech", normalizedName: "speech" }],
      paragraphs: [
        {
          id: "33333333-3333-4333-8333-333333333333" as ParagraphId,
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
      ],
      state: MaterialState.ACTIVE,
      deletedAt: null,
      createdAt: new Date("2026-06-13T00:00:00.000Z"),
      updatedAt: new Date("2026-06-13T00:10:00.000Z"),
    };

    const snapshot = convertMemorizationMaterialToSessionSnapshot(material);

    expect(snapshot.material).toEqual(material);
    expect(snapshot.material).not.toBe(material);
    expect(snapshot.material.tags).not.toBe(material.tags);
    expect(snapshot.material.tags[0]).not.toBe(material.tags[0]);
    expect(snapshot.material.paragraphs).not.toBe(material.paragraphs);
    expect(snapshot.material.paragraphs[0]).not.toBe(material.paragraphs[0]);
    expect(snapshot.material.paragraphs[0].sentences).not.toBe(material.paragraphs[0].sentences);
    expect(snapshot.material.createdAt).not.toBe(material.createdAt);
    expect(snapshot.material.updatedAt).not.toBe(material.updatedAt);
  });
});
