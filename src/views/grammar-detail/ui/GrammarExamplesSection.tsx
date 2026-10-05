"use client";
import type { GrammarNote } from "@/entities/grammar-note";
import { GrammarAudioButton } from "@/features/grammar-audio";
import { requestGrammarAudio } from "@/features/grammar-audio/services/actions/requestGrammarAudio";

export function GrammarExamplesSection({
  note,
  onManage,
}: {
  note: GrammarNote;
  onManage: () => void;
}) {
  return (
    <section aria-label="저장한 예문" className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-medium text-practice-ink">
          같은 어법, 다른 문장{" "}
          <span className="text-sm text-practice-muted">{note.examples.length}</span>
        </h2>
        <button
          type="button"
          onClick={onManage}
          className="min-h-11 rounded-md border border-practice-input-line px-4 text-sm text-practice-body hover:bg-practice-chip"
        >
          예문 생성·검토
        </button>
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
              <p className="text-sm leading-7 text-practice-secondary">{example.translation}</p>
              <p className="text-sm leading-7 text-practice-muted">{example.targetExplanation}</p>
              <GrammarAudioButton
                input={{ noteId: note.id, noteVersion: note.version, sentenceId: example.id }}
                generate={requestGrammarAudio}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
