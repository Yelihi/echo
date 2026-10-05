"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

const itemVariants = cva(
  "rounded-md px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-practice-secondary motion-reduce:transition-none",
  {
    variants: {
      selected: {
        true: "bg-practice-ink text-white",
        false: "bg-practice-chip text-practice-secondary hover:bg-practice-neutral-surface",
      },
    },
  },
);

export function AnalysisEditNavigation() {
  const analysis = useAnalysisEditor((state) => state.analysis);
  const id = useAnalysisEditor((state) => state.selectedId);
  const select = useAnalysisEditor((state) => state.select);
  const addSyntax = useAnalysisEditor((state) => state.addSyntax);
  const dirty = useAnalysisEditor((state) => state.dirty);
  const [error, setError] = useState("");
  return (
    <div className="space-y-3">
      <p className="text-xs text-practice-muted">문장 성분 · 구문</p>
      <div className="flex flex-wrap gap-2">
        {[
          ...analysis.syntax.map((item) => ({ id: item.id, name: item.label })),
          ...analysis.constructions.map((item) => ({ id: item.id, name: item.name })),
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={id === item.id}
            className={itemVariants({ selected: id === item.id })}
            onClick={() => select(item.id)}
          >
            {item.name}
          </button>
        ))}
        <button
          type="button"
          disabled={dirty}
          onClick={() => {
            const result = addSyntax();
            setError(result.ok ? "" : result.message);
          }}
          className="rounded-md px-3 py-2 text-xs text-practice-muted hover:bg-practice-chip focus-visible:outline-2 focus-visible:outline-practice-secondary disabled:opacity-40"
        >
          + 문법 항목 추가
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}
