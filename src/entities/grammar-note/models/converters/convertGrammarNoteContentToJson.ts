import type { Json } from "@/shared/lib/supabase/database.types";
import type { GrammarNoteContent } from "../entity";

/** readonly 도메인 값을 Supabase JSON 계약에 맞춘다. 원문/범위의 값을 변형하지 않는다. */
export function convertGrammarNoteContentToJson(content: GrammarNoteContent): Json {
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
