import { GrammarDetailView, grammarReturnTo } from "@/views/grammar-detail";
import { loadCachedGrammarDetailNote } from "@/views/grammar-detail/services/loadGrammarNote";
import { getCachedGrammarDetailHistory } from "@/features/grammar-history/services/actions/getGrammarHistory";

export default async function GrammarNotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const note = await loadCachedGrammarDetailNote(id);
  const history = await getCachedGrammarDetailHistory(id);

  return (
    <GrammarDetailView
      initialHistory={history.ok ? history.data : undefined}
      note={note}
      backHref={grammarReturnTo(query.returnTo)}
    />
  );
}
