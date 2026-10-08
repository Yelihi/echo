"use client";
import type { GrammarRecallProps } from "../models/interface";
import { useRecallSession } from "../services/useRecallSession";
import { RecallQuestion } from "./RecallQuestion";
export function GrammarRecall(props: GrammarRecallProps) {
  const { session, busy, error, move } = useRecallSession(props);
  const question = session.questions[session.questionIndex];
  return (
    <div className="mx-auto max-w-3xl space-y-7 px-5 py-8">
      <header>
        <p className="mb-3 text-xs tracking-widest text-practice-secondary">RECALL PRACTICE</p>
        <h1 className="text-2xl font-medium text-practice-ink">{session.title}</h1>
      </header>
      <RecallQuestion
        key={`${session.phase}:${question.id}`}
        session={session}
        busy={busy}
        error={error}
        onMove={move}
        audio={props.renderAudio?.(question)}
      />
    </div>
  );
}
