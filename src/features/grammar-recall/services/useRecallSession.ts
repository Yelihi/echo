"use client";

import type { GrammarSessionError } from "@/entities/grammar-session";
import { useState } from "react";
import type { RecallSessionProps, RecallDraft } from "../models/interface";
import { mergeRecallDraftIntoAnswers } from "./recallDraft";

export function useRecallSession(props: RecallSessionProps) {
  const [session, setSession] = useState(props.initialSession);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<GrammarSessionError["code"] | null>(null);

  async function move(draft: RecallDraft, direction: "next" | "back" | "exit") {
    if (busy) return;

    setBusy(true);
    setError(null);

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
        answers: mergeRecallDraftIntoAnswers(session, draft),
        phase,
        questionIndex: index,
      });

      if (!saved.ok) {
        setError(saved.code);

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
          setError(completed.code);

          return;
        }

        props.onComplete(completed.data);
      }
    } catch {
      setError("FAILED");
    } finally {
      setBusy(false);
    }
  }

  return { session, busy, error, move };
}
