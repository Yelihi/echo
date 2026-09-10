import type { RoleplayPartnerVoice } from "@/entities/roleplay-session";
export type SpeakRolePlayPartnerLineResult =
  | { code: "SUCCESS"; audioBase64: string; mimeType: "audio/mpeg" }
  | { code: "TTS-001" }
  | { code: "TTS-002" }
  | { code: "TTS-003" }
  | { code: "TTS-004" };

export type SpeakRolePlayPartnerLineInput =
  | { mode: "preview"; voice: `${RoleplayPartnerVoice}`; speed: number }
  | { mode: "session"; sessionId: string; learnerLineId?: string; closing?: boolean };

export type ResolvedPartnerSpeech =
  | { code: "SUCCESS"; text: string; voice: `${RoleplayPartnerVoice}`; speed: number }
  | { code: "TTS-002" };
