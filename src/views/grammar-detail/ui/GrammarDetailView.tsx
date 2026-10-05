"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GrammarSessionHistory } from "@/entities/grammar-session";
import type { GrammarNote } from "@/entities/grammar-note";
import { GrammarAnalysisReader } from "@/features/grammar-analysis-edit";
import { GrammarAudioButton } from "@/features/grammar-audio";
import { requestGrammarAudio } from "@/features/grammar-audio/services/actions/requestGrammarAudio";
import { GrammarExampleManager } from "@/features/grammar-example-generation";
import {
  requestGrammarExamples,
  saveGrammarExamples,
} from "@/features/grammar-example-generation/services/actions/exampleActions";
import { GrammarHistory } from "@/features/grammar-history";
import { getGrammarHistory } from "@/features/grammar-history/services/actions/getGrammarHistory";
import { GrammarDetail } from "./GrammarDetail";
import { GrammarExamplesSection } from "./GrammarExamplesSection";

export function GrammarDetailView({
  note,
  backHref,
  initialHistory,
}: {
  note: GrammarNote;
  backHref: string;
  initialHistory?: GrammarSessionHistory;
}) {
  const [managing, setManaging] = useState(false);
  const router = useRouter();
  if (managing)
    return (
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="rounded-2xl border border-practice-line bg-white p-6 sm:p-8">
          <GrammarExampleManager
            key={note.id}
            note={note}
            generate={requestGrammarExamples}
            save={saveGrammarExamples}
            onUpdated={() => router.refresh()}
            onBack={() => setManaging(false)}
          />
        </div>
      </div>
    );
  return (
    <GrammarDetail
      note={note}
      backHref={backHref}
      analysis={
        <GrammarAnalysisReader key={`${note.id}:${note.version}`} analysis={note.analysis} />
      }
      audio={
        <GrammarAudioButton
          input={{ noteId: note.id, noteVersion: note.version, sentenceId: "source" }}
          generate={requestGrammarAudio}
        />
      }
      examples={<GrammarExamplesSection note={note} onManage={() => setManaging(true)} />}
      history={
        <GrammarHistory
          resultHref={(id) =>
            `/grammar-sessions/${id}/result?returnTo=${encodeURIComponent(backHref)}`
          }
          noteId={note.id}
          initialData={initialHistory}
          load={getGrammarHistory}
        />
      }
    />
  );
}
