import type {
  GrammarSession,
  GrammarSessionMode,
  GrammarSessionError,
} from "@/entities/grammar-session";
export type GrammarSessionResult =
  | { ok: true; data: GrammarSession }
  | { ok: false; code: GrammarSessionError["code"] };

export interface GrammarPracticeLauncherProps {
  noteId: string;
  activeSessions: Partial<Record<GrammarSessionMode, string>>;
  onStart: (input: {
    noteId: string;
    requestId: string;
    mode: GrammarSessionMode;
  }) => Promise<
    GrammarSessionResult | { ok: false; code: "NOT_READY" | "NOT_INVITED" | "RATE_LIMITED" }
  >;
  onOpen: (sessionId: string) => void;
}
