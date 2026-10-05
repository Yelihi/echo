import { GrammarSessionRepository } from "@/entities/grammar-session";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import { loadGrammarNote, grammarReturnTo } from "@/views/grammar-detail";
import { GrammarPracticeView } from "@/views/grammar-practice/GrammarPracticeView";
export default async function GrammarPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const note = await loadGrammarNote(id);
  const repository = new GrammarSessionRepository(await createSupabaseServerClient());
  const [recall, exam] = await observeOperation({
    operation: "grammar.session.active",
    resourceId: id,
    recordEvent: recordOperationEvent,
    execute: () =>
      Promise.all([repository.findActive(id, "recall"), repository.findActive(id, "exam")]),
  });
  return (
    <GrammarPracticeView
      returnTo={grammarReturnTo(query.returnTo)}
      noteId={id}
      title={note.metadata.title}
      backHref={`/grammar/${id}?returnTo=${encodeURIComponent(grammarReturnTo(query.returnTo))}`}
      activeSessions={{ recall: recall?.id, exam: exam?.id }}
    />
  );
}
