import { redirect } from "next/navigation";
import { loadGrammarSession } from "@/views/grammar-session/services/loadGrammarSession";
import { GrammarSessionView } from "@/views/grammar-session/ui/GrammarSessionView";
import { GrammarExamPreparation } from "@/views/grammar-session/ui/GrammarExamPreparation";
import { grammarReturnTo } from "@/views/grammar-detail";

export default async function GrammarSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const returnTo = grammarReturnTo(query.returnTo);
  const session = await loadGrammarSession(id);

  if (session.status === "completed")
    redirect(`/grammar-sessions/${id}/result?returnTo=${encodeURIComponent(returnTo)}`);

  if (session.mode === "exam" && !session.questions.some((question) => question.kind === "novel"))
    return <GrammarExamPreparation returnTo={returnTo} session={session} />;

  return <GrammarSessionView returnTo={returnTo} session={session} />;
}
