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
