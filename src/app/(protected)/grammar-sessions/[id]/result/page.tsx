import { grammarReturnTo } from "@/views/grammar-detail";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
import { loadGrammarSession } from "@/views/grammar-session/services/loadGrammarSession";
import { GrammarRecallResult } from "@/views/grammar-session/ui/GrammarRecallResult";
import { GrammarExamResultView } from "@/views/grammar-session/ui/GrammarExamResultView";
import { readGrammarExamFeedback } from "@/features/grammar-exam/services/actions/examActions";
export default async function GrammarResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ feedback?: string; returnTo?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const returnTo = grammarReturnTo(query.returnTo);
  const context = `returnTo=${encodeURIComponent(returnTo)}`;
  const session = await loadGrammarSession(id);
  if (session.status !== "completed") redirect(`/grammar-sessions/${id}?${context}`);
  const feedback = session.mode === "exam" ? await readGrammarExamFeedback(id) : null;
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-8 sm:px-8">
      <BackNavigation href={`/grammar/${session.noteId}?${context}`} />
      <header className="space-y-3">
        <p className="text-xs tracking-widest text-practice-muted">PRACTICE COMPLETE</p>
        <h1 className="text-3xl font-medium text-practice-ink">
          {session.mode === "recall" ? "암기 연습" : "어법 시험"}을 마쳤어요
        </h1>
        <p className="text-sm text-practice-muted">{session.title}</p>
      </header>
      {session.mode === "recall" ? (
        <GrammarRecallResult session={session} />
      ) : (
        <>
          <p className="text-sm leading-7 text-practice-muted">
            AI 피드백은 참고용입니다. 같은 뜻과 어법을 표현하는 다양한 문장이 가능합니다.
          </p>
          {feedback && !feedback.ok && (
            <p role="alert" className="text-sm text-practice-accent">
              {feedback.message} 아래 버튼으로 각 문장의 피드백을 다시 불러올 수 있어요.
            </p>
          )}
          <GrammarExamResultView
            session={session}
            initialFeedback={feedback?.ok ? feedback.data : []}
            autoRequest={query.feedback === "1"}
          />
        </>
      )}
      <nav
        aria-label="연습 완료 후 이동"
        className="flex flex-wrap gap-4 border-t border-practice-line pt-6"
      >
        <Link
          href={`/grammar/${session.noteId}/practice?${context}`}
          className="min-h-11 rounded-md bg-practice-ink px-5 py-3 text-sm text-white"
        >
          다시 연습하기
        </Link>
        <Link
          href={`/grammar/${session.noteId}?${context}`}
          className="min-h-11 rounded-md border border-practice-input-line px-5 py-3 text-sm text-practice-body"
        >
          노트로 돌아가기
        </Link>
      </nav>
    </div>
  );
}
