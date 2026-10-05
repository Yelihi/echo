"use client";

import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useAnalysisEditor } from "./AnalysisEditorProvider";

export function AnalysisExitConfirmation() {
  const pending = useAnalysisEditor((state) => state.pendingSelection);
  const resolve = useAnalysisEditor((state) => state.resolveSelection);
  return (
    <ConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) resolve(false);
      }}
      title="적용하지 않은 수정을 버릴까요?"
      description="계속 편집하면 현재 입력을 유지합니다."
      confirmLabel="수정 버리기"
      cancelLabel="계속 편집"
      onConfirm={() => resolve(true)}
      onCancel={() => resolve(false)}
    />
  );
}
