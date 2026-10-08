import type { GrammarNote } from "@/entities/grammar-note";
import { GrammarEditorClient } from "./GrammarEditorClient";

export function GrammarEditorView({
  initialNote,
  backHref = "/grammar",
}: {
  initialNote?: GrammarNote;
  backHref?: string;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 py-8">
      <header className="space-y-3">
        <p className="text-xs tracking-widest text-gray-text">GRAMMAR NOTE</p>
        <h1 className="text-3xl font-medium tracking-tight text-black-primary">
          {initialNote ? "어법 노트 수정" : "배운 어법을 문장으로 남겨요"}
        </h1>
        <p className="text-sm leading-relaxed text-gray-text">
          문장과 핵심 어법을 적으면 AI가 분석합니다. 풀이를 확인하고 나만의 노트로 저장하세요.
        </p>
      </header>
      <div className="rounded-2xl border border-card-line bg-white p-5 sm:p-8">
        <GrammarEditorClient initialNote={initialNote} backHref={backHref} />
      </div>
    </main>
  );
}
