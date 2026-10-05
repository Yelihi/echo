"use client";
import { useId } from "react";
import { Textarea } from "@/shared/components/atomics/textarea/Textarea";
import { Button } from "@/shared/components/atomics/button/Button";
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
  const change = useExamples((s) => s.change);
  const select = useExamples((s) => s.select);
  const generate = useExamples((s) => s.generate);
  if (!candidate) return null;
  return (
    <article className="space-y-5 rounded-2xl border border-card-line bg-white p-5 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <h3 className="font-medium text-black-primary">예문 {number}</h3>
        <Button variant="ghost" disabled={!!pending} onClick={() => void generate(id)}>
          {pending === id ? "생성 중…" : "이 예문 다시 생성"}
        </Button>
      </header>
      <fieldset disabled={pending === "save"} className="space-y-4">
        {fields.map(({ field, label }) => (
          <div key={field} className="space-y-2">
            <label htmlFor={`${formId}-${field}`} className="text-sm text-gray-text">
              {label}
            </label>
            <Textarea
              id={`${formId}-${field}`}
              value={candidate[field]}
              onChange={(e) => change(id, field, e.target.value)}
              required
              maxLength={4000}
              className="min-h-20 border-card-line bg-white leading-relaxed"
            />
          </div>
        ))}
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => select(id, e.target.checked)}
            className="mt-1 accent-black"
          />
          이 예문의 어법을 확인했고 노트에 저장합니다.
        </label>
      </fieldset>
    </article>
  );
}
