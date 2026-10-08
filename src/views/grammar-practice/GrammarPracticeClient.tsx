"use client";
import { useRouter } from "next/navigation";
import type { GrammarSessionMode } from "@/entities/grammar-session";
import { GrammarPracticeLauncher } from "@/features/grammar-practice";
import { startGrammarSession } from "@/features/grammar-practice/services/actions/grammarSessionActions";
import { startGrammarExam } from "@/features/grammar-exam/services/actions/examActions";
export function GrammarPracticeClient({
  noteId,
  returnTo,
  activeSessions,
}: {
  noteId: string;
  returnTo: string;
  activeSessions: Partial<Record<GrammarSessionMode, string>>;
}) {
  const router = useRouter();
  return (
    <GrammarPracticeLauncher
      noteId={noteId}
      activeSessions={activeSessions}
      onStart={(input) =>
        input.mode === "recall"
          ? startGrammarSession(input)
          : startGrammarExam({ noteId: input.noteId, requestId: input.requestId })
      }
      onOpen={(id) =>
        router.push(`/grammar-sessions/${id}?returnTo=${encodeURIComponent(returnTo)}`)
      }
    />
  );
}
