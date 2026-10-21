"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { GrammarExample, GrammarNote } from "@/entities/grammar-note";
import { GrammarAudioButton } from "@/features/grammar-audio";
import type { GrammarAudioButtonProps } from "@/features/grammar-audio";

function ExampleTranslation({ example }: { example: GrammarExample }) {
  const [direct, setDirect] = useState(false);

  if (!example.directReading) {
    return <p className="text-sm leading-7 text-practice-secondary">{example.translation}</p>;
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-pressed={direct}
        onClick={() => setDirect((value) => !value)}
        className="min-h-11 rounded-md border border-practice-line px-3 text-sm text-practice-body hover:bg-practice-chip"
      >
        {direct ? "자연스러운 해석" : "직독직해"}
      </button>
      {direct ? (
        <div className="space-y-2 rounded-xl bg-practice-canvas p-4">
          {example.directReading.map((block) => (
            <div key={`${block.start}-${block.end}`} className="text-sm leading-7">
              <p lang="en" className="text-practice-ink">
                {example.sentence.slice(block.start, block.end)}
              </p>
              <p lang="ko" className="text-practice-secondary">
                {block.korean}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p lang="ko" className="text-sm leading-7 text-practice-secondary">
          {example.translation}
        </p>
      )}
    </div>
  );
}

export function GrammarExamplesSection({
  note,
  manageButton,
  generateAudio,
}: {
  note: GrammarNote;
  manageButton: ReactNode;
  generateAudio: GrammarAudioButtonProps["generate"];
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
        <ul className="divide-y divide-practice-line">
          {note.examples.map((example) => (
            <li key={example.id} className="space-y-3 py-5">
              <p lang="en" className="break-words text-xl leading-8 text-practice-ink">
                {example.sentence}
              </p>
              <ExampleTranslation example={example} />
              <p className="text-sm leading-7 text-practice-muted">{example.targetExplanation}</p>
              <GrammarAudioButton
                input={{ noteId: note.id, noteVersion: note.version, sentenceId: example.id }}
                generate={generateAudio}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
