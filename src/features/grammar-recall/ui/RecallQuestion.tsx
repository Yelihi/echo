"use client";
import { useState } from "react";
import type { RecallDraft, RecallQuestionProps } from "../models/interface";
import { persistRecallDraft, readRecallDraft, createRecallSegments } from "../services/recallDraft";
import { RecallBlankFields } from "./RecallBlankFields";
export function RecallQuestion({ session, busy, error, onMove, audio }: RecallQuestionProps) {
  const question = session.questions[session.questionIndex];
  const [draft, setDraft] = useState(() => readRecallDraft(session));
  const [revealed, setRevealed] = useState(false);
  const [hint, setHint] = useState(false);
  const segments = createRecallSegments(question);
  const partial = session.phase === "partial";
  function update(next: RecallDraft) {
    setDraft(next);
    persistRecallDraft(session, next);
  }
  function changeBlank(id: string, value: string) {
    update({ ...draft, values: { ...draft.values, [id]: value } });
  }
  const filled = partial
    ? segments.filter((s) => s.hidden).every((s) => draft.values[s.id]?.trim())
    : !!draft.whole.trim();
  return (
    <section className="space-y-7 rounded-2xl border border-practice-line bg-white p-6 sm:p-9">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-widest text-practice-secondary">
          {partial ? "01 · 의미 덩어리 채우기" : "02 · 문장 전체 떠올리기"}
        </span>
        <span className="text-sm text-practice-secondary">
          {session.questionIndex + 1} / {session.questions.length}
        </span>
      </div>
      <h2 className="text-xl text-practice-ink">{question.translation}</h2>
      <p className="text-sm text-practice-secondary">핵심 어법: {session.learningNote}</p>
      {partial ? (
        <RecallBlankFields
          segments={segments}
          values={draft.values}
          onChange={changeBlank}
          disabled={busy}
        />
      ) : (
        <label className="block space-y-2">
          <span className="text-sm text-practice-secondary">영어 문장을 작성해주세요</span>
          <textarea
            autoComplete="off"
            spellCheck={false}
            maxLength={3000}
            disabled={busy}
            value={draft.whole}
            onChange={(e) => update({ ...draft, whole: e.target.value })}
            className="min-h-32 w-full rounded-lg border border-practice-line p-4 text-lg focus-visible:outline-practice-focus"
          />
        </label>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setHint(!hint)}
          className="min-h-11 rounded-full border border-practice-line px-4 text-sm"
        >
          {hint ? "힌트 닫기" : "힌트 보기"}
        </button>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="min-h-11 rounded-full border border-practice-line px-4 text-sm"
        >
          정답 보기
        </button>
      </div>
      {hint && (
        <p className="text-sm text-practice-secondary">
          {segments
            .filter((s) => s.hidden)
            .map((s) => s.meaning)
            .join(" / ") || question.translation}
        </p>
      )}
      {revealed && (
        <div className="space-y-4 rounded-xl bg-practice-canvas p-5 motion-safe:animate-in motion-safe:fade-in">
          <p className="text-lg text-practice-ink">{question.sentence}</p>
          {audio}
          <fieldset className="flex flex-wrap gap-3">
            <legend className="mb-3 text-sm text-practice-secondary">스스로 확인해주세요</legend>
            {(["remembered", "again"] as const).map((value) => (
              <label
                key={value}
                className="flex min-h-11 items-center gap-2 rounded-full border border-practice-line px-4 text-sm"
              >
                <input
                  type="radio"
                  name="recall-assessment"
                  checked={draft.assessment === value}
                  onChange={() => update({ ...draft, assessment: value })}
                />
                {value === "remembered" ? "기억했어요" : "다시 볼게요"}
              </label>
            ))}
          </fieldset>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-practice-accent">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-between gap-3 border-t border-practice-line pt-5">
        <button
          type="button"
          disabled={busy}
          onClick={() => onMove(draft, "exit")}
          className="min-h-11 px-3 text-sm text-practice-secondary"
        >
          저장하고 노트로
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy || (partial && session.questionIndex === 0)}
            onClick={() => onMove(draft, "back")}
            className="min-h-11 rounded-md border border-practice-line px-4 text-sm disabled:opacity-40"
          >
            이전
          </button>
          <button
            type="button"
            disabled={busy || !filled || !revealed || !draft.assessment}
            onClick={() => onMove(draft, "next")}
            className="min-h-11 rounded-md bg-practice-ink px-5 text-sm text-white disabled:opacity-40"
          >
            {busy
              ? "저장 중…"
              : !partial && session.questionIndex === session.questions.length - 1
                ? "연습 완료"
                : "다음"}
          </button>
        </div>
      </div>
    </section>
  );
}
