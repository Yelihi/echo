"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// shared
import { Button, Spinner } from "@/shared/components";
import { ConfirmDialog } from "@/shared/components/ui";

// views
import type { RoleplayEditorMode } from "@/views/role-play/models/interface";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";

interface RolePlayEditorHeaderProps {
  mode: RoleplayEditorMode;
  isSaving: boolean;
  isBusy: boolean;
  onSave: () => void;
}

export function RolePlayEditorHeader({
  mode,
  isSaving,
  isBusy,
  onSave,
}: RolePlayEditorHeaderProps) {
  const router = useRouter();
  const edited = useRolePlayEditorStore((state) => state.edited);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const cancel = () => {
    if (edited) {
      setConfirmCancelOpen(true);
      return;
    }

    router.push("/role-playing");
  };

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="text-heading-lg font-bold tracking-tight break-keep text-black-primary">
            {mode === "create" ? "롤플레잉 자료 만들기" : "롤플레잉 자료 수정"}
          </h1>
          <p className="text-body-4 text-gray-text">상대방과 내 대사를 채팅 흐름으로 정리하세요.</p>
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
        onConfirm={() => router.push("/role-playing")}
      />
    </>
  );
}
