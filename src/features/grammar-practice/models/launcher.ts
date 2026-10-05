import type { GrammarSessionMode } from "@/entities/grammar-session";
import type { GrammarSessionResult } from "./interface";

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
