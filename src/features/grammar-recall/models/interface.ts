import type { ReactNode } from "react";
import type {
  GrammarSession,
  GrammarSessionQuestion,
  SaveGrammarAnswersInput,
  CompleteGrammarSessionInput,
} from "@/entities/grammar-session";
export type RecallActionResult =
  | { ok: true; data: GrammarSession }
  | { ok: false; message: string };
export interface GrammarRecallProps {
  readonly initialSession: GrammarSession;
  readonly save: (input: SaveGrammarAnswersInput) => Promise<RecallActionResult>;
  readonly complete: (input: CompleteGrammarSessionInput) => Promise<RecallActionResult>;
  readonly onComplete: (session: GrammarSession) => void;
  readonly onExit: () => void;
  readonly renderAudio?: (question: GrammarSessionQuestion) => ReactNode;
}
export interface RecallDraft {
  values: Record<string, string>;
  whole: string;
  assessment: "remembered" | "again" | null;
}
export interface RecallQuestionProps {
  readonly session: GrammarSession;
  readonly busy: boolean;
  readonly error: string;
  readonly onMove: (draft: RecallDraft, direction: "next" | "back" | "exit") => void;
  readonly audio?: ReactNode;
}
export interface RecallSegment {
  readonly id: string;
  readonly text: string;
  readonly hidden: boolean;
  readonly meaning: string;
}
