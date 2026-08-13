import { cva } from "class-variance-authority";

import type { DiffSegmentsProps } from "@/views/analysis-result/models";

const diffSegmentVariants = cva("", {
  variants: {
    op: {
      equal: "",
      insert: "text-green-primary",
      delete: "text-red-primary line-through",
      replace: "text-yellow-primary",
    },
  },
});

export function DiffSegments({ segments }: DiffSegmentsProps) {
  return (
    <p className="w-full rounded-control bg-card-surface px-3.75 py-3.25 text-body-3 text-black-secondary">
      {segments.map((segment, index) => (
        <span key={`${segment.op}-${index}`} className={diffSegmentVariants({ op: segment.op })}>
          {segment.actual ?? segment.expected}
          {index < segments.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
