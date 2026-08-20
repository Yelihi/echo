import { describe, expect, it } from "@jest/globals";

import type { MemorizationSession } from "@/entities/memorization-session";
import { SessionState as MemorizationSessionState } from "@/entities/memorization-session";
import type { RoleplaySession } from "@/entities/roleplay-session";
import { SessionState as RoleplaySessionState } from "@/entities/roleplay-session";
import type { MaterialId, SessionId, SpeakerId, UserId } from "@/entities/value-object";
import { convertMemorizationStudySessions } from "@/views/home/models/converter/convertMemorizationStudySessions";
import { convertRoleplayStudySessions } from "@/views/home/models/converter/convertRoleplayStudySessions";
import type { GetLatestStudySession } from "@/views/home/models/interface";

describe("convert study sessions", () => {
  it("links only completed sessions to result pages", () => {
    const roleplayReady = createRoleplaySession({
      id: "11111111-1111-4111-8111-111111111111" as SessionId,
      state: RoleplaySessionState.READY,
    });
    const roleplayCompleted = createRoleplaySession({
      id: "22222222-2222-4222-8222-222222222222" as SessionId,
      state: RoleplaySessionState.COMPLETED,
    });
    const memorizationInProgress = createMemorizationSession({
      id: "33333333-3333-4333-8333-333333333333" as SessionId,
      state: MemorizationSessionState.IN_PROGRESS,
    });
    const states = new Map<SessionId, GetLatestStudySession["sessionState"]>([
      [roleplayReady.id, "pending"],
      [roleplayCompleted.id, "completed"],
      [memorizationInProgress.id, "inProgress"],
    ]);

    expect(convertRoleplayStudySessions([roleplayReady], states)[0]).toMatchObject({
      href: undefined,
      disabled: true,
    });
    expect(convertRoleplayStudySessions([roleplayCompleted], states)[0]).toMatchObject({
      href: `/roleplay-sessions/${roleplayCompleted.id}/result`,
      disabled: false,
    });
    expect(convertMemorizationStudySessions([memorizationInProgress], states)[0]).toMatchObject({
      href: undefined,
      disabled: true,
    });
  });
});

function createRoleplaySession(overrides: Partial<RoleplaySession> = {}): RoleplaySession {
  return {
    id: "11111111-1111-4111-8111-111111111111" as SessionId,
    ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
    sourceMaterialId: "99999999-9999-4999-8999-999999999999" as MaterialId,
    materialTitleSnapshot: "Airport Check-in",
    situationSnapshot: "Checking in.",
    tagsSnapshot: [],
    selectedLearnerSpeakerOrder: 1,
    speakerSnapshots: [
      { id: "speaker-1" as SpeakerId, order: 1, displayName: "Staff" },
      { id: "speaker-2" as SpeakerId, order: 2, displayName: "Passenger" },
    ],
    lineSnapshots: [],
    currentLineOrder: 0,
    state: RoleplaySessionState.IN_PROGRESS,
    startedAt: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date("2026-06-13T00:00:00.000Z"),
    updatedAt: new Date("2026-06-13T00:10:00.000Z"),
    ...overrides,
  };
}

function createMemorizationSession(
  overrides: Partial<MemorizationSession> = {},
): MemorizationSession {
  return {
    id: "33333333-3333-4333-8333-333333333333" as SessionId,
    ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
    sourceMaterialId: "99999999-9999-4999-8999-999999999999" as MaterialId,
    materialTitleSnapshot: "Daily Speaking",
    tagsSnapshot: [],
    paragraphSnapshots: [],
    currentParagraphOrder: 0,
    currentSentenceOrder: 0,
    state: MemorizationSessionState.IN_PROGRESS,
    startedAt: null,
    completedAt: null,
    deletedAt: null,
    createdAt: new Date("2026-06-13T00:00:00.000Z"),
    updatedAt: new Date("2026-06-13T00:10:00.000Z"),
    ...overrides,
  };
}
