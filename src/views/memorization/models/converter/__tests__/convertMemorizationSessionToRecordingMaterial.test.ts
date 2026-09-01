import { describe, expect, it } from "@jest/globals";

// entities
import type { MemorizationSession } from "@/entities/memorization-session";
import { SessionState } from "@/entities/memorization-session";
import type {
  MaterialId,
  ParagraphId,
  SentenceId,
  SessionId,
  UserId,
} from "@/entities/value-object";

// views
import { convertMemorizationSessionToRecordingMaterial } from "@/views/memorization/models/converter/convertMemorizationSessionToRecordingMaterial";

describe("convertMemorizationSessionToRecordingMaterial", () => {
  it("should build recording material from the session snapshot instead of live source fields", () => {
    const session = createSession();
    const routeMaterialId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

    expect(convertMemorizationSessionToRecordingMaterial(session, routeMaterialId)).toEqual({
      id: routeMaterialId,
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

function createSession(): MemorizationSession {
  return {
    id: "11111111-1111-4111-8111-111111111111" as SessionId,
    ownerId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" as UserId,
    sourceMaterialId: "99999999-9999-4999-8999-999999999999" as MaterialId,
    materialTitleSnapshot: "Daily Speaking",
    tagsSnapshot: [
      { displayName: "Speech", normalizedName: "speech" },
      { displayName: "Daily", normalizedName: "daily" },
    ],
    paragraphSnapshots: [
      {
        id: "22222222-2222-4222-8222-222222222222" as ParagraphId,
        order: 0,
        sentences: [
          {
            id: "44444444-4444-4444-8444-444444444444" as SentenceId,
            order: 0,
            paragraphOrder: 0,
            text: "English is a daily habit.",
            translation: null,
          },
          {
            id: "55555555-5555-4555-8555-555555555555" as SentenceId,
            order: 1,
            paragraphOrder: 0,
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
            paragraphOrder: 1,
            text: "Small progress compounds.",
            translation: null,
          },
        ],
      },
    ],
    currentParagraphOrder: 0,
    currentSentenceOrder: 0,
    state: SessionState.READY,
    startedAt: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date("2026-06-13T00:00:00.000Z"),
    updatedAt: new Date("2026-06-13T00:00:00.000Z"),
  };
}
