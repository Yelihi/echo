"use client";

import { grammarSessionErrorMessage } from "@/entities/grammar-session";
import type { RecallSessionProps } from "../models/interface";
import { useRecallSession } from "../services/useRecallSession";
import { RecallQuestion } from "./RecallQuestion";

export function RecallSession(props: RecallSessionProps) {
  return <RecallSessionContent key={props.initialSession.id} {...props} />;
}

function RecallSessionContent(props: RecallSessionProps) {
  const { session, busy, error, move } = useRecallSession(props);
  const question = session.questions[session.questionIndex];

  return (
    <RecallQuestion
      key={`${session.phase}:${question.id}`}
      session={session}
      busy={busy}
      error={error ? grammarSessionErrorMessage(error) : ""}
      onMove={move}
      audio={props.renderAudio?.(question)}
    />
  );
}
