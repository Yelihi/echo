import type { GrammarSource, GrammarMetadata, TextRange, SyntaxRole } from "./value-objects";

export interface SentenceChunk {
  readonly id: string;
  readonly range: TextRange;
  readonly literalMeaning: string;
  readonly explanation: string;
}

export interface SyntaxAnnotation {
  readonly id: string;
  readonly ranges: readonly TextRange[];
  readonly parentId: string | null;
  readonly role: SyntaxRole;
  readonly label: string;
  readonly explanation: string;
}

export interface ConstructionAnnotation {
  readonly id: string;
  readonly name: string;
  readonly ranges: readonly TextRange[];
  readonly meaning: string;
  readonly explanation: string;
}

export interface SentenceAnalysis {
  readonly sourceText: string;
  readonly sourceRevision: number;
  readonly chunks: readonly SentenceChunk[];
  readonly syntax: readonly SyntaxAnnotation[];
  readonly constructions: readonly ConstructionAnnotation[];
  readonly naturalTranslation: string;
  readonly reviewStatus: "needs-review" | "reviewed";
}

export interface GrammarExample {
  readonly id: string;
  readonly sentence: string;
  readonly translation: string;
  readonly targetExplanation: string;
  readonly reviewStatus: "needs-review" | "reviewed";
}

export interface GrammarNoteContent {
  readonly source: GrammarSource;
  readonly metadata: GrammarMetadata;
  readonly analysis: SentenceAnalysis;
  readonly examples: readonly GrammarExample[];
}

export interface GrammarNote extends GrammarNoteContent {
  readonly id: string;
  readonly ownerId: string;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type PrecheckResult =
  | { readonly status: "passed"; readonly sourceRevision: number }
  | {
      readonly status: "needs-revision" | "uncertain";
      readonly sourceRevision: number;
      readonly issues: readonly {
        readonly field: "sentence" | "learningNote";
        readonly message: string;
        readonly suggestion: string | null;
      }[];
    };
