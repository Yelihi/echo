import { describe, expect, it } from "@jest/globals";

import type {
  RoleplayLineRow,
  RoleplayMaterialRow,
  RoleplayMaterialTagRow,
} from "@/entities/roleplay-material/models/mapper";
import { mapRoleplayMaterialRowToEntity } from "@/entities/roleplay-material/models/mapper";

describe("mapRoleplayMaterialRowToEntity", () => {
  it("maps roleplay material rows into a stable domain entity", () => {
    const material = createMaterialRow();
    const tags: RoleplayMaterialTagRow[] = [
      createTagRow({ display_name: "Travel", normalized_name: "travel" }),
      createTagRow({ display_name: "Airport", normalized_name: "airport" }),
    ];
    const lines: RoleplayLineRow[] = [
      createLineRow({
        id: "33333333-3333-4333-8333-333333333333",
        line_order: 1,
        speaker_order: 2,
        text: "I would like an aisle seat.",
      }),
      createLineRow({
        id: "22222222-2222-4222-8222-222222222222",
        line_order: 0,
        speaker_order: 1,
        text: "How can I help you?",
        translation: "무엇을 도와드릴까요?",
      }),
    ];

    const entity = mapRoleplayMaterialRowToEntity({ material, tags, lines });

    expect(entity).toMatchObject({
      id: material.id,
      ownerId: material.user_id,
      title: "Airport Check-in",
      situation: "Checking in at the airport counter.",
      tags: [
        { displayName: "Airport", normalizedName: "airport" },
        { displayName: "Travel", normalizedName: "travel" },
      ],
      speakers: [
        {
          id: `${material.id}:speaker:1`,
          order: 1,
          displayName: "Staff",
        },
        {
          id: `${material.id}:speaker:2`,
          order: 2,
          displayName: "Passenger",
        },
      ],
      lines: [
        {
          id: "22222222-2222-4222-8222-222222222222",
          order: 0,
          speakerId: `${material.id}:speaker:1`,
          text: "How can I help you?",
          translation: "무엇을 도와드릴까요?",
        },
        {
          id: "33333333-3333-4333-8333-333333333333",
          order: 1,
          speakerId: `${material.id}:speaker:2`,
          text: "I would like an aisle seat.",
          translation: null,
        },
      ],
      state: "active",
      deletedAt: null,
    });
    expect(entity.createdAt).toEqual(new Date(material.created_at));
    expect(entity.updatedAt).toEqual(new Date(material.updated_at));
  });

  it("rejects a line with an unknown speaker order", () => {
    const material = createMaterialRow();
    const invalidLine = createLineRow({ speaker_order: 3 });

    expect(() =>
      mapRoleplayMaterialRowToEntity({
        material,
        tags: [],
        lines: [invalidLine],
      }),
    ).toThrow("Invalid roleplay speaker order: 3");
  });
});

function createMaterialRow(overrides: Partial<RoleplayMaterialRow> = {}): RoleplayMaterialRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    title: "Airport Check-in",
    situation: "Checking in at the airport counter.",
    speaker_one_name: "Staff",
    speaker_two_name: "Passenger",
    status: "active",
    deleted_at: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:10:00.000Z",
    ...overrides,
  };
}

function createTagRow(overrides: Partial<RoleplayMaterialTagRow> = {}): RoleplayMaterialTagRow {
  return {
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    display_name: "Travel",
    normalized_name: "travel",
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createLineRow(overrides: Partial<RoleplayLineRow> = {}): RoleplayLineRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    material_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    line_order: 0,
    speaker_order: 1,
    text: "How can I help you?",
    translation: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}
