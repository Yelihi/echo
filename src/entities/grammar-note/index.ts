export type { GrammarSource, GrammarMetadata, TextRange, SyntaxRole } from "./models/value-objects";
export type {
  SentenceChunk,
  SyntaxAnnotation,
  ConstructionAnnotation,
  SentenceAnalysis,
  GrammarExample,
  GrammarNoteContent,
  GrammarNote,
  PrecheckResult,
} from "./models/entity";
export {
  grammarSourceSchema,
  grammarMetadataSchema,
  sentenceAnalysisSchema,
  grammarExampleSchema,
  grammarNoteContentSchema,
  precheckResultSchema,
} from "./models/schema";
export { isValidTextRange, getAnalysisIssues } from "./models/validation";

export type {
  CreateGrammarNoteInput,
  UpdateGrammarNoteInput,
  FindGrammarNotesParams,
  GrammarNoteSummary,
  GrammarNotePage,
  GrammarNoteRepositoryPort,
} from "./models/repository";
export { GrammarNotePersistenceError } from "./models/persistenceError";
export type { GrammarNotePersistenceErrorCode } from "./models/persistenceError";
export { GrammarNoteRepository } from "./infrastructure/GrammarNoteRepository";
