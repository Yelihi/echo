import { ExampleTranslation } from "./ExampleTranslation";
import {
  ExampleAudioPreparation,
  ExampleAudioPreparationGroup,
} from "@/features/grammar-example-generation";
import type { ReactNode } from "react";
import type { AudioPreparationResult, ExampleAudioCommand } from "@/entities/grammar-audio";
import type { GrammarNote } from "@/entities/grammar-note";
import { GrammarAudioButton } from "@/features/grammar-audio";
import type { GrammarAudioButtonProps } from "@/features/grammar-audio";

import { getExampleAudioPreparation } from "@/features/grammar-audio/services/actions/getExampleAudioPreparation";
import { retryExampleAudioPreparation } from "@/features/grammar-audio/services/actions/retryExampleAudioPreparation";

export function GrammarExamplesSection({
  note,
  manageButton,
  generateAudio,
  readAudioPreparation = getExampleAudioPreparation,
  retryAudioPreparation = retryExampleAudioPreparation,
}: {
  note: GrammarNote;
  manageButton: ReactNode;
  generateAudio: GrammarAudioButtonProps["generate"];
  readAudioPreparation?: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
  retryAudioPreparation?: (command: ExampleAudioCommand) => Promise<AudioPreparationResult>;
}) {
  return (
    <section aria-label="저장한 예문" className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-medium text-practice-ink">
          같은 어법, 다른 문장{" "}
          <span className="text-sm text-practice-muted">{note.examples.length}</span>
        </h2>
        {manageButton}
      </header>
      {note.examples.length === 0 ? (
        <p className="rounded-xl bg-practice-canvas p-6 text-sm leading-7 text-practice-muted">
          저장한 예문이 없어요. AI 예문을 생성하고 검토해 보세요. 입력한 원문으로도 연습할 수
          있어요.
        </p>
      ) : (
        <ExampleAudioPreparationGroup
          key={`${note.id}:${note.version}`}
          noteId={note.id}
          sentenceIds={note.examples.map((example) => example.id)}
          read={readAudioPreparation}
          retry={retryAudioPreparation}
        >
          <ul className="divide-y divide-practice-line">
            {note.examples.map((example) => (
              <li key={example.id} className="space-y-3 py-5">
                <p lang="en" className="break-words text-xl leading-8 text-practice-ink">
                  {example.sentence}
                </p>
                <ExampleTranslation example={example} />
                <p className="text-sm leading-7 text-practice-muted">{example.targetExplanation}</p>
                <ExampleAudioPreparation
                  key={`${note.id}:${example.id}`}
                  noteId={note.id}
                  sentenceId={example.id}
                  read={readAudioPreparation}
                  retry={retryAudioPreparation}
                >
                  <GrammarAudioButton
                    input={{ noteId: note.id, noteVersion: note.version, sentenceId: example.id }}
                    generate={generateAudio}
                  />
                </ExampleAudioPreparation>
              </li>
            ))}
          </ul>
        </ExampleAudioPreparationGroup>
      )}
    </section>
  );
}
