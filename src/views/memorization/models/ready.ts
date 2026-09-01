export type MemorizationReadyMode = "read" | "translate" | "title";

export interface MemorizationReadyMaterial {
  id: string;
  tags: string[];
  title: string;
  description: string;
  paragraphCount: number;
  wordCount: number;
  estimatedMinutes: number;
  difficulty: string;
}

export interface MemorizationReadyViewProps {
  materialId: string;
}

export interface MemorizationReadySettings {
  mode: MemorizationReadyMode;
}

export interface CreateMemorizationSessionRequest {
  materialId: string;
}

export type CreateMemorizationSessionResult =
  | { code: "SUCCESS"; sessionId: string }
  | { code: "MMS-001" }
  | { code: "MMS-002" }
  | { code: "MMS-003" };
