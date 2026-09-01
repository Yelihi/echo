import { describe, expect, it } from "@jest/globals";

// entities
import type { RoleplaySession } from "@/entities/roleplay-session";
import { RoleplayPartnerVoice, SessionState } from "@/entities/roleplay-session";
import type { LineId, MaterialId, SessionId, SpeakerId, UserId } from "@/entities/value-object";

// views
import { convertRolePlaySessionToRecordingMaterial } from "@/views/role-play/models/converter/convertRolePlaySessionToRecordingMaterial";

describe("convertRolePlaySessionToRecordingMaterial", () => {
  it("should use speaker 1 as the partner when the learner selected speaker 2", () => {
    const session = createSession({ selectedLearnerSpeakerOrder: 2 });

    expect(
      convertRolePlaySessionToRecordingMaterial(session, session.sourceMaterialId ?? ""),
    ).toMatchObject({
      id: session.sourceMaterialId,
      title: "Airport Check-in",
      description: "Checking in at the airport counter.",
      tags: ["Airport", "Travel"],
      lineCount: 2,
      learnerTurnCount: 1,
      partnerRole: "Staff",
      partnerLine: "How can I help you?",
    });
  });

  it("should use speaker 2 as the partner when the learner selected speaker 1", () => {
    const session = createSession({ selectedLearnerSpeakerOrder: 1 });
    const routeMaterialId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

    expect(convertRolePlaySessionToRecordingMaterial(session, routeMaterialId)).toMatchObject({
      id: routeMaterialId,
      learnerTurnCount: 1,
      partnerRole: "Passenger",
      partnerLine: "I would like an aisle seat.",
    });
  });
});

function createSession(
  overrides: Pick<RoleplaySession, "selectedLearnerSpeakerOrder">,
): RoleplaySession {
  const sessionId = "11111111-1111-4111-8111-111111111111" as SessionId;
  const materialId = "99999999-9999-4999-8999-999999999999" as MaterialId;

  return {
    id: sessionId,
    ownerId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" as UserId,
    sourceMaterialId: materialId,
    materialTitleSnapshot: "Airport Check-in",
    situationSnapshot: "Checking in at the airport counter.",
    tagsSnapshot: [
      { displayName: "Airport", normalizedName: "airport" },
      { displayName: "Travel", normalizedName: "travel" },
    ],
    selectedLearnerSpeakerOrder: overrides.selectedLearnerSpeakerOrder,
    partnerVoice: RoleplayPartnerVoice.EMMA,
    speechSpeed: 1,
    speakerSnapshots: [
      {
        id: `${sessionId}:speaker:1` as SpeakerId,
        order: 1,
        displayName: "Staff",
      },
      {
        id: `${sessionId}:speaker:2` as SpeakerId,
        order: 2,
        displayName: "Passenger",
      },
    ],
    lineSnapshots: [
      {
        id: "22222222-2222-4222-8222-222222222222" as LineId,
        order: 0,
        speakerOrder: 1,
        text: "How can I help you?",
        translation: null,
      },
      {
        id: "33333333-3333-4333-8333-333333333333" as LineId,
        order: 1,
        speakerOrder: 2,
        text: "I would like an aisle seat.",
        translation: null,
      },
    ],
    currentLineOrder: 0,
    state: SessionState.READY,
    startedAt: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date("2026-06-13T00:00:00.000Z"),
    updatedAt: new Date("2026-06-13T00:00:00.000Z"),
  };
}
