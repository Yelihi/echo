import { describe, expect, it } from "@jest/globals";

// entities
import { MaterialState } from "@/entities/roleplay-material";
import type { UserId } from "@/entities/value-object";

// views
import {
  createRoleplaySessionInputSchema,
  createRoleplaySessionSnapshotSchema,
  roleplayEditorDraftSchema,
} from "@/views/role-play/config/schema";
import { convertRolePlayEditorDraftToCreateInput } from "@/views/role-play/models/converter/convertRolePlayEditorDraft";

describe("roleplayEditorDraftSchema", () => {
  it("drops empty lines and trims fields before create conversion", () => {
    const parsed = roleplayEditorDraftSchema.parse({
      title: "  Cafe order  ",
      situation: "  Ordering a drink  ",
      tags: ["  Travel  ", "", "Travel"],
      lines: [
        { speaker: "partner", text: "  Hello  " },
        { speaker: "me", text: "   " },
        { speaker: "me", text: "I would like a latte." },
      ],
    });

    expect(parsed).toEqual({
      title: "Cafe order",
      situation: "Ordering a drink",
      tags: ["Travel"],
      lines: [
        { speaker: "partner", text: "Hello" },
        { speaker: "me", text: "I would like a latte." },
      ],
    });

    expect(
      convertRolePlayEditorDraftToCreateInput(
        parsed,
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
      ),
    ).toMatchObject({
      title: "Cafe order",
      speakerOneName: "상대방",
      speakerTwoName: "나",
      tags: [{ displayName: "Travel", normalizedName: "travel" }],
      lines: [
        { order: 0, speakerOrder: 1, text: "Hello" },
        { order: 1, speakerOrder: 2, text: "I would like a latte." },
      ],
    });
  });

  it("rejects a draft without a valid line", () => {
    const parsed = roleplayEditorDraftSchema.safeParse({
      title: "Cafe order",
      situation: "Ordering a drink",
      tags: [],
      lines: [{ speaker: "me", text: "   " }],
    });

    expect(parsed.success).toBe(false);
  });
});

describe("createRoleplaySessionInputSchema", () => {
  const ownerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const materialId = "11111111-1111-4111-8111-111111111111";

  it("should accept a learner speaker that belongs to the material", () => {
    const parsed = createRoleplaySessionInputSchema.parse({
      ownerId,
      materialId,
      selectedLearnerSpeakerId: `${materialId}:speaker:2`,
      partnerVoice: "emma",
      speechSpeed: 1,
    });

    expect(parsed.selectedLearnerSpeakerId).toBe(`${materialId}:speaker:2`);
  });

  it("should reject a speaker id that does not belong to the material", () => {
    const parsed = createRoleplaySessionInputSchema.safeParse({
      ownerId,
      materialId,
      selectedLearnerSpeakerId: "22222222-2222-4222-8222-222222222222:speaker:2",
      partnerVoice: "emma",
      speechSpeed: 1,
    });

    expect(parsed.success).toBe(false);
  });
});

describe("createRoleplaySessionSnapshotSchema", () => {
  const ownerId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const materialId = "11111111-1111-4111-8111-111111111111";
  const speakerOneId = `${materialId}:speaker:1`;
  const speakerTwoId = `${materialId}:speaker:2`;

  const validSnapshot = {
    selectedLearnerSpeakerId: speakerTwoId,
    partnerVoice: "emma",
    speechSpeed: 1,
    material: {
      id: materialId,
      ownerId,
      title: "Cafe order",
      situation: "Ordering a drink",
      tags: [{ displayName: "Travel", normalizedName: "travel" }],
      speakers: [
        { id: speakerOneId, order: 1 as const, displayName: "상대방" },
        { id: speakerTwoId, order: 2 as const, displayName: "나" },
      ] as const,
      lines: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          order: 0,
          speakerId: speakerTwoId,
          text: "Hello",
          translation: null,
        },
      ],
      state: MaterialState.ACTIVE,
      deletedAt: null,
      createdAt: new Date("2026-06-13T00:00:00.000Z"),
      updatedAt: new Date("2026-06-13T00:10:00.000Z"),
    },
  };

  it("should accept an active material snapshot with a valid learner speaker", () => {
    const parsed = createRoleplaySessionSnapshotSchema.parse(validSnapshot);

    expect(parsed.material.title).toBe("Cafe order");
    expect(parsed.selectedLearnerSpeakerId).toBe(speakerTwoId);
  });

  it("should reject a snapshot whose learner speaker is not on the material", () => {
    const parsed = createRoleplaySessionSnapshotSchema.safeParse({
      ...validSnapshot,
      selectedLearnerSpeakerId: `${materialId}:speaker:1`.replace("11111111", "22222222"),
    });

    expect(parsed.success).toBe(false);
  });
});

it("학습자에게 문장이 없으면 세션 스냅샷을 거부한다", () => {
  const materialId = "11111111-1111-4111-8111-111111111111";
  const snapshot = {
    selectedLearnerSpeakerId: `${materialId}:speaker:2`,
    partnerVoice: "emma",
    speechSpeed: 1,
    evaluationMode: "context",
    material: {
      id: materialId,
      ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      title: "Test",
      situation: "Test",
      tags: [],
      state: MaterialState.ACTIVE,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      speakers: [1, 2].map((order) => ({
        id: `${materialId}:speaker:${order}`,
        order,
        displayName: "Speaker",
      })),
      lines: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          order: 0,
          speakerId: `${materialId}:speaker:1`,
          text: "Hello",
          translation: null,
        },
      ],
    },
  };
  const result = createRoleplaySessionSnapshotSchema.safeParse(snapshot);
  expect(result.success).toBe(false);
  if (!result.success)
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Learner speaker must have at least one line" }),
      ]),
    );
});
