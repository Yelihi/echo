"use client";
import { useState } from "react";
import { Button } from "@/shared/components/atomics/button/Button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type { GrammarNoteEditorProps } from "../models/interface";
import { EditorProvider, useEditor } from "./EditorProvider";
import { EditorError } from "./EditorError";
import { SourceStep } from "./SourceStep";
import { ReviewStep } from "./ReviewStep";
function EditorBody({
  AnalysisEditor,
  onExit,
}: Pick<GrammarNoteEditorProps, "AnalysisEditor" | "onExit">) {
  const stage = useEditor((s) => s.stage);
  return (
    <div className="space-y-8">
      <EditorExit onExit={onExit} />
      {stage === "input" ? <SourceStep /> : <ReviewStep AnalysisEditor={AnalysisEditor} />}
      <EditorError />
    </div>
  );
}
function EditorExit({ onExit }: { onExit: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const dirty = useEditor((s) => s.dirty);
  const saving = useEditor((s) => s.pending === "save");
  return (
    <>
      <Button
        variant="ghost"
        disabled={saving}
        onClick={() => (dirty ? setConfirm(true) : onExit())}
      >
        ← 뒤로가기
      </Button>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="작성 중인 내용을 나갈까요?"
        description="저장하지 않은 변경은 사라집니다."
        confirmLabel="나가기"
        cancelLabel="계속 작성"
        onConfirm={onExit}
      />
    </>
  );
}
export function GrammarNoteEditor({ AnalysisEditor, onExit, ...props }: GrammarNoteEditorProps) {
  return (
    <EditorProvider {...props}>
      <EditorBody AnalysisEditor={AnalysisEditor} onExit={onExit} />
    </EditorProvider>
  );
}
