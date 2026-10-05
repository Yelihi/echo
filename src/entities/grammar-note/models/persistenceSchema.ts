import { z } from "zod";
import { grammarMetadataSchema, grammarNoteContentSchema, grammarSourceSchema } from "./schema";

export const grammarNoteIdSchema = z.string().uuid();
export const createGrammarNoteSchema = z
  .object({
    requestId: grammarNoteIdSchema,
    content: grammarNoteContentSchema,
  })
  .strict();
export const updateGrammarNoteSchema = z
  .object({
    id: grammarNoteIdSchema,
    expectedVersion: z.number().int().min(1).max(2147483647),
    content: grammarNoteContentSchema,
  })
  .strict();
export const findGrammarNotesSchema = z
  .object({
    page: z.number().int().min(1).max(2147483647).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    query: z.string().trim().max(200).default(""),
  })
  .strict();

const rowIdentity = {
  id: grammarNoteIdSchema,
  owner_id: grammarNoteIdSchema,
  version: z.number().int().min(1).max(2147483647),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
};
export const grammarNoteRowSchema = z
  .object({
    ...rowIdentity,
    content: grammarNoteContentSchema,
  })
  .strict();
export const grammarNotePageSchema = z
  .object({
    items: z.array(
      z
        .object({
          ...rowIdentity,
          title: grammarMetadataSchema.shape.title,
          sentence: grammarSourceSchema.shape.sentence,
          tags: grammarMetadataSchema.shape.tags,
        })
        .strict(),
    ),
    total: z.number().int().nonnegative().safe(),
  })
  .strict();
