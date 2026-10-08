"use client";
import { Button } from "@/shared/components/atomics/button/Button";
import { useEditor } from "./EditorProvider";
import { SourceField } from "./SourceField";
export function SourceStep() {
  const pending = useEditor((s) => s.pending);
  const analyze = useEditor((s) => s.analyze);
  const back = useEditor((s) => s.back);
  const result = useEditor((s) => s.result);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void analyze();
      }}
      className="space-y-8"
      noValidate
    >
      <SourceField
        field="sentence"
        label="영어 문장"
        placeholder="She is not a teacher but a doctor."
      />
      <SourceField
        field="learningNote"
        label="핵심 어법 설명"
        placeholder="not A but B: A가 아니라 B"
      />
      {result?.status === "needs-input" && (
        <section role="status" className="space-y-3 rounded-xl border border-card-line p-5">
          <h2 className="font-medium">
            {result.precheck.status === "uncertain"
              ? "설명을 조금 더 알려주세요"
              : "입력을 확인해 주세요"}
          </h2>
          {result.precheck.issues.map((issue, index) => (
            <p key={index} className="text-sm text-gray-text">
              {issue.message}
              {issue.suggestion && <span className="block">제안: {issue.suggestion}</span>}
            </p>
          ))}
        </section>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={!!pending}>
          {pending === "analysis" ? "문장과 어법 분석 중…" : "문장 분석하기"}
        </Button>
        {pending === "analysis" && (
          <Button type="button" variant="outline" onClick={back}>
            분석 취소 · 입력으로
          </Button>
        )}
      </div>
    </form>
  );
}
