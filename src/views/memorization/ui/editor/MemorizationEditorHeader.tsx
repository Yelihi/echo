"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// shared
import { Button, Spinner } from "@/shared/components";
import { ConfirmDialog } from "@/shared/components/ui";

// views
import type { MemorizationEditorMode } from "@/views/memorization/models/editor";
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";

interface MemorizationEditorHeaderProps {
  mode: MemorizationEditorMode;
  isSaving: boolean;
  isBusy: boolean;
  onSave: () => void;
}

export function MemorizationEditorHeader({
  mode,
  isSaving,
  isBusy,
  onSave,
}: MemorizationEditorHeaderProps) {
  const router = useRouter();
  const edited = useMemorizationEditorStore((state) => state.edited);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const cancel = () => {
    if (edited) {
      setConfirmCancelOpen(true);
      return;
    }

    router.push("/sentence-memorization");
  };

  return (
    <>
      <header className="flex shrink-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-heading-md font-bold text-black-primary">
            {mode === "create" ? "문장 암기 자료 만들기" : "문장 암기 자료 수정"}
          </h1>
          <p className="text-body-4 text-gray-text">
            긴 영어 본문을 입력하고 암기 기준 문단을 확정하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="lg" onClick={cancel} disabled={isBusy}>
            취소
          </Button>
          <Button type="button" size="lg" onClick={onSave} disabled={isBusy} aria-busy={isSaving}>
            {isSaving ? (
              <>
                <Spinner size="sm" className="text-current" label="저장 중" />
                저장 중
              </>
            ) : (
              "저장"
            )}
          </Button>
        </div>
      </header>

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="편집을 취소할까요?"
        description="지금까지 입력한 내용은 저장되지 않습니다."
        confirmLabel="나가기"
        cancelLabel="계속 편집"
        onConfirm={() => router.push("/sentence-memorization")}
      />
    </>
  );
}
