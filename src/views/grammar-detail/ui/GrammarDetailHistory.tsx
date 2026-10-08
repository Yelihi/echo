"use client";

import type { GrammarSessionHistory } from "@/entities/grammar-session";
import { GrammarHistory } from "@/features/grammar-history";
import { getGrammarHistory } from "@/features/grammar-history/services/actions/getGrammarHistory";

export function GrammarDetailHistory({
  noteId,
  backHref,
  initialHistory,
}: {
  noteId: string;
  backHref: string;
  initialHistory?: GrammarSessionHistory;
}) {
  return (
    <GrammarHistory
      noteId={noteId}
      initialData={initialHistory}
      load={getGrammarHistory}
      resultHref={(id) => `/grammar-sessions/${id}/result?returnTo=${encodeURIComponent(backHref)}`}
    />
  );
}
