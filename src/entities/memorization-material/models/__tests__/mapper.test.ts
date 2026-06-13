import { describe, expect, it } from "@jest/globals";

import type {
  MemorizationMaterialParagraphRow,
  MemorizationMaterialRow,
  MemorizationMaterialSentenceRow,
  MemorizationMaterialTagRow,
} from "@/entities/memorization-material/models/mapper";
import { mapMemorizationMaterialRowToEntity } from "@/entities/memorization-material/models/mapper";

describe("mapMemorizationMaterialRowToEntity", () => {
  it("maps memorization material rows into paragraph-based domain entity", () => {
    const material = createMaterialRow();
    const firstParagraph = createParagraphRow({
      id: "22222222-2222-4222-8222-222222222222",
      paragraph_order: 0,
    });
    const secondParagraph = createParagraphRow({
      id: "33333333-3333-4333-8333-333333333333",
      paragraph_order: 1,
    });
    const tags: MemorizationMaterialTagRow[] = [
      createTagRow({ display_name: "Speech", normalized_name: "speech" }),
      createTagRow({ display_name: "Daily", normalized_name: "daily" }),
    ];
    const paragraphs: MemorizationMaterialParagraphRow[] = [secondParagraph, firstParagraph];
    const sentences: MemorizationMaterialSentenceRow[] = [
      createSentenceRow({
        id: "55555555-5555-4555-8555-555555555555",
        paragraph_id: firstParagraph.id,
        sentence_order: 1,
        text: "I practice speaking every day.",
        translation: "나는 매일 말하기를 연습한다.",
      }),
      createSentenceRow({
        id: "44444444-4444-4444-8444-444444444444",
        paragraph_id: firstParagraph.id,
        sentence_order: 0,
        text: "English is a daily habit.",
      }),
      createSentenceRow({
        id: "66666666-6666-4666-8666-666666666666",
        paragraph_id: secondParagraph.id,
        sentence_order: 0,
        text: "Small progress compounds.",
      }),
    ];

    const entity = mapMemorizationMaterialRowToEntity({
      material,
      tags,
      paragraphs,
      sentences,
    });

    expect(entity).toMatchObject({
      id: material.id,
      ownerId: material.user_id,
      title: "Daily Speaking",
      tags: [
        { displayName: "Daily", normalizedName: "daily" },
        { displayName: "Speech", normalizedName: "speech" },
      ],
      paragraphs: [
        {
          id: firstParagraph.id,
          order: 0,
          sentences: [
            {
              id: "44444444-4444-4444-8444-444444444444",
              order: 0,
              text: "English is a daily habit.",
              translation: null,
            },
            {
              id: "55555555-5555-4555-8555-555555555555",
              order: 1,
              text: "I practice speaking every day.",
              translation: "나는 매일 말하기를 연습한다.",
            },
          ],
        },
        {
          id: secondParagraph.id,
          order: 1,
          sentences: [
            {
              id: "66666666-6666-4666-8666-666666666666",
              order: 0,
              text: "Small progress compounds.",
              translation: null,
            },
          ],
        },
      ],
      state: "active",
      deletedAt: null,
    });
    expect(entity.createdAt).toEqual(new Date(material.created_at));
    expect(entity.updatedAt).toEqual(new Date(material.updated_at));
  });
});

function createMaterialRow(
  overrides: Partial<MemorizationMaterialRow> = {},
): MemorizationMaterialRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Daily Speaking",
    status: "active",
    deleted_at: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:10:00.000Z",
    ...overrides,
  };
}

function createTagRow(
  overrides: Partial<MemorizationMaterialTagRow> = {},
): MemorizationMaterialTagRow {
  return {
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    display_name: "Speech",
    normalized_name: "speech",
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createParagraphRow(
  overrides: Partial<MemorizationMaterialParagraphRow> = {},
): MemorizationMaterialParagraphRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    paragraph_order: 0,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createSentenceRow(
  overrides: Partial<MemorizationMaterialSentenceRow> = {},
): MemorizationMaterialSentenceRow {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    paragraph_id: "22222222-2222-4222-8222-222222222222",
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    sentence_order: 0,
    text: "English is a daily habit.",
    translation: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}
