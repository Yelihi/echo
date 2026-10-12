import type { UserId } from "@/entities/value-object";
import { z } from "zod";

export const grammarDifficultySchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);
export type GrammarDifficulty = z.infer<typeof grammarDifficultySchema>;
export const DEFAULT_GRAMMAR_DIFFICULTY: GrammarDifficulty = 2;

export interface EchoUserProfile {
  readonly id: UserId;
  readonly displayName: string | null;
  readonly exampleDifficulty: GrammarDifficulty;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
