"use client";

import { ArrowLeft, Pencil } from "lucide-react";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

export function AnalysisToolbar() {
  const editing = useAnalysisEditor((state) => state.editing);
  const startEditing = useAnalysisEditor((state) => state.startEditing);
  const finishEditing = useAnalysisEditor((state) => state.finishEditing);
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-2">
        <p className="text-[11px] font-medium tracking-[0.16em] text-practice-muted">
          {editing ? "EDIT ANALYSIS" : "SENTENCE STUDY"}
        </p>
        <h2 className="text-xl font-medium tracking-tight text-practice-ink">
          {editing ? "분석 수정" : "문장 읽기"}
        </h2>
        {editing && (
          <p className="text-sm text-practice-muted">분석이 다른 부분만 수정해 주세요.</p>
        )}
      </div>
      <button
        type="button"
        data-analysis-action={editing ? "back" : "edit"}
        onClick={editing ? finishEditing : startEditing}
        className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-xs text-practice-muted transition-colors hover:bg-practice-chip hover:text-practice-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-practice-secondary motion-reduce:transition-none"
      >
        {editing ? (
          <ArrowLeft size={14} aria-hidden="true" />
        ) : (
          <Pencil size={13} aria-hidden="true" />
        )}
        {editing ? "읽기로 돌아가기" : "분석 수정"}
      </button>
    </header>
  );
}
