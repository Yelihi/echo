"use client";

import type { GrammarExamResultProps } from "../models/interface";
import { useInitialExamFeedback } from "../services/hooks/useInitialExamFeedback";
import { GrammarExamFeedbackItem } from "./GrammarExamFeedbackItem";

export function GrammarExamResult({
  session,
  initialFeedback = [],
  onRequestFeedback,
  autoRequest = false,
}: GrammarExamResultProps) {
  const { results, pending } = useInitialExamFeedback({
    session,
    initialFeedback,
    onRequestFeedback,
    autoRequest,
  });

  if (session.mode !== "exam" || session.status !== "completed")
    return <p role="status">시험을 완료한 뒤 피드백을 확인할 수 있습니다.</p>;

  return (
    <section aria-label="어법 시험 결과" className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-medium">시험을 마쳤어요</h1>
        <p className="text-muted-foreground">{session.title} · 답안별 피드백을 확인해 보세요.</p>
      </header>
      {session.questions.map((question) => (
        <GrammarExamFeedbackItem
          key={`${session.id}:${question.id}`}
          question={question}
          answer={session.answers[`${question.kind}:${question.id}`] ?? ""}
          initialFeedback={initialFeedback.find((item) => item.questionId === question.id)}
          autoResult={results[`${session.id}:${question.id}`]}
          autoPending={pending}
          onRequest={() => onRequestFeedback({ sessionId: session.id, questionId: question.id })}
        />
      ))}
    </section>
  );
}
