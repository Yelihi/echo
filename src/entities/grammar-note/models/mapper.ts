import type { Json } from "@/shared/lib/supabase/database.types";
import type { GrammarNote, GrammarNoteContent } from "./entity";
import type { GrammarNotePage } from "./repository";
import { GrammarNotePersistenceError } from "./errors";
import { grammarNotePageSchema, grammarNoteRowSchema } from "./schema";

export function mapGrammarNoteRowToEntity(value: unknown): GrammarNote {
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

export function mapGrammarNotePageToEntity(
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

// Supabase Json은 변경 가능한 배열을 요구하므로 readonly 배열을 복사해 일반 JSON 객체로 구성한다.
// 원문과 구간 값은 함께 해석되므로 직렬화 과정에서 공백이나 오프셋을 보정하지 않는다.
export function mapGrammarNoteContentToJson(content: GrammarNoteContent): Json {
  return {
    source: { ...content.source },
    metadata: { ...content.metadata, tags: [...content.metadata.tags] },
    analysis: {
      ...content.analysis,
      chunks: content.analysis.chunks.map((chunk) => ({ ...chunk, range: { ...chunk.range } })),
      syntax: content.analysis.syntax.map((item) => ({
        ...item,
        ranges: item.ranges.map((range) => ({ ...range })),
      })),
      constructions: content.analysis.constructions.map((item) => ({
        ...item,
        ranges: item.ranges.map((range) => ({ ...range })),
      })),
    },
    examples: content.examples.map((example) => ({ ...example })),
  };
}
