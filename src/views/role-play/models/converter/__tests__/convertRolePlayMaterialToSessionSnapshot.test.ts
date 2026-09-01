import { describe, expect, it } from "@jest/globals";

// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material";
import { MaterialState } from "@/entities/roleplay-material/models/enums";
import type { LineId, MaterialId, SpeakerId, UserId } from "@/entities/value-object";

// views
import { convertRolePlayMaterialToSessionSnapshot } from "@/views/role-play/models/converter/convertRolePlayMaterialToSessionSnapshot";

describe("convertRolePlayMaterialToSessionSnapshot", () => {
  it("should copy the source material instead of reusing the same references", () => {
    const materialId = "11111111-1111-4111-8111-111111111111" as MaterialId;
    const partnerId = `${materialId}:speaker:1` as SpeakerId;
    const learnerId = `${materialId}:speaker:2` as SpeakerId;
    const material: RoleplayMaterial = {
      id: materialId,
      ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
      title: "Airport Check-in",
      situation: "Checking in at the airport counter.",
      tags: [{ displayName: "Airport", normalizedName: "airport" }],
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
      ],
      state: MaterialState.ACTIVE,
      deletedAt: null,
      createdAt: new Date("2026-06-13T00:00:00.000Z"),
      updatedAt: new Date("2026-06-13T00:10:00.000Z"),
    };

    const snapshot = convertRolePlayMaterialToSessionSnapshot(material, learnerId);

    expect(snapshot.selectedLearnerSpeakerId).toBe(learnerId);
    expect(snapshot.material).toEqual(material);
    expect(snapshot.material).not.toBe(material);
    expect(snapshot.material.tags).not.toBe(material.tags);
    expect(snapshot.material.tags[0]).not.toBe(material.tags[0]);
    expect(snapshot.material.speakers).not.toBe(material.speakers);
    expect(snapshot.material.speakers[0]).not.toBe(material.speakers[0]);
    expect(snapshot.material.lines).not.toBe(material.lines);
    expect(snapshot.material.lines[0]).not.toBe(material.lines[0]);
    expect(snapshot.material.createdAt).not.toBe(material.createdAt);
    expect(snapshot.material.updatedAt).not.toBe(material.updatedAt);
  });
});
