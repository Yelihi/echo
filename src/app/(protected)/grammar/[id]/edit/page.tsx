import { loadGrammarNote, grammarReturnTo } from "@/views/grammar-detail";
import { GrammarEditorView } from "@/views/grammar-editor";

import { GrammarEditorClient } from "../../_components/GrammarEditorClient";

export default async function GrammarNoteEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);

  return (
    <GrammarEditorView editing>
      <GrammarEditorClient
        initialNote={await loadGrammarNote(id)}
        backHref={grammarReturnTo(query.returnTo)}
      />
    </GrammarEditorView>
  );
}
