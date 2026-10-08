"use client";

import { useRouter } from "next/navigation";
import type { GrammarNote } from "@/entities/grammar-note";
import { GrammarAnalysisEditor } from "@/features/grammar-analysis-edit";
import { requestGrammarAnalysis } from "@/features/grammar-analysis/services/actions/requestGrammarAnalysis";
import { GrammarNoteEditor } from "@/features/grammar-note-editor";
import { saveGrammarNote } from "@/features/grammar-note-editor/services/actions/saveGrammarNote";

export function GrammarEditorClient({
  initialNote,
  backHref = "/grammar",
}: {
  initialNote?: GrammarNote;
  backHref?: string;
}) {
  const router = useRouter();
  const returnTo =
    backHref === "/grammar" || backHref.startsWith("/grammar?") ? backHref : "/grammar";

  return (
    <GrammarNoteEditor
      key={initialNote ? `${initialNote.id}:${initialNote.version}` : "new"}
      initialNote={initialNote}
      analyze={requestGrammarAnalysis}
      save={saveGrammarNote}
      AnalysisEditor={GrammarAnalysisEditor}
      onSaved={(note) => {
        router.push(`/grammar/${note.id}?returnTo=${encodeURIComponent(returnTo)}`);
        router.refresh();
      }}
      onExit={() =>
        router.push(
          initialNote
            ? `/grammar/${initialNote.id}?returnTo=${encodeURIComponent(returnTo)}`
            : returnTo,
        )
      }
    />
  );
}
