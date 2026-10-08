"use client";
import { useRouter } from "next/navigation";
import type { GrammarSession } from "@/entities/grammar-session";
import { GrammarRecall } from "@/features/grammar-recall";
import { GrammarExamPlayer } from "@/features/grammar-exam";
import { GrammarAudioButton } from "@/features/grammar-audio";
import { requestGrammarAudio } from "@/features/grammar-audio/services/actions/requestGrammarAudio";
import {
  saveGrammarSessionAnswers,
  completeGrammarSession,
} from "@/features/grammar-practice/services/actions/grammarSessionActions";

export function GrammarSessionView({
  session,
  returnTo = "/grammar",
}: {
  session: GrammarSession;
  returnTo?: string;
}) {
  const router = useRouter();
  const context = `returnTo=${encodeURIComponent(returnTo)}`;
  const exit = () => router.push(`/grammar/${session.noteId}?${context}`);
  const completed = (result: GrammarSession) => {
    router.push(
      `/grammar-sessions/${result.id}/result?${context}${result.mode === "exam" ? "&feedback=1" : ""}`,
    );
    router.refresh();
  };
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-8 sm:px-8">
      {session.mode === "recall" ? (
        <GrammarRecall
          key={session.id}
          initialSession={session}
          save={saveGrammarSessionAnswers}
          complete={completeGrammarSession}
          onComplete={completed}
          onExit={exit}
          renderAudio={(question) => (
            <GrammarAudioButton
              input={{
                sessionId: session.id,
                questionId: question.id,
              }}
              generate={requestGrammarAudio}
            />
          )}
        />
      ) : (
        <GrammarExamPlayer
          key={session.id}
          initialSession={session}
          onSaveAnswers={saveGrammarSessionAnswers}
          onComplete={completeGrammarSession}
          onCompleted={completed}
          onExit={exit}
        />
      )}
    </div>
  );
}
