"use client";
import { editorStyles as styles } from "@/shared/components/editor/styles";

import { useState } from "react";
import { useRouter } from "next/navigation";

// shared
import { Button, Spinner } from "@/shared/components";
import { ConfirmDialog } from "@/shared/components/ui";

// views
import type { RolePlayEditorHeaderProps } from "@/views/role-play/models/interface";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";

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
      <header className={styles.header}>
        <div className="flex min-w-0 flex-col gap-3">
          <h1>{mode === "create" ? "롤플레잉 자료 만들기" : "롤플레잉 자료 수정"}</h1>
          <p>연습할 상황과 주고받을 대사를 차례로 입력하세요.</p>
        </div>
        <div className={styles.actions}>
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
