"use client";
import { useEffect, useRef, useState } from "react";
import type { GrammarExamResultProps, GrammarExamFeedbackResult } from "../../models/interface";
export function useInitialExamFeedback({
  session,
  initialFeedback = [],
  onRequestFeedback,
  autoRequest = false,
}: GrammarExamResultProps) {
  const [results, setResults] = useState<Record<string, GrammarExamFeedbackResult>>({});
  const [pending, setPending] = useState(autoRequest);
  // effect 재실행으로 같은 세션의 유료 요청이 중복되지 않게 한다. 실패 재시도는 항목별 UI가 맡는다.
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
      // 모든 문장을 병렬 요청하면 화면을 떠나도 비용이 발생하므로, 각 요청 전에 현재 세션인지 확인한다.
      for (const question of session.questions) {
        if (!isCurrent()) return;
        if (initialFeedback.some((item) => item.questionId === question.id)) continue;
        let result: GrammarExamFeedbackResult;
        try {
          result = await onRequestFeedback({ sessionId: session.id, questionId: question.id });
        } catch {
          result = { ok: false, code: "FAILED" };
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
