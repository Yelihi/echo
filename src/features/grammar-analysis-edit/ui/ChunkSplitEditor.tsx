"use client";

import { useState } from "react";
import type { ChunkSplitEditorProps } from "../models/interface";
import { Button } from "@/shared/components/atomics/button/Button";
import { getTextBoundaries } from "../services/textBoundaries";
import { BoundarySelect } from "./BoundarySelect";

export function ChunkSplitEditor({ chunk, source, onApply }: ChunkSplitEditorProps) {
  const [split, setSplit] = useState(
    () =>
      getTextBoundaries(source).find(
        (item) => item.position > chunk.range.start && item.position < chunk.range.end,
      )?.position ?? chunk.range.start,
  );
  function splitChunk() {
    onApply((service) => service.splitChunk(chunk.id, split, crypto.randomUUID()));
  }
  return (
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
        onClick={splitChunk}
      >
        나누기
      </Button>
    </div>
  );
}
