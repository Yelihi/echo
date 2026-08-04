export type RoleplayReadyRole = "learner" | "partner";
export type RoleplayReadyEvaluationMode = "exact" | "context";
export type RoleplayReadyVoice = "soft" | "bright" | "calm";

export interface RoleplayReadyMaterial {
  id: string;
  tags: string[];
  title: string;
  description: string;
  lineCount: number;
  learnerTurnCount: number;
  estimatedMinutes: number;
  difficulty: string;
}

export interface RolePlayReadyViewProps {
  materialId: string;
}
