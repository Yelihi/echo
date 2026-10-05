import type { GrammarNote } from "../entity";
import type { GrammarNotePage } from "../repository";
import { GrammarNotePersistenceError } from "../persistenceError";
import { grammarNotePageSchema, grammarNoteRowSchema } from "../persistenceSchema";

export function convertGrammarNoteRowToEntity(value: unknown): GrammarNote {
  const parsed = grammarNoteRowSchema.safeParse(value);
  if (!parsed.success) throw new GrammarNotePersistenceError("INVALID_RESPONSE");
  const row = parsed.data;
  return {
    ...row.content,
    id: row.id,
    ownerId: row.owner_id,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function convertGrammarNotePageToEntity(
  value: unknown,
  pagination: Pick<GrammarNotePage, "page" | "pageSize">,
): GrammarNotePage {
  const parsed = grammarNotePageSchema.safeParse(value);
  if (!parsed.success) throw new GrammarNotePersistenceError("INVALID_RESPONSE");
  return {
    ...pagination,
    total: parsed.data.total,
    items: parsed.data.items.map((row) => ({
      id: row.id,
      ownerId: row.owner_id,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      title: row.title,
      sentence: row.sentence,
      tags: row.tags,
    })),
  };
}
