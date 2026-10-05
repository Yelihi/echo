"use client";
import { useEffect, useRef, useState } from "react";
import type { GrammarExamResultProps, GrammarExamFeedbackResult } from "../../models/interface";
/** 새 완료 화면에서만 순차 요청합니다. 실패 항목은 사용자가 재시도하며 자동 반복하지 않습니다. */
export function useInitialExamFeedback({
  session,
  initialFeedback = [],
  onRequestFeedback,
  autoRequest = false,
}: GrammarExamResultProps) {
  const [results, setResults] = useState<Record<string, GrammarExamFeedbackResult>>({});
  const [pending, setPending] = useState(autoRequest);
  const started = useRef(new Set<string>());
  const mounted = useRef(false);
  const currentSession = useRef(session.id);
  useEffect(() => {
    mounted.current = true;
    currentSession.current = session.id;
    return () => {
      mounted.current = false;
    };
  }, [session.id]);
  useEffect(() => {
    if (!autoRequest || session.status !== "completed" || started.current.has(session.id)) return;
    started.current.add(session.id);
    const isCurrent = () => mounted.current && currentSession.current === session.id;
    async function requestInitialFeedback() {
      setPending(true);
      for (const question of session.questions) {
        if (!isCurrent()) return;
        if (initialFeedback.some((item) => item.questionId === question.id)) continue;
        let result: GrammarExamFeedbackResult;
        try {
          result = await onRequestFeedback({ sessionId: session.id, questionId: question.id });
        } catch {
          result = { ok: false, message: "피드백을 불러오지 못했습니다. 다시 시도해 주세요." };
        }
        if (!isCurrent()) return;
        setResults((previous) => ({ ...previous, [`${session.id}:${question.id}`]: result }));
      }
      if (isCurrent()) setPending(false);
    }
    void requestInitialFeedback();
  }, [autoRequest, session, initialFeedback, onRequestFeedback]);
  return { results, pending };
}
