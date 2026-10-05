"use client";

import type { AnalysisItemProps } from "../models/interface";
import { cva } from "class-variance-authority";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

const chunkVariants = cva(
  "whitespace-pre-wrap border-b-2 px-1 py-2 text-left text-2xl leading-relaxed outline-none transition-colors focus-visible:ring-2 focus-visible:ring-practice-focus",
  {
    variants: {
      selected: {
        true: "border-practice-accent bg-practice-accent/5 text-practice-ink",
        false: "border-transparent text-practice-body hover:border-practice-input-line",
      },
    },
  },
);

function ChunkButton({ id }: AnalysisItemProps) {
  const chunk = useAnalysisEditor((state) => state.analysis.chunks.find((item) => item.id === id));
  const source = useAnalysisEditor((state) => state.analysis.sourceText);
  const selected = useAnalysisEditor((state) => state.selectedId === id);
  const select = useAnalysisEditor((state) => state.select);
  if (!chunk) return null;
  return (
    <button
      type="button"
      className={chunkVariants({ selected })}
      aria-pressed={selected}
      title={chunk.literalMeaning}
      aria-description={chunk.literalMeaning}
      onClick={() => select(id)}
      onKeyDown={(event) => {
        if (event.key === "Escape") select(null);
      }}
    >
      {source.slice(chunk.range.start, chunk.range.end)}
    </button>
  );
}

export function AnalysisSentence() {
  const chunks = useAnalysisEditor((state) => state.analysis.chunks);
  const translation = useAnalysisEditor((state) => state.analysis.naturalTranslation);
  return (
    <section aria-label="분석 문장" className="space-y-5 border-b border-practice-input-line pb-8">
      <div className="flex flex-wrap" lang="en">
        {chunks.map((chunk) => (
          <ChunkButton key={chunk.id} id={chunk.id} />
        ))}
      </div>
      <p className="text-base leading-relaxed text-practice-muted">{translation}</p>
      <p className="text-sm text-practice-muted">
        구간을 선택하면 아래에서 풀이와 경계를 편집할 수 있습니다.
      </p>
    </section>
  );
}
