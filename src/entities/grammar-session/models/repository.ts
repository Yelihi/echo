import type {
  GrammarSession,
  GrammarSessionMode,
  StartGrammarSessionInput,
  SaveGrammarAnswersInput,
  CompleteGrammarSessionInput,
} from "./schema";

export interface GrammarSessionSummary {
  id: string;
  noteId: string;
  title: string;
  mode: GrammarSessionMode;
  startedAt: string;
  completedAt: string;
  questionCount: number;
}

export interface GrammarSessionHistoryInput {
  noteId?: string;
  page?: number;
  pageSize?: number;
}

export interface GrammarSessionHistory {
  items: GrammarSessionSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GrammarSessionRepositoryPort {
  start(input: StartGrammarSessionInput): Promise<GrammarSession>;
  findById(id: string): Promise<GrammarSession | null>;
  findActive(noteId: string, mode: GrammarSessionMode): Promise<GrammarSession | null>;
  saveAnswers(input: SaveGrammarAnswersInput): Promise<GrammarSession>;
  complete(input: CompleteGrammarSessionInput): Promise<GrammarSession>;
  findHistory(input?: GrammarSessionHistoryInput): Promise<GrammarSessionHistory>;
}
