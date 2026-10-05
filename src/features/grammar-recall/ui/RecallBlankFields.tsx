import { GRAMMAR_ANSWER_MAX_LENGTH } from "@/entities/grammar-session";
import type { RecallSegment } from "../models/interface";
export function RecallBlankFields({
  segments,
  values,
  onChange,
  disabled,
}: {
  segments: readonly RecallSegment[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xl leading-loose">
      {segments.map((segment) =>
        segment.hidden ? (
          <label key={segment.id} className="inline-flex flex-col gap-1">
            <span className="sr-only">{segment.meaning || "빈칸"}</span>
            <input
              autoComplete="off"
              spellCheck={false}
              maxLength={GRAMMAR_ANSWER_MAX_LENGTH}
              disabled={disabled}
              value={values[segment.id] ?? ""}
              onChange={(event) => onChange(segment.id, event.target.value)}
              className="min-h-12 w-full min-w-32 max-w-sm rounded-lg border border-practice-line bg-practice-canvas px-3 text-base focus-visible:outline-practice-focus"
            />
          </label>
        ) : (
          <span key={segment.id}>{segment.text}</span>
        ),
      )}
    </div>
  );
}
