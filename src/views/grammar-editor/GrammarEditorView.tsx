"use client";
import { useRouter } from "next/navigation";
import type { GrammarNote } from "@/entities/grammar-note";
import { GrammarAnalysisEditor } from "@/features/grammar-analysis-edit";
import { requestGrammarAnalysis } from "@/features/grammar-analysis/services/actions/requestGrammarAnalysis";
import { GrammarNoteEditor } from "@/features/grammar-note-editor";
import { saveGrammarNote } from "@/features/grammar-note-editor/services/actions/saveGrammarNote";

// 다른 노트나 최신 저장 버전을 열 때 이전 초안이 섞이지 않도록 에디터 key에 ID와 버전을 함께 쓴다.
export function GrammarEditorView({
  initialNote,
  backHref = "/grammar",
}: {
  initialNote?: GrammarNote;
  backHref?: string;
}) {
  const router = useRouter();
  const returnTo =
    backHref === "/grammar" || backHref.startsWith("/grammar?") ? backHref : "/grammar";
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
        <GrammarNoteEditor
          key={initialNote ? `${initialNote.id}:${initialNote.version}` : "new"}
          initialNote={initialNote}
          analyze={requestGrammarAnalysis}
          save={saveGrammarNote}
          AnalysisEditor={GrammarAnalysisEditor}
          onSaved={(note) => {
            router.push(`/grammar/${note.id}?returnTo=${encodeURIComponent(returnTo)}`);
            router.refresh();
          }}
          onExit={() => router.push(returnTo)}
        />
      </div>
    </main>
  );
}
