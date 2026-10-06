import type { GrammarSession, GrammarSessionMode } from "@/entities/grammar-session";
export type GrammarSessionResult =
  | { ok: true; data: GrammarSession }
  | { ok: false; message: string };

export interface GrammarPracticeLauncherProps {
  noteId: string;
  activeSessions: Partial<Record<GrammarSessionMode, string>>;
  onStart: (input: {
    noteId: string;
    requestId: string;
    mode: GrammarSessionMode;
  }) => Promise<GrammarSessionResult>;
  onOpen: (sessionId: string) => void;
}
