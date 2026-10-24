"use client";

import { useId } from "react";
import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { Button } from "@/shared/components/atomics/button/Button";
import { isBlockedExampleError } from "../models/errors";
import { useExamples } from "./ExampleProvider";

const fields = [
  { field: "sentence", label: "영어 예문" },
  { field: "translation", label: "한국어 뜻" },
  { field: "targetExplanation", label: "목표 어법 설명" },
] as const;

export function ExampleCandidateCard({ id, number }: { id: string; number: number }) {
  const formId = useId();
  const candidate = useExamples((s) => s.candidates.find((candidate) => candidate.id === id));
  const selected = useExamples((s) => s.selected.includes(id));
  const pending = useExamples((s) => s.pending);
  const error = useExamples((s) => s.error);
  const editing = useExamples((s) => !!s.editing[id]);
  const startEdit = useExamples((s) => s.startEdit);
  const cancelEdit = useExamples((s) => s.cancelEdit);
  const finishEdit = useExamples((s) => s.finishEdit);
  const change = useExamples((s) => s.change);
  const select = useExamples((s) => s.select);
  const generate = useExamples((s) => s.generate);
  const regenerateDirectReading = useExamples((s) => s.regenerateDirectReading);

  if (!candidate) return null;

  return (
    <article className="space-y-5 rounded-2xl border border-card-line bg-white p-5 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <h3 className="font-medium text-black-primary">예문 {number}</h3>
        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                disabled={pending === "save"}
                onClick={() => cancelEdit(id)}
              >
                수정 취소
              </Button>
              {candidate.directReading && (
                <Button variant="outline" disabled={!!pending} onClick={() => finishEdit(id)}>
                  수정 완료
                </Button>
              )}
            </>
          ) : (
            <Button variant="outline" disabled={!!pending} onClick={() => startEdit(id)}>
              이 예문 수정
            </Button>
          )}
          <Button
            variant="ghost"
            disabled={!!pending || editing || isBlockedExampleError(error)}
            loading={pending === id}
            onClick={() => void generate(id)}
          >
            {pending === id ? "생성 중…" : "이 예문 다시 생성"}
          </Button>
        </div>
      </header>
      <fieldset disabled={!!pending} className="space-y-4">
        {fields.map(({ field, label }) => (
          <div key={field} className="space-y-2">
            <label htmlFor={`${formId}-${field}`} className="text-sm text-gray-text">
              {label}
            </label>
            <Textarea
              id={`${formId}-${field}`}
              value={candidate[field]}
              readOnly={!editing}
              onChange={(e) => change(id, field, e.target.value)}
              required
              maxLength={4000}
              aria-invalid={field === "sentence" && !candidate.directReading}
              aria-describedby={
                field === "sentence" && !candidate.directReading
                  ? `${formId}-blocks-help`
                  : undefined
              }
              className={
                field === "sentence" && !candidate.directReading
                  ? "min-h-20 border-destructive bg-white leading-relaxed ring-1 ring-destructive"
                  : "min-h-20 border-card-line bg-white leading-relaxed"
              }
            />
          </div>
        ))}
        {!candidate.directReading && editing && (
          <div className="space-y-2">
            <p id={`${formId}-blocks-help`} className="text-sm text-destructive">
              수정한 문장의 직독직해를 다시 생성해야 저장할 수 있습니다.
            </p>
            <Button
              variant="outline"
              disabled={!!pending || isBlockedExampleError(error)}
              loading={pending === `blocks:${id}`}
              onClick={() => void regenerateDirectReading(id)}
            >
              {pending === `blocks:${id}` ? "직독직해 생성 중…" : "직독직해 다시 생성"}
            </Button>
          </div>
        )}
        {candidate.directReading && (
          <div className="space-y-2 text-sm text-gray-text">
            {candidate.directReading.map((block) => (
              <p key={`${block.start}-${block.end}`}>
                <span lang="en">{candidate.sentence.slice(block.start, block.end)}</span>
                <span aria-hidden="true"> → </span>
                <span lang="ko">{block.korean}</span>
              </p>
            ))}
          </div>
        )}
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={selected}
            disabled={editing || !candidate.directReading}
            onChange={(e) => select(id, e.target.checked)}
            className="mt-1 accent-black"
          />
          이 예문의 어법을 확인했고 노트에 저장합니다.
        </label>
      </fieldset>
    </article>
  );
}
