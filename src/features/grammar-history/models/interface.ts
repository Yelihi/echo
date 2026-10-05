import type { GrammarSessionHistory } from "@/entities/grammar-session";
export type GrammarHistoryResult =
  | { ok: true; data: GrammarSessionHistory }
  | { ok: false; message: string };
export interface GrammarHistoryProps {
  readonly noteId: string;
  readonly resultHref?: (sessionId: string) => string;
  readonly initialData?: GrammarSessionHistory;
  readonly load: (noteId: string, page: number) => Promise<GrammarHistoryResult>;
}
