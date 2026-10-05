"use client";

import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Button } from "@/shared/components/atomics/button/Button";
import { useAnalysisEditor } from "./AnalysisEditorProvider";
import { ChunkEditor } from "./ChunkEditor";
import { SyntaxEditor } from "./SyntaxEditor";
import { ConstructionEditor } from "./ConstructionEditor";

export function AnalysisInspector() {
  const editing = useAnalysisEditor((state) => state.editing);
  const startEditing = useAnalysisEditor((state) => state.startEditing);
  const markDirty = useAnalysisEditor((state) => state.markDirty);
  const pending = useAnalysisEditor((state) => state.pendingSelection);
  const resolveSelection = useAnalysisEditor((state) => state.resolveSelection);
  const selectedId = useAnalysisEditor((state) => state.selectedId);
  const select = useAnalysisEditor((state) => state.select);
  const analysis = useAnalysisEditor((state) => state.analysis);
  const edit = useAnalysisEditor((state) => state.edit);
  const chunk = analysis.chunks.find((item) => item.id === selectedId);
  const syntax = analysis.syntax.find((item) => item.id === selectedId);
  const construction = analysis.constructions.find((item) => item.id === selectedId);
  const addSyntax = () => {
    const id = crypto.randomUUID();
    const result = edit({
      type: "save-syntax",
      annotation: {
        id,
        ranges: [{ start: 0, end: analysis.sourceText.length }],
        parentId: null,
        role: "other",
        label: "새 문법 항목",
        explanation: "",
      },
    });
    if (result.ok) select(id);
  };
  return (
    <section aria-label="선택 구간 풀이" className="space-y-6 pt-8 text-practice-body">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-3 text-lg font-medium">문법과 구문</h2>
        {analysis.syntax.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={item.id === selectedId}
            onClick={() => select(item.id)}
          >
            {item.label}
          </Button>
        ))}
        {analysis.constructions.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant="outline"
            size="sm"
            aria-pressed={item.id === selectedId}
            onClick={() => select(item.id)}
          >
            {item.name}
          </Button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={addSyntax} disabled={editing}>
          문법 항목 추가
        </Button>
      </div>
      {!editing && selectedId && (
        <div className="space-y-4 py-3">
          <h3 className="text-xl text-practice-ink">
            {chunk
              ? analysis.sourceText.slice(chunk.range.start, chunk.range.end)
              : (syntax?.label ?? construction?.name)}
          </h3>
          <p className="text-lg">{chunk?.literalMeaning ?? construction?.meaning}</p>
          <p className="text-base leading-relaxed text-practice-muted">
            {chunk?.explanation ?? syntax?.explanation ?? construction?.explanation}
          </p>
          {syntax && (
            <p className="text-sm text-practice-muted">
              상위 항목:{" "}
              {analysis.syntax.find((item) => item.id === syntax.parentId)?.label ?? "최상위"}
            </p>
          )}
          <Button type="button" variant="outline" onClick={startEditing}>
            풀이·구간 편집
          </Button>
        </div>
      )}
      {editing && (
        <div className="space-y-5" onChangeCapture={markDirty}>
          <Button type="button" variant="ghost" onClick={() => select(selectedId)}>
            ← 풀이로 돌아가기
          </Button>
          {chunk && (
            <ChunkEditor
              key={`${chunk.id}:${chunk.range.start}:${chunk.range.end}`}
              chunk={chunk}
            />
          )}
          {syntax && <SyntaxEditor key={syntax.id} annotation={syntax} />}
          {construction && <ConstructionEditor key={construction.id} annotation={construction} />}
        </div>
      )}
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) resolveSelection(false);
        }}
        title="적용하지 않은 수정을 버릴까요?"
        description="계속 편집하면 현재 입력을 유지합니다."
        confirmLabel="수정 버리기"
        cancelLabel="계속 편집"
        onConfirm={() => resolveSelection(true)}
        onCancel={() => resolveSelection(false)}
      />
      {!selectedId && (
        <p className="py-8 text-practice-muted">문장 구간 또는 문법 항목을 선택해 주세요.</p>
      )}
    </section>
  );
}
