import type { GrammarSession, GrammarSessionError } from "@/entities/grammar-session";

export type GrammarSessionResult =
  | { ok: true; data: GrammarSession }
  | { ok: false; code: GrammarSessionError["code"] };
