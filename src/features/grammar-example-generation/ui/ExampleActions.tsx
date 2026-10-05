"use client";
import { Button } from "@/shared/components/atomics/button/Button";
import { useExamples } from "./ExampleProvider";
export function ExampleActions() {
  const pending = useExamples((s) => s.pending);
  const error = useExamples((s) => s.error);
  const selected = useExamples((s) => s.selected.length);
  const count = useExamples((s) => s.candidates.length);
  const generate = useExamples((s) => s.generate);
  const save = useExamples((s) => s.save);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => void generate()} disabled={!!pending}>
          {pending === "all"
            ? "예문 생성 중…"
            : error || count
              ? "예문 다시 생성"
              : "예문 3개 생성"}
        </Button>
        {count > 0 && (
          <Button onClick={() => void save()} disabled={!!pending || !selected}>
            {pending === "save" ? "저장 중…" : `선택한 예문 ${selected}개 저장`}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {pending && (
        <p role="status" className="text-sm text-gray-text">
          {pending === "save"
            ? "선택한 예문을 저장하고 있습니다."
            : "같은 어법을 사용하는 새로운 예문을 만들고 있습니다."}
        </p>
      )}
    </div>
  );
}
