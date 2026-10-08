"use client";

import { useRef, useState } from "react";
import type { GrammarExamPlayerProps, GrammarExamErrorCode } from "../../models/interface";

/** 입력 문장은 문항 컴포넌트가 소유하고, 이 훅은 저장·이동·완료만 조율합니다. */
export function useGrammarExam({
  initialSession,
  onSaveAnswers,
  onComplete,
  onCompleted,
}: GrammarExamPlayerProps) {
  const [session, setSession] = useState(initialSession);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<GrammarExamErrorCode | "SAVED" | null>(null);
  const pending = useRef(false);
  const question = session.questions[session.questionIndex];

  async function save(answer: string, advance: boolean) {
    if (pending.current) return;

    pending.current = true;
    setBusy(true);
    setMessage(null);

    try {
      const isLast = session.questionIndex === session.questions.length - 1;
      const index = advance && !isLast ? session.questionIndex + 1 : session.questionIndex;
      const result = await onSaveAnswers({
        id: session.id,
        expectedVersion: session.version,
        answers: { ...session.answers, [`${question.kind}:${question.id}`]: answer },
        phase: session.questions[index].kind,
        questionIndex: index,
      });

      if (!result.ok) {
        setMessage(result.code);

        return;
      }

      setSession(result.data);

      if (!advance) {
        setMessage("SAVED");

        return;
      }

      if (!isLast) return;

      const completed = await onComplete({
        id: result.data.id,
        expectedVersion: result.data.version,
      });

      if (!completed.ok) {
        setMessage(completed.code);

        return;
      }

      setSession(completed.data);
      onCompleted(completed.data);
    } catch {
      setMessage("FAILED");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return { session, question, busy, message, save };
}
