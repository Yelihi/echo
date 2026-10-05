"use client";
import { Button } from "@/shared/components/atomics/button/Button";
import type { GrammarNoteEditorProps } from "../models/interface";
import { useEditor } from "./EditorProvider";
export function ReviewStep({ AnalysisEditor }: Pick<GrammarNoteEditorProps, "AnalysisEditor">) {
  const result = useEditor((s) => s.result);
  const change = useEditor((s) => s.changeAnalysis);
  const markDirty = useEditor((s) => s.markDirty);
  const reviewed = useEditor((s) => s.reviewed);
  const review = useEditor((s) => s.setReviewed);
  const saving = useEditor((s) => s.pending === "save");
  const save = useEditor((s) => s.save);
  const back = useEditor((s) => s.back);
  if (result?.status !== "analyzed") return null;
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs tracking-widest text-gray-text">AI 분석 · 검토 후 저장</p>
        <h2 className="text-2xl font-medium text-black-primary">{result.data.metadata.title}</h2>
        <p className="text-sm text-gray-text">{result.data.metadata.tags.join(" · ")}</p>
      </div>
      <fieldset disabled={saving} className="min-w-0 space-y-6">
        <div onChangeCapture={markDirty}>
          <AnalysisEditor
            key={result.data.analysis.sourceRevision}
            initialAnalysis={result.data.analysis}
            onChange={change}
          />
        </div>
        <label className="flex items-start gap-3 text-sm text-black-primary">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => review(e.target.checked)}
            className="mt-1 accent-black"
          />
          문장 풀이와 어법을 확인했습니다.
        </label>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={back} disabled={saving}>
          이전 · 입력 수정
        </Button>
        <Button onClick={() => void save()} disabled={!reviewed || saving}>
          {saving ? "저장 중…" : "검토 완료 · 노트 저장"}
        </Button>
      </div>
    </section>
  );
}
