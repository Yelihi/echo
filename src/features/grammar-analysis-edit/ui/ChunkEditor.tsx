"use client";

import type { ChunkEditorProps } from "../models/interface";

import { useId, useState } from "react";
import { Input } from "@/shared/components/atomics/input/Input";
import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { Button } from "@/shared/components/atomics/button/Button";
import type { AnalysisEdit } from "../models/editAnalysis";
import { getTextBoundaries } from "../services/textBoundaries";
import { BoundarySelect } from "./BoundarySelect";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

export function ChunkEditor({ chunk }: ChunkEditorProps) {
  const id = useId();
  const [meaning, setMeaning] = useState(chunk.literalMeaning);
  const [explanation, setExplanation] = useState(chunk.explanation);
  const [boundary, setBoundary] = useState(chunk.range.end);

  const [error, setError] = useState("");
  const edit = useAnalysisEditor((state) => state.edit);
  const source = useAnalysisEditor((state) => state.analysis.sourceText);
  const next = useAnalysisEditor(
    (state) =>
      state.analysis.chunks[state.analysis.chunks.findIndex((item) => item.id === chunk.id) + 1],
  );
  const [split, setSplit] = useState(
    () =>
      getTextBoundaries(source).find(
        (item) => item.position > chunk.range.start && item.position < chunk.range.end,
      )?.position ?? chunk.range.start,
  );
  const run = (command?: AnalysisEdit) => {
    const result = edit([
      (service) => service.editChunk(chunk.id, { literalMeaning: meaning, explanation }),
      ...(command ? [command] : []),
    ]);
    setError(result.ok ? "" : result.message);
  };
  return (
    <div className="space-y-5">
      <h3 className="text-lg text-practice-ink" lang="en">
        {source.slice(chunk.range.start, chunk.range.end)}
      </h3>
      <label className="block space-y-2" htmlFor={`${id}-meaning`}>
        직독직해
        <Input id={`${id}-meaning`} value={meaning} onChange={(e) => setMeaning(e.target.value)} />
      </label>
      <label className="block space-y-2" htmlFor={`${id}-explanation`}>
        구간 설명
        <Textarea
          id={`${id}-explanation`}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </label>
      <Button type="button" onClick={() => run()}>
        풀이 적용
      </Button>
      <div className="grid gap-6 border-t border-practice-input-line pt-5 sm:grid-cols-2">
        <div className="space-y-3">
          <BoundarySelect
            label="다음 구간과의 경계"
            source={source}
            value={boundary}
            min={chunk.range.start + 1}
            max={(next?.range.end ?? chunk.range.end) - 1}
            onChange={setBoundary}
            disabled={!next}
          />
          <p className="text-sm text-practice-muted" lang="en">
            {source.slice(chunk.range.start, boundary)}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={!next}
            onClick={() => run((service) => service.moveBoundary(chunk.id, boundary))}
          >
            경계 적용
          </Button>
        </div>
        <div className="space-y-3">
          <BoundarySelect
            label="구간 나누기 위치"
            source={source}
            value={split}
            min={chunk.range.start + 1}
            max={chunk.range.end - 1}
            onChange={setSplit}
          />
          <p className="text-sm text-practice-muted" lang="en">
            {source.slice(chunk.range.start, split)} | {source.slice(split, chunk.range.end)}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={split <= chunk.range.start || split >= chunk.range.end}
            onClick={() =>
              run((service) => service.splitChunk(chunk.id, split, crypto.randomUUID()))
            }
          >
            나누기
          </Button>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        disabled={!next}
        onClick={() => run((service) => service.mergeNext(chunk.id))}
      >
        다음 구간과 합치기
      </Button>
      {error && (
        <p role="alert" className="text-sm text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}
