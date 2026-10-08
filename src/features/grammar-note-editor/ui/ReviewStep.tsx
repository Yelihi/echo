"use client";
import { useState } from "react";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Button } from "@/shared/components/atomics/button/Button";
import type { GrammarNoteEditorProps } from "../models/interface";
import { useEditor } from "./EditorProvider";
export function ReviewStep({ AnalysisEditor }: Pick<GrammarNoteEditorProps, "AnalysisEditor">) {
  const result = useEditor((s) => s.result);
  const change = useEditor((s) => s.changeAnalysis);
  const analysisDirty = useEditor((s) => s.analysisDirty);
  const setAnalysisDirty = useEditor((s) => s.setAnalysisDirty);
  const [confirmBack, setConfirmBack] = useState(false);
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
        <div>
          <AnalysisEditor
            key={result.data.analysis.sourceRevision}
            initialAnalysis={result.data.analysis}
            onChange={change}
            onDirtyChange={setAnalysisDirty}
          />
        </div>
        <label className="flex items-start gap-3 text-sm text-black-primary">
          <input
            type="checkbox"
            checked={reviewed}
            disabled={analysisDirty}
            onChange={(e) => review(e.target.checked)}
            className="mt-1 accent-black"
          />
          문장 풀이와 어법을 확인했습니다.
        </label>
      </fieldset>
      {analysisDirty && (
        <p role="status" className="text-sm text-gray-text">
          저장하기 전에 풀이 수정을 적용하거나 취소해 주세요.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => (analysisDirty ? setConfirmBack(true) : back())}
          disabled={saving}
        >
          이전 · 입력 수정
        </Button>
        <Button onClick={() => void save()} disabled={!reviewed || saving || analysisDirty}>
          {saving ? "저장 중…" : "검토 완료 · 노트 저장"}
        </Button>
      </div>
      <ConfirmDialog
        open={confirmBack}
        onOpenChange={setConfirmBack}
        title="적용하지 않은 풀이 수정을 버릴까요?"
        description="적용한 분석과 원문은 유지됩니다."
        confirmLabel="입력으로 돌아가기"
        cancelLabel="계속 수정"
        onConfirm={back}
      />
    </section>
  );
}
