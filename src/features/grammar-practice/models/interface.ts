import type { GrammarSession } from "@/entities/grammar-session";
export type GrammarSessionResult =
  | { ok: true; data: GrammarSession }
  | { ok: false; message: string };
