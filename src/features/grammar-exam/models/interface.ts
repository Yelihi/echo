import type { GrammarExamError } from "./errors";
import type {
  GrammarSession,
  GrammarSessionError,
  GrammarSessionQuestion,
  SaveGrammarAnswersInput,
  CompleteGrammarSessionInput,
} from "@/entities/grammar-session";
import type { GrammarExamFeedback } from "./schema";
export type GrammarExamErrorCode = GrammarExamError["code"] | GrammarSessionError["code"];
export type GrammarExamSessionResult =
  | { ok: true; data: GrammarSession }
  | { ok: false; code: GrammarExamErrorCode };
export type GrammarExamFeedbackResult =
  | { ok: true; data: GrammarExamFeedback }
  | { ok: false; code: GrammarExamErrorCode };
export interface GrammarExamProvider {
  createPrompts(input: {
    targetGrammar: string;
    existingTranslations: readonly string[];
  }): Promise<unknown>;
  grade(input: {
    targetGrammar: string;
    question: GrammarSessionQuestion;
    answer: string;
  }): Promise<unknown>;
}
export interface GrammarExamPlayerProps {
  initialSession: GrammarSession;
  onExit: () => void;
  onSaveAnswers: (input: SaveGrammarAnswersInput) => Promise<GrammarExamSessionResult>;
  onComplete: (input: CompleteGrammarSessionInput) => Promise<GrammarExamSessionResult>;
  onCompleted: (session: GrammarSession) => void;
}
export interface GrammarExamResultProps {
  session: GrammarSession;
  initialFeedback?: GrammarExamFeedback[];
  /** 새 시험 완료 직후에만 사용합니다. 기록 열람은 기본값 false입니다. */
  autoRequest?: boolean;
  onRequestFeedback: (input: {
    sessionId: string;
    questionId: string;
  }) => Promise<GrammarExamFeedbackResult>;
}
