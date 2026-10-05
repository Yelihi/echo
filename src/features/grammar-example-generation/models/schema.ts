import { z } from "zod";
import { grammarExampleSchema } from "@/entities/grammar-note";
export const generateExamplesCommandSchema = z
  .object({
    noteId: z.string().uuid(),
    expectedVersion: z.number().int().positive(),
    count: z.union([z.literal(1), z.literal(3)]),
  })
  .strict();
export const saveExamplesCommandSchema = z
  .object({
    noteId: z.string().uuid(),
    expectedVersion: z.number().int().positive(),
    candidates: z.array(grammarExampleSchema).min(1).max(3),
  })
  .strict();
const text = z.string().min(1).max(4000);
export const exampleOutputSchema = z
  .object({
    examples: z
      .array(z.object({ sentence: text, translation: text, targetExplanation: text }).strict())
      .min(1)
      .max(3),
  })
  .strict();
