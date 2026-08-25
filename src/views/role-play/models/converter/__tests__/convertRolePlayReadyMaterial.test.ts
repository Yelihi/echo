import { describe, expect, it } from "@jest/globals";

// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material";
import { MaterialState } from "@/entities/roleplay-material/models/enums";
import type { LineId, MaterialId, SpeakerId, UserId } from "@/entities/value-object";

// views
import { convertRolePlayMaterialToReadyMaterial } from "@/views/role-play/models/converter/convertRolePlayReadyMaterial";

describe("convertRolePlayMaterialToReadyMaterial", () => {
  it("uses the partner speaker name and first partner line instead of a tag-derived difficulty", () => {
    const materialId = "11111111-1111-4111-8111-111111111111" as MaterialId;
    const partnerId = `${materialId}:speaker:1` as SpeakerId;
    const learnerId = `${materialId}:speaker:2` as SpeakerId;
    const material: RoleplayMaterial = {
      id: materialId,
      ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
      title: "Airport Check-in",
      situation: "Checking in at the airport counter.",
      tags: [
        { displayName: "Airport", normalizedName: "airport" },
        { displayName: "Travel", normalizedName: "travel" },
      ],
      speakers: [
        { id: partnerId, order: 1, displayName: "Staff" },
        { id: learnerId, order: 2, displayName: "Passenger" },
      ],
      lines: [
        {
          id: "22222222-2222-4222-8222-222222222222" as LineId,
          order: 0,
          speakerId: partnerId,
          text: "How can I help you?",
          translation: null,
        },
        {
          id: "33333333-3333-4333-8333-333333333333" as LineId,
          order: 1,
          speakerId: learnerId,
          text: "I would like an aisle seat.",
          translation: null,
        },
      ],
      state: MaterialState.ACTIVE,
      deletedAt: null,
      createdAt: new Date("2026-06-13T00:00:00.000Z"),
      updatedAt: new Date("2026-06-13T00:10:00.000Z"),
    };

    expect(convertRolePlayMaterialToReadyMaterial(material)).toMatchObject({
      title: "Airport Check-in",
      tags: ["Airport", "Travel"],
      partnerRole: "Staff",
      partnerLine: "How can I help you?",
    });
    expect(convertRolePlayMaterialToReadyMaterial(material)).not.toHaveProperty("difficulty");
  });
});
