"use client";

import { BoundarySelect } from "./BoundarySelect";
import { Button } from "@/shared/components/atomics/button/Button";
import type { RangeFieldsProps } from "../models/interface";

export function RangeFields({ ranges, source, onChange }: RangeFieldsProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 text-sm text-practice-muted">문장 구간</legend>
      {ranges.map((range, index) => (
        <div key={index} className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <BoundarySelect
            label={`시작 ${index + 1}`}
            source={source}
            value={range.start}
            onChange={(start) =>
              onChange(ranges.map((item, i) => (i === index ? { ...item, start } : item)))
            }
          />
          <BoundarySelect
            label={`끝 ${index + 1}`}
            source={source}
            value={range.end}
            onChange={(end) =>
              onChange(ranges.map((item, i) => (i === index ? { ...item, end } : item)))
            }
          />
          <Button
            type="button"
            variant="ghost"
            disabled={ranges.length === 1}
            onClick={() => onChange(ranges.filter((_, i) => i !== index))}
          >
            구간 {index + 1} 삭제
          </Button>
          <p className="col-span-2 text-sm text-practice-muted" lang="en">
            선택: {source.slice(range.start, range.end)}
          </p>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        disabled={ranges[ranges.length - 1].end >= source.length}
        variant="outline"
        onClick={() =>
          onChange([...ranges, { start: ranges[ranges.length - 1].end, end: source.length }])
        }
      >
        구간 추가
      </Button>
    </fieldset>
  );
}
