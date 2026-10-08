"use client";
import { grammarExamErrorMessage } from "./errorMessage";
import { useRef, useState } from "react";
import type { GrammarSessionQuestion } from "@/entities/grammar-session";
import type { GrammarExamFeedback } from "../models/schema";
import type { GrammarExamFeedbackResult } from "../models/interface";
interface Props {
  question: GrammarSessionQuestion;
  answer: string;
  initialFeedback?: GrammarExamFeedback;
  autoResult?: GrammarExamFeedbackResult;
  autoPending?: boolean;
  onRequest: () => Promise<GrammarExamFeedbackResult>;
}
const labels = {
  correct: "잘 작성했어요",
  "partially-correct": "일부 보완이 필요해요",
  "needs-work": "다시 살펴보세요",
};
export function GrammarExamFeedbackItem({
  question,
  answer,
  initialFeedback,
  onRequest,
  autoResult,
  autoPending = false,
}: Props) {
  const [localFeedback, setFeedback] = useState<GrammarExamFeedback>();
  const feedback =
    localFeedback ?? initialFeedback ?? (autoResult?.ok ? autoResult.data : undefined);
  const [busy, setBusy] = useState(false);
  const [localError, setError] = useState("");
  const error =
    localError || (autoResult && !autoResult.ok ? grammarExamErrorMessage(autoResult.code) : "");
  const pending = useRef(false);
  async function request() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await onRequest();
      if (result.ok) setFeedback(result.data);
      else setError(grammarExamErrorMessage(result.code));
    } catch {
      setError("피드백을 불러오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <article className="space-y-4 rounded-xl border border-practice-line bg-white shadow-practice-panel p-5">
      <h2 className="text-lg font-medium">{question.context || question.translation}</h2>
      <div>
        <p className="text-xs text-practice-muted">내 답안</p>
        <p className="mt-1 whitespace-pre-wrap text-lg">{answer}</p>
      </div>
      {feedback ? (
        <div className="space-y-3 border-t border-practice-line pt-4">
          <p className="font-medium">{labels[feedback.verdict]}</p>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium">어법</dt>
              <dd className="text-sm leading-relaxed text-practice-muted">
                {feedback.grammarFeedback}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">의미와 문맥</dt>
              <dd className="text-sm leading-relaxed text-practice-muted">
                {feedback.meaningFeedback}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium">참고 표현</dt>
              <dd className="text-base">{feedback.suggestedSentence}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy || autoPending}
          onClick={() => void request()}
          className="rounded-lg border border-practice-input-line px-4 py-2 text-sm disabled:opacity-50"
        >
          {busy || autoPending ? "피드백 작성 중…" : error ? "피드백 다시 받기" : "피드백 받기"}
        </button>
      )}
      {error && !feedback && !busy && (
        <p role="alert" className="text-sm text-practice-accent">
          {error}
        </p>
      )}
    </article>
  );
}
