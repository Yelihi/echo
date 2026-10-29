import { z } from "zod";
import { GrammarNotePersistenceError, validDirectReading } from "@/entities/grammar-note";
import { exampleOutputSchema } from "./schema";

const textBlocks = z
  .array(
    z
      .object({
        text: z.string().min(1).max(4000),
        korean: z.string().min(1).max(4000),
      })
      .strict(),
  )
  .min(1)
  .max(50);

export const generatedExamplesSchema = z
  .object({
    examples: z
      .array(
        exampleOutputSchema.shape.examples.element
          .omit({ directReading: true })
          .extend({ directReading: textBlocks }),
      )
      .min(1)
      .max(3),
  })
  .strict();

export function resolveGeneratedReading(sentence: string, blocks: z.infer<typeof textBlocks>) {
  let cursor = 0;
  const result = blocks.map(({ text, korean }, index) => {
    const exact = text.trim();
    const position = sentence.indexOf(exact, cursor);
    if (!exact || position < 0 || sentence.slice(cursor, position).trim()) {
      throw new GrammarNotePersistenceError("INVALID_RESPONSE");
    }
    const start = cursor;
    cursor = position + exact.length;
    if (index === blocks.length - 1 && !sentence.slice(cursor).trim()) cursor = sentence.length;
    return { start, end: cursor, korean };
  });
  if (!validDirectReading(sentence, result))
    throw new GrammarNotePersistenceError("INVALID_RESPONSE");
  return result;
}
