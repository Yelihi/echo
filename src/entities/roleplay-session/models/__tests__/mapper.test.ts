import { describe, expect, it } from "@jest/globals";

import type {
  RoleplaySessionLineRow,
  RoleplaySessionRow,
  RoleplaySessionTagRow,
} from "@/entities/roleplay-session/models/mapper";
import { mapRoleplaySessionRowToEntity } from "@/entities/roleplay-session/models/mapper";

describe("mapRoleplaySessionRowToEntity", () => {
  it("maps roleplay session snapshot rows into a domain entity", () => {
    const session = createSessionRow();
    const tags: RoleplaySessionTagRow[] = [
      createTagRow({ display_name: "Travel", normalized_name: "travel" }),
      createTagRow({ display_name: "Airport", normalized_name: "airport" }),
    ];
    const lines: RoleplaySessionLineRow[] = [
      createLineRow({
        id: "33333333-3333-4333-8333-333333333333",
        line_order: 1,
        speaker_order: 2,
        text_snapshot: "I would like an aisle seat.",
      }),
      createLineRow({
        id: "22222222-2222-4222-8222-222222222222",
        line_order: 0,
        speaker_order: 1,
        text_snapshot: "How can I help you?",
        translation_snapshot: "무엇을 도와드릴까요?",
      }),
    ];

    const entity = mapRoleplaySessionRowToEntity({ session, tags, lines });

    expect(entity).toMatchObject({
      id: session.id,
      ownerId: session.user_id,
      sourceMaterialId: session.material_id,
      materialTitleSnapshot: "Airport Check-in",
      situationSnapshot: "Checking in at the airport counter.",
      tagsSnapshot: [
        { displayName: "Airport", normalizedName: "airport" },
        { displayName: "Travel", normalizedName: "travel" },
      ],
      selectedLearnerSpeakerOrder: 2,
      speakerSnapshots: [
        {
          id: `${session.id}:speaker:1`,
          order: 1,
          displayName: "Staff",
        },
        {
          id: `${session.id}:speaker:2`,
          order: 2,
          displayName: "Passenger",
        },
      ],
      lineSnapshots: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          order: 0,
          speakerOrder: 1,
          text: "How can I help you?",
          translation: "무엇을 도와드릴까요?",
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          order: 1,
          speakerOrder: 2,
          text: "I would like an aisle seat.",
          translation: null,
        },
      ],
      currentLineOrder: 1,
      state: "in_progress",
      completedAt: null,
      deletedAt: null,
    });
    expect(entity.startedAt).toEqual(new Date(session.started_at as string));
    expect(entity.createdAt).toEqual(new Date(session.created_at));
    expect(entity.updatedAt).toEqual(new Date(session.updated_at));
  });

  it("rejects an unknown selected learner speaker order", () => {
    const session = createSessionRow({ selected_learner_speaker_order: 3 });

    expect(() => mapRoleplaySessionRowToEntity({ session, tags: [], lines: [] })).toThrow(
      "Invalid roleplay session speaker order: 3",
    );
  });

  it("rejects a line with an unknown speaker order", () => {
    const session = createSessionRow();
    const invalidLine = createLineRow({ speaker_order: 3 });

    expect(() =>
      mapRoleplaySessionRowToEntity({
        session,
        tags: [],
        lines: [invalidLine],
      }),
    ).toThrow("Invalid roleplay session speaker order: 3");
  });
});

function createSessionRow(overrides: Partial<RoleplaySessionRow> = {}): RoleplaySessionRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    material_id: "99999999-9999-4999-8999-999999999999",
    material_title_snapshot: "Airport Check-in",
    situation_snapshot: "Checking in at the airport counter.",
    speaker_one_name_snapshot: "Staff",
    speaker_two_name_snapshot: "Passenger",
    selected_learner_speaker_order: 2,
    current_line_order: 1,
    status: "in_progress",
    started_at: "2026-06-13T00:01:00.000Z",
    completed_at: null,
    deleted_at: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:10:00.000Z",
    ...overrides,
  };
}

function createTagRow(overrides: Partial<RoleplaySessionTagRow> = {}): RoleplaySessionTagRow {
  return {
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    display_name: "Travel",
    normalized_name: "travel",
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createLineRow(overrides: Partial<RoleplaySessionLineRow> = {}): RoleplaySessionLineRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    line_order: 0,
    speaker_order: 1,
    text_snapshot: "How can I help you?",
    translation_snapshot: null,
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}
