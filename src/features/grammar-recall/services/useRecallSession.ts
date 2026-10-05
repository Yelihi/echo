"use client";
import { useState } from "react";
import type { GrammarRecallProps, RecallDraft } from "../models/interface";
import { answersWithRecallDraft } from "./recallDraft";
export function useRecallSession(props: GrammarRecallProps) {
  const [session, setSession] = useState(props.initialSession);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function move(draft: RecallDraft, direction: "next" | "back" | "exit") {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const last = session.questionIndex === session.questions.length - 1;
      const finishing = direction === "next" && last && session.phase === "whole";
      let phase = session.phase;
      let index = session.questionIndex;
      if (direction === "next" && !finishing) {
        if (last) {
          phase = "whole";
          index = 0;
        } else index++;
      }
      if (direction === "back") {
        if (index > 0) index--;
        else if (phase === "whole") {
          phase = "partial";
          index = session.questions.length - 1;
        } else {
          setBusy(false);
          return;
        }
      }
      const saved = await props.save({
        id: session.id,
        expectedVersion: session.version,
        answers: answersWithRecallDraft(session, draft),
        phase,
        questionIndex: index,
      });
      if (!saved.ok) {
        setError(saved.message);
        return;
      }
      setSession(saved.data);
      if (direction === "exit") {
        props.onExit();
        return;
      }
      if (finishing) {
        const completed = await props.complete({
          id: saved.data.id,
          expectedVersion: saved.data.version,
        });
        if (!completed.ok) {
          setError(completed.message);
          return;
        }
        props.onComplete(completed.data);
      }
    } catch {
      setError("진행 상태를 저장하지 못했습니다. 입력은 유지됩니다. 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }
  return { session, busy, error, move };
}
