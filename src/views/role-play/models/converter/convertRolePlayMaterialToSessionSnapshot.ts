// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material";
import type { CreateRoleplaySessionSnapshot } from "@/entities/roleplay-session";
import type { SpeakerId } from "@/entities/value-object";

export function convertRolePlayMaterialToSessionSnapshot(
  material: RoleplayMaterial,
  selectedLearnerSpeakerId: SpeakerId,
): CreateRoleplaySessionSnapshot {
  return {
    material: structuredClone(material),
    selectedLearnerSpeakerId,
  };
}
