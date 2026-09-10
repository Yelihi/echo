import type { RoleplayRecordingTurn } from "@/entities/roleplay-session/models/recordingTurns";
export type RoleplayReadyRole = "learner" | "partner";

export type RoleplayReadyEvaluationMode = "exact" | "context";

export type RoleplayReadyVoice = "emma" | "james" | "sofia";

export interface RoleplayReadyMaterial {
  id: string;
  tags: string[];
  title: string;
  description: string;
  lineCount: number;
  learnerTurnCount: number;
  estimatedMinutes: number;
  partnerRole?: string;
  partnerLine?: string;
  recordingTurns?: readonly RoleplayRecordingTurn[];
  previewLines?: readonly { label: string; text: string }[];
}

export interface RoleplayReadySettings {
  role: RoleplayReadyRole;
  evaluationMode: RoleplayReadyEvaluationMode;
  voice: RoleplayReadyVoice;
  speed: number;
}
