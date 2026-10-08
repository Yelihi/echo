import type { GrammarSessionHistory } from "@/entities/grammar-session";
import type { GrammarNote } from "@/entities/grammar-note";
import { GrammarAnalysisReader } from "@/features/grammar-analysis-edit";
import { GrammarAudioButton } from "@/features/grammar-audio";
import { requestGrammarAudio } from "@/features/grammar-audio/services/actions/requestGrammarAudio";
import { GrammarDetail } from "./GrammarDetail";
import { GrammarExamplesSection } from "./GrammarExamplesSection";
import { GrammarDetailManager, GrammarManageExamplesButton } from "./GrammarDetailManager";
import { GrammarDetailHistory } from "./GrammarDetailHistory";

export function GrammarDetailView({
  note,
  backHref,
  initialHistory,
}: {
  note: GrammarNote;
  backHref: string;
  initialHistory?: GrammarSessionHistory;
}) {
  return (
    <GrammarDetailManager key={note.id} note={note}>
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
        examples={
          <GrammarExamplesSection note={note} manageButton={<GrammarManageExamplesButton />} />
        }
        history={
          <GrammarDetailHistory
            noteId={note.id}
            backHref={backHref}
            initialHistory={initialHistory}
          />
        }
      />
    </GrammarDetailManager>
  );
}
