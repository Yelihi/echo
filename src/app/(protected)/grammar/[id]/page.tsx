import { GrammarDetailView, loadGrammarNote, grammarReturnTo } from "@/views/grammar-detail";
import { getGrammarHistory } from "@/features/grammar-history/services/actions/getGrammarHistory";
export default async function GrammarNotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const note = await loadGrammarNote(id);
  const history = await getGrammarHistory(id, 1);
  return (
    <GrammarDetailView
      initialHistory={history.ok ? history.data : undefined}
      note={note}
      backHref={grammarReturnTo(query.returnTo)}
    />
  );
}
