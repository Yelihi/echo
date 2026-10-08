import type { GrammarNote } from "@/entities/grammar-note";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
export function createEditorNote(): GrammarNote {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    ownerId: "owner",
    version: 1,
    createdAt: "2026-10-06T00:00:00Z",
    updatedAt: "2026-10-06T00:00:00Z",
    source: {
      sentence: createGrammarAnalysis().sourceText,
      learningNote: "not A but B",
      revision: 0,
    },
    metadata: {
      source: "ai",
      sourceRevision: 0,
      title: "A가 아니라 B",
      tags: ["대조"],
      grammarKey: null,
    },
    analysis: createGrammarAnalysis(),
    examples: [],
  };
}
