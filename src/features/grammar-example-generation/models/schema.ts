import { z } from "zod";
import { grammarExampleSchema } from "@/entities/grammar-note";
import {
  grammarDirectReadingSchema,
  validDirectReading,
} from "@/entities/grammar-note/models/schema";

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
    candidates: z
      .array(
        grammarExampleSchema.refine(
          (example) =>
            !!example.directReading &&
            englishText.safeParse(example.sentence).success &&
            koreanText.safeParse(example.translation).success &&
            koreanText.safeParse(example.targetExplanation).success,
          "영한 예문과 직독직해 재생성이 필요합니다.",
        ),
      )
      .min(1)
      .max(3),
  })
  .strict();

const text = z.string().min(1).max(4000);
const englishText = text.refine(
  (value) => /[A-Za-z]/.test(value) && !/\p{Script=Hangul}/u.test(value),
  "영어 문장이 필요합니다.",
);
const koreanText = text.refine(
  (value) => /\p{Script=Hangul}/u.test(value),
  "한국어 뜻이 필요합니다.",
);

export const regenerateDirectReadingCommandSchema = z
  .object({
    noteId: z.string().uuid(),
    expectedVersion: z.number().int().positive(),
    sentence: englishText,
  })
  .strict();

export const directReadingOutputSchema = z
  .object({
    directReading: grammarDirectReadingSchema,
  })
  .strict();

export function parseDirectReading(sentence: string, output: unknown) {
  const blocks = directReadingOutputSchema.parse(output).directReading;
  if (!validDirectReading(sentence, blocks)) throw new Error("INVALID_DIRECT_READING");
  return blocks;
}

export const exampleOutputSchema = z
  .object({
    examples: z
      .array(
        z
          .object({
            sentence: englishText,
            translation: koreanText,
            targetExplanation: koreanText,
            directReading: grammarDirectReadingSchema,
          })
          .strict(),
      )
      .min(1)
      .max(3),
  })
  .strict();
