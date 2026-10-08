import type { GrammarNotePage } from "@/entities/grammar-note";

export interface GrammarLibraryQuery {
  readonly page: number;
  readonly query: string;
}

export interface GrammarNoteListProps {
  readonly data: GrammarNotePage;
  readonly query: string;
}
