"use client";

import { cva } from "class-variance-authority";
import { useShallow } from "zustand/react/shallow";
import type { AnalysisItemProps } from "../models/interface";
import { convertAnalysisToChunkReading } from "../models/converters/convertAnalysisToChunkReading";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

const chunkVariants = cva(
  "relative max-w-full cursor-pointer rounded-xl border px-3 py-2.5 text-left text-[23px] leading-relaxed tracking-[-0.02em] break-words outline-none transition-[background-color,box-shadow,transform,border-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-practice-secondary focus-visible:ring-offset-4 motion-reduce:transform-none motion-reduce:transition-none sm:px-4 sm:py-3 sm:text-[28px]",
  {
    variants: {
      selected: {
        true: "-translate-y-0.5 border-practice-input-line bg-white text-practice-ink shadow-strong",
        false:
          "border-transparent bg-practice-chip/70 text-practice-body hover:-translate-y-0.5 hover:bg-white hover:shadow-emphasize",
      },
    },
  },
);

function ChunkButton({ id }: AnalysisItemProps) {
  const chunk = useAnalysisEditor((state) => state.analysis.chunks.find((item) => item.id === id));
  const source = useAnalysisEditor((state) => state.analysis.sourceText);
  const hint = useAnalysisEditor((state) => {
    const reading = convertAnalysisToChunkReading(state.analysis, id);
    return reading ? [reading.meaning, ...reading.roles].filter(Boolean).join(" · ") : "";
  });
  const selected = useAnalysisEditor((state) => state.selectedId === id);
  const select = useAnalysisEditor((state) => state.select);
  if (!chunk) return null;
  return (
    <button
      type="button"
      data-chunk-id={id}
      className={chunkVariants({ selected })}
      aria-pressed={selected}
      title={hint}
      aria-description={hint}
      onClick={() => select(id)}
    >
      {source.slice(chunk.range.start, chunk.range.end).trim()}
    </button>
  );
}

export function AnalysisSentence() {
  const ids = useAnalysisEditor(
    useShallow((state) => state.analysis.chunks.map((chunk) => chunk.id)),
  );
  const translation = useAnalysisEditor((state) => state.analysis.naturalTranslation);
  return (
    <section aria-label="분석 문장" className="space-y-6">
      <div className="flex flex-wrap items-start gap-2.5" lang="en">
        {ids.map((id) => (
          <ChunkButton key={id} id={id} />
        ))}
      </div>
      <p className="px-1 text-[15px] leading-relaxed text-practice-secondary sm:text-base">
        {translation}
      </p>
    </section>
  );
}
