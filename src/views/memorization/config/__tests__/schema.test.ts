import { describe, expect, it } from "@jest/globals";

// entities
import { MaterialState } from "@/entities/memorization-material";
import type { UserId } from "@/entities/value-object";

// views
import {
  createMemorizationSessionInputSchema,
  createMemorizationSessionSnapshotSchema,
  memorizationEditorDraftSchema,
} from "@/views/memorization/config/schema";
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

describe("createMemorizationSessionInputSchema", () => {
  it("should accept a valid owner and material id", () => {
    const parsed = createMemorizationSessionInputSchema.parse({
      ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      materialId: "11111111-1111-4111-8111-111111111111",
    });

    expect(parsed.materialId).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("should reject an invalid material id", () => {
    const parsed = createMemorizationSessionInputSchema.safeParse({
      ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      materialId: "not-a-uuid",
    });

    expect(parsed.success).toBe(false);
  });
});

describe("createMemorizationSessionSnapshotSchema", () => {
  const ownerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const materialId = "11111111-1111-4111-8111-111111111111";

  const validSnapshot = {
    material: {
      id: materialId,
      ownerId,
      title: "Daily Speaking",
      tags: [{ displayName: "Speech", normalizedName: "speech" }],
      paragraphs: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          order: 0,
          sentences: [
            {
              id: "44444444-4444-4444-8444-444444444444",
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
    },
  };

  it("should accept an active material snapshot", () => {
    const parsed = createMemorizationSessionSnapshotSchema.parse(validSnapshot);

    expect(parsed.material.title).toBe("Daily Speaking");
  });

  it("should reject a snapshot without paragraphs", () => {
    const parsed = createMemorizationSessionSnapshotSchema.safeParse({
      material: { ...validSnapshot.material, paragraphs: [] },
    });

    expect(parsed.success).toBe(false);
  });
});
