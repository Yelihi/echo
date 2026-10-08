"use client";

import { grammarExamErrorMessage } from "./errorMessage";
import { useState } from "react";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type { GrammarExamPlayerProps } from "../models/interface";
import { useGrammarExam } from "../services/hooks/useGrammarExam";
import { GrammarExamQuestion } from "./GrammarExamQuestion";

export function GrammarExamPlayer(props: GrammarExamPlayerProps) {
  return <ExamSession key={props.initialSession.id} {...props} />;
}

function ExamSession(props: GrammarExamPlayerProps) {
  const [exitOpen, setExitOpen] = useState(false);
  const { session, question, busy, message, save } = useGrammarExam(props);

  if (
    session.mode !== "exam" ||
    session.status !== "active" ||
    !session.questions.some((q) => q.kind === "novel")
  )
    return <p role="status">시험 문제를 준비하거나 완료 결과를 확인해 주세요.</p>;

  return (
    <section
      aria-label="어법 시험"
      className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-practice-line bg-white shadow-practice-panel p-6 md:p-10"
    >
      <button
        type="button"
        disabled={busy}
        onClick={() => setExitOpen(true)}
        className="text-sm text-practice-muted disabled:opacity-50"
      >
        ← 노트로 돌아가기
      </button>
      <header className="space-y-3">
        <p className="text-sm text-practice-muted">
          {session.questionIndex + 1} / {session.questions.length}
        </p>
        <h1 className="text-3xl font-medium">{session.title}</h1>
        <p className="text-sm text-practice-muted">적용할 어법: {session.learningNote}</p>
      </header>
      <GrammarExamQuestion
        key={question.id}
        question={question}
        initialAnswer={session.answers[`${question.kind}:${question.id}`] ?? ""}
        busy={busy}
        last={session.questionIndex === session.questions.length - 1}
        onSave={save}
      />
      {message && (
        <p role="status" aria-live="polite" className="text-sm">
          {message === "SAVED" ? "답안을 임시 저장했습니다." : grammarExamErrorMessage(message)}
        </p>
      )}
      <ConfirmDialog
        open={exitOpen}
        onOpenChange={setExitOpen}
        title="시험을 나갈까요?"
        description="임시 저장한 답안은 이어서 풀 수 있습니다. 저장하지 않은 입력은 사라집니다."
        confirmLabel="나가기"
        cancelLabel="계속 풀기"
        onConfirm={props.onExit}
        onCancel={() => setExitOpen(false)}
      />
    </section>
  );
}
