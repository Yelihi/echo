"use client";

import type { FormEvent } from "react";
import type { ChunkEditorProps } from "../models/interface";
import { Button } from "@/shared/components/atomics/button/Button";
import { useChunkEdit } from "../services/hooks/useChunkEdit";
import { ChunkExplanationFields } from "./ChunkExplanationFields";
import { ChunkBoundaryEditor } from "./ChunkBoundaryEditor";
import { ChunkSplitEditor } from "./ChunkSplitEditor";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

export function ChunkEditor({ chunk }: ChunkEditorProps) {
  const { formRef, applyEdit, error } = useChunkEdit(chunk.id);
  const source = useAnalysisEditor((state) => state.analysis.sourceText);
  const nextEnd = useAnalysisEditor(
    (state) =>
      state.analysis.chunks[state.analysis.chunks.findIndex((item) => item.id === chunk.id) + 1]
        ?.range.end,
  );
  function submitExplanation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyEdit();
  }
  function mergeNext() {
    applyEdit((service) => service.mergeNext(chunk.id));
  }
  return (
    <form ref={formRef} className="space-y-5" onSubmit={submitExplanation}>
      <h3 className="text-lg text-practice-ink" lang="en">
        {source.slice(chunk.range.start, chunk.range.end)}
      </h3>
      <ChunkExplanationFields chunk={chunk} />
      <Button type="submit">풀이 적용</Button>
      <div className="grid gap-6 border-t border-practice-input-line pt-5 sm:grid-cols-2">
        <ChunkBoundaryEditor chunk={chunk} source={source} nextEnd={nextEnd} onApply={applyEdit} />
        <ChunkSplitEditor chunk={chunk} source={source} onApply={applyEdit} />
      </div>
      <Button type="button" variant="ghost" disabled={nextEnd === undefined} onClick={mergeNext}>
        다음 구간과 합치기
      </Button>
      {error && (
        <p role="alert" className="text-sm text-danger-ink">
          {error}
        </p>
      )}
    </form>
  );
}
