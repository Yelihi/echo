import { describe, expect, it } from "@jest/globals";

import type {
  MemorizationSessionParagraphRow,
  MemorizationSessionRow,
  MemorizationSessionSentenceRow,
  MemorizationSessionTagRow,
} from "@/entities/memorization-session/models/mapper";
import { mapMemorizationSessionRowToEntity } from "@/entities/memorization-session/models/mapper";

describe("mapMemorizationSessionRowToEntity", () => {
  it("maps memorization session snapshot rows into paragraph-based domain entity", () => {
    const session = createSessionRow();
    const firstParagraph = createParagraphRow({
      id: "22222222-2222-4222-8222-222222222222",
      paragraph_order: 0,
    });
    const secondParagraph = createParagraphRow({
      id: "33333333-3333-4333-8333-333333333333",
      paragraph_order: 1,
    });
    const tags: MemorizationSessionTagRow[] = [
      createTagRow({ display_name: "Speech", normalized_name: "speech" }),
      createTagRow({ display_name: "Daily", normalized_name: "daily" }),
    ];
    const paragraphs: MemorizationSessionParagraphRow[] = [secondParagraph, firstParagraph];
    const sentences: MemorizationSessionSentenceRow[] = [
      createSentenceRow({
        id: "55555555-5555-4555-8555-555555555555",
        paragraph_id: firstParagraph.id,
        sentence_order: 1,
        text_snapshot: "I practice speaking every day.",
        translation_snapshot: "나는 매일 말하기를 연습한다.",
      }),
      createSentenceRow({
        id: "44444444-4444-4444-8444-444444444444",
        paragraph_id: firstParagraph.id,
        sentence_order: 0,
        text_snapshot: "English is a daily habit.",
      }),
      createSentenceRow({
        id: "66666666-6666-4666-8666-666666666666",
        paragraph_id: secondParagraph.id,
        sentence_order: 0,
        text_snapshot: "Small progress compounds.",
      }),
    ];

    const entity = mapMemorizationSessionRowToEntity({
      session,
      tags,
      paragraphs,
      sentences,
    });

    expect(entity).toMatchObject({
      id: session.id,
      ownerId: session.user_id,
      sourceMaterialId: session.material_id,
      materialTitleSnapshot: "Daily Speaking",
      tagsSnapshot: [
        { displayName: "Daily", normalizedName: "daily" },
        { displayName: "Speech", normalizedName: "speech" },
      ],
      paragraphSnapshots: [
        {
          id: firstParagraph.id,
          order: 0,
          sentences: [
            {
              id: "44444444-4444-4444-8444-444444444444",
              order: 0,
              paragraphOrder: 0,
              text: "English is a daily habit.",
              translation: null,
            },
            {
              id: "55555555-5555-4555-8555-555555555555",
              order: 1,
              paragraphOrder: 0,
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
              paragraphOrder: 1,
              text: "Small progress compounds.",
              translation: null,
            },
          ],
        },
      ],
      currentParagraphOrder: 0,
      currentSentenceOrder: 1,
      state: "in_progress",
      completedAt: null,
      deletedAt: null,
    });
    expect(entity.startedAt).toEqual(new Date(session.started_at as string));
    expect(entity.createdAt).toEqual(new Date(session.created_at));
    expect(entity.updatedAt).toEqual(new Date(session.updated_at));
  });
});

function createSessionRow(overrides: Partial<MemorizationSessionRow> = {}): MemorizationSessionRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    material_id: "99999999-9999-4999-8999-999999999999",
    material_title_snapshot: "Daily Speaking",
    current_paragraph_order: 0,
    current_sentence_order: 1,
    status: "in_progress",
    started_at: "2026-06-13T00:01:00.000Z",
    completed_at: null,
    deleted_at: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:10:00.000Z",
    ...overrides,
  };
}

function createTagRow(
  overrides: Partial<MemorizationSessionTagRow> = {},
): MemorizationSessionTagRow {
  return {
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    display_name: "Speech",
    normalized_name: "speech",
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createParagraphRow(
  overrides: Partial<MemorizationSessionParagraphRow> = {},
): MemorizationSessionParagraphRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    paragraph_order: 0,
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createSentenceRow(
  overrides: Partial<MemorizationSessionSentenceRow> = {},
): MemorizationSessionSentenceRow {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    paragraph_id: "22222222-2222-4222-8222-222222222222",
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    sentence_order: 0,
    text_snapshot: "English is a daily habit.",
    translation_snapshot: null,
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}
