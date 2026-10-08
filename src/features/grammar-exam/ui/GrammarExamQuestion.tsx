"use client";

import { useState, useId, useEffect } from "react";
import type { GrammarSessionQuestion } from "@/entities/grammar-session";

interface Props {
  question: GrammarSessionQuestion;
  initialAnswer: string;
  busy: boolean;
  last: boolean;
  onSave: (answer: string, advance: boolean) => Promise<void>;
}

export function GrammarExamQuestion({ question, initialAnswer, busy, last, onSave }: Props) {
  const [answer, setAnswer] = useState(initialAnswer);
  const inputId = useId();
  const dirty = answer !== initialAnswer;

  useEffect(() => {
    if (!dirty) return;

    const protectDraft = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", protectDraft);

    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [dirty]);

  return (
    <form
      className="space-y-7"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave(answer, true);
      }}
    >
      <div className="space-y-3">
        <p className="text-xs font-medium tracking-widest text-practice-muted">
          {question.kind === "novel" ? "새 문맥 작문" : "기존 예문 작문"}
        </p>
        {question.context && <p className="text-lg leading-relaxed">{question.context}</p>}
        <p className="text-2xl leading-relaxed">{question.translation}</p>
      </div>
      {question.requiredWords.length > 0 && (
        <dl className="flex flex-wrap gap-3" aria-label="필수 단어">
          {question.requiredWords.map((item) => (
            <div key={item.word} className="rounded-lg border border-practice-input-line px-4 py-2">
              <dt className="font-medium">{item.word}</dt>
              <dd className="text-sm text-practice-muted">{item.meaning}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="space-y-2">
        <label htmlFor={inputId} className="text-sm">
          영어로 작성해 주세요
        </label>
        <textarea
          id={inputId}
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          maxLength={4000}
          disabled={busy}
          rows={4}
          className="w-full rounded-xl border border-practice-input-line bg-white text-practice-ink p-4 text-lg leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-practice-focus disabled:opacity-60"
        />
        <p className="text-xs text-practice-muted">
          시험 중에는 정답과 발음을 표시하지 않습니다. 문맥에 맞는 다른 표현도 사용할 수 있습니다.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onSave(answer, false)}
          className="rounded-lg border border-practice-input-line px-5 py-3 text-sm disabled:opacity-50"
        >
          임시 저장
        </button>
        <button
          type="submit"
          disabled={busy || !answer.trim()}
          className="rounded-lg bg-practice-ink px-5 py-3 text-sm text-white disabled:opacity-50"
        >
          {busy ? "저장 중…" : last ? "시험 완료" : "다음 문항"}
        </button>
      </div>
    </form>
  );
}
