import type { GrammarSessionMode } from "@/entities/grammar-session";
import { BackNavigation } from "@/shared/components/ui/back-navigation/BackNavigation";
import { GrammarPracticeClient } from "./GrammarPracticeClient";

export function GrammarPracticeView({
  noteId,
  title,
  backHref,
  returnTo,
  activeSessions,
}: {
  noteId: string;
  title: string;
  backHref: string;
  returnTo: string;
  activeSessions: Partial<Record<GrammarSessionMode, string>>;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-5 py-8 sm:px-8">
      <BackNavigation href={backHref} />
      <header className="space-y-4">
        <p className="text-xs tracking-widest text-practice-muted">PRACTICE</p>
        <h1 className="text-3xl font-medium tracking-tight text-practice-ink">
          어떻게 연습할까요?
        </h1>
        <p className="text-sm text-practice-secondary">{title}</p>
      </header>
      <GrammarPracticeClient
        key={noteId}
        noteId={noteId}
        returnTo={returnTo}
        activeSessions={activeSessions}
      />
    </div>
  );
}
