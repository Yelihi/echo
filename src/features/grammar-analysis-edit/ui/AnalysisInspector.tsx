"use client";

import { useAnalysisEditor } from "./AnalysisEditorProvider";
import { AnalysisEditNavigation } from "./AnalysisEditNavigation";
import { ChunkEditor } from "./ChunkEditor";
import { SyntaxEditor } from "./SyntaxEditor";
import { ConstructionEditor } from "./ConstructionEditor";

export function AnalysisInspector() {
  const id = useAnalysisEditor((state) => state.selectedId);
  const analysis = useAnalysisEditor((state) => state.analysis);
  const markDirty = useAnalysisEditor((state) => state.markDirty);
  const chunk = analysis.chunks.find((item) => item.id === id);
  const syntax = analysis.syntax.find((item) => item.id === id);
  const construction = analysis.constructions.find((item) => item.id === id);
  return (
    <section
      aria-label="분석 수정 도구"
      className="mt-8 space-y-7 border-t border-practice-line pt-7 motion-safe:animate-practice-arrive"
    >
      <AnalysisEditNavigation />
      <div onChangeCapture={markDirty}>
        {chunk && (
          <ChunkEditor key={`${chunk.id}:${chunk.range.start}:${chunk.range.end}`} chunk={chunk} />
        )}
        {syntax && <SyntaxEditor key={syntax.id} annotation={syntax} />}
        {construction && <ConstructionEditor key={construction.id} annotation={construction} />}
      </div>
    </section>
  );
}
