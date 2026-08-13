import type { EvaluationDiffSegment } from "@/shared/lib/evaluation";
import type { DiffSegmentsProps } from "@/views/analysis-result/models";

export function DiffSegments({ segments }: DiffSegmentsProps) {
  return (
    <p className="w-full rounded-control bg-card-surface px-3.75 py-3.25 text-body-3 text-black-secondary">
      {segments.map((segment, index) => (
        <span key={`${segment.op}-${index}`} className={diffClassName(segment.op)}>
          {segment.actual ?? segment.expected}
          {index < segments.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

function diffClassName(op: EvaluationDiffSegment["op"]): string {
  if (op === "equal") {
    return "";
  }

  if (op === "insert") {
    return "text-green-primary";
  }

  if (op === "delete") {
    return "text-red-primary line-through";
  }

  return "text-yellow-primary";
}
