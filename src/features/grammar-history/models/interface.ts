import type { GrammarSessionHistory } from "@/entities/grammar-session";

export type GrammarHistoryResult =
  | { ok: true; data: GrammarSessionHistory }
  | { ok: false; code: "LOAD_FAILED" };

export interface GrammarHistoryProps {
  readonly noteId: string;
  readonly initialData?: GrammarSessionHistory;
  readonly load: (noteId: string, page: number) => Promise<GrammarHistoryResult>;
}
