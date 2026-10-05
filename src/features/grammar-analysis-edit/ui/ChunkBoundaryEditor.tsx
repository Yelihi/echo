"use client";

import { useState } from "react";
import type { ChunkBoundaryEditorProps } from "../models/interface";
import { Button } from "@/shared/components/atomics/button/Button";
import { BoundarySelect } from "./BoundarySelect";

export function ChunkBoundaryEditor({ chunk, source, nextEnd, onApply }: ChunkBoundaryEditorProps) {
  const [boundary, setBoundary] = useState(chunk.range.end);
  function applyBoundary() {
    onApply((service) => service.moveBoundary(chunk.id, boundary));
  }
  return (
    <div className="space-y-3">
      <BoundarySelect
        label="다음 구간과의 경계"
        source={source}
        value={boundary}
        min={chunk.range.start + 1}
        max={(nextEnd ?? chunk.range.end) - 1}
        onChange={setBoundary}
        disabled={nextEnd === undefined}
      />
      <p className="text-sm text-practice-muted" lang="en">
        {source.slice(chunk.range.start, boundary)}
      </p>
      <Button
        type="button"
        variant="outline"
        disabled={nextEnd === undefined}
        onClick={applyBoundary}
      >
        경계 적용
      </Button>
    </div>
  );
}
