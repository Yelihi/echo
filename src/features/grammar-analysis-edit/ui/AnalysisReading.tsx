"use client";

import { getChunkReading } from "../models/chunkReading";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

export function AnalysisReading() {
  const id = useAnalysisEditor((state) => state.selectedId);
  const analysis = useAnalysisEditor((state) => state.analysis);
  const reading = id ? getChunkReading(analysis, id) : null;
  return (
    <section
      aria-label="선택 구간 풀이"
      aria-live="polite"
      aria-atomic="true"
      className="mt-8 min-h-44 border-t border-practice-line pt-7"
    >
      {reading ? (
        <div key={id} className="space-y-4 motion-safe:animate-practice-arrive">
          <p className="text-sm text-practice-muted" lang="en">
            {reading.text}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-medium tracking-tight text-practice-ink sm:text-2xl">
              {reading.meaning || "아직 풀이가 없습니다."}
            </h3>
            {reading.roles.map((role) => (
              <span
                key={role}
                className="rounded-md bg-practice-chip px-2.5 py-1 text-xs text-practice-secondary"
              >
                {role}
              </span>
            ))}
          </div>
          {reading.explanation && (
            <p className="max-w-2xl text-sm leading-7 text-practice-muted">{reading.explanation}</p>
          )}
          {reading.constructions.map((item) => (
            <p key={item.id} className="text-sm leading-6 text-practice-secondary">
              <span lang="en" className="mr-2 font-medium text-practice-ink">
                {item.name}
              </span>
              {item.meaning}
            </p>
          ))}
        </div>
      ) : (
        <div className="flex min-h-28 items-center justify-center rounded-xl bg-practice-canvas px-6 text-center">
          <p className="text-sm leading-6 text-practice-muted">
            궁금한 표현을 눌러보세요.
            <br />
            뜻과 문장 속 역할을 함께 볼 수 있어요.
          </p>
        </div>
      )}
    </section>
  );
}
