// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material";
import type {
  CreateRoleplaySessionSnapshot,
  RoleplayPartnerVoice,
} from "@/entities/roleplay-session";
import type { SpeakerId } from "@/entities/value-object";

export function convertRolePlayMaterialToSessionSnapshot(
  material: RoleplayMaterial,
  selectedLearnerSpeakerId: SpeakerId,
  settings: {
    readonly partnerVoice: RoleplayPartnerVoice;
    readonly speechSpeed: number;
  },
): CreateRoleplaySessionSnapshot {
  return {
    material: structuredClone(material),
    selectedLearnerSpeakerId,
    partnerVoice: settings.partnerVoice,
    speechSpeed: settings.speechSpeed,
  };
}
