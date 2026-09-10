// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material";
import type { CreateRoleplaySessionSnapshot } from "@/entities/roleplay-session";
import type { SpeakerId } from "@/entities/value-object";

export function convertRolePlayMaterialToSessionSnapshot(
  material: RoleplayMaterial,
  selectedLearnerSpeakerId: SpeakerId,
  settings: Pick<CreateRoleplaySessionSnapshot, "partnerVoice" | "speechSpeed" | "evaluationMode">,
): CreateRoleplaySessionSnapshot {
  return {
    material: structuredClone(material),
    selectedLearnerSpeakerId,
    partnerVoice: settings.partnerVoice,
    speechSpeed: settings.speechSpeed,
    evaluationMode: settings.evaluationMode ?? "exact",
  };
}
