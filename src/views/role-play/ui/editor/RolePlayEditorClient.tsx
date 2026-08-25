"use client";

import { useLayoutEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// shared
import { Button } from "@/shared/components";
import { ConfirmDialog } from "@/shared/components/ui";
import { errorPopupManager } from "@/shared/lib/error-popup";

// views
import { createRolePlayMaterialErrorFromCode } from "@/views/role-play/models/errors";
import type { RoleplayEditorDraft, RoleplayEditorMode } from "@/views/role-play/models/interface";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";
import { createRolePlayMaterial } from "@/views/role-play/services/action/createRolePlayMaterial";
import { RolePlayEditorMetaPanel } from "@/views/role-play/ui/editor/RolePlayEditorMetaPanel";
import { RolePlayScriptEditor } from "@/views/role-play/ui/editor/RolePlayScriptEditor";

interface RolePlayEditorClientProps {
  mode: RoleplayEditorMode;
  initialDraft?: RoleplayEditorDraft;
}

export function RolePlayEditorClient({ mode, initialDraft }: RolePlayEditorClientProps) {
  useLayoutEffect(() => {
    if (initialDraft) {
      useRolePlayEditorStore.getState().hydrate(initialDraft);
    } else {
      useRolePlayEditorStore.getState().reset();
    }

    return () => useRolePlayEditorStore.getState().reset();
  }, [initialDraft]);

  return (
    <section className="flex w-full flex-col gap-7" data-pillar="roleplay">
      <RolePlayEditorHeader mode={mode} />
      <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <RolePlayEditorMetaPanel />
        <RolePlayScriptEditor />
      </div>
    </section>
  );
}

function RolePlayEditorHeader({ mode }: { mode: RoleplayEditorMode }) {
  const router = useRouter();
  const edited = useRolePlayEditorStore((state) => state.edited);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const cancel = () => {
    if (edited) {
      setConfirmCancelOpen(true);
      return;
    }

    router.push("/role-playing");
  };

  const save = () => {
    const draft = useRolePlayEditorStore.getState().draft;
    const hasValidLine = draft.lines.some((line) => line.text.trim().length > 0);

    if (!draft.title.trim()) {
      errorPopupManager.open({
        title: "제목을 입력해주세요",
        message: "롤플레잉 자료를 저장하려면 제목이 필요합니다.",
      });
      return;
    }

    if (!draft.situation.trim()) {
      errorPopupManager.open({
        title: "상황을 입력해주세요",
        message: "롤플레잉 자료를 저장하려면 상황 설명이 필요합니다.",
      });
      return;
    }

    if (!hasValidLine) {
      errorPopupManager.open({
        title: "대사를 입력해주세요",
        message: "상대방 또는 내 대사가 최소 1개 이상 필요합니다.",
      });
      return;
    }

    if (mode !== "create") {
      return;
    }

    startTransition(async () => {
      const result = await createRolePlayMaterial(draft);

      if (result.code === "SUCCESS") {
        router.push("/role-playing");
        return;
      }

      const error = createRolePlayMaterialErrorFromCode(result.code);
      errorPopupManager.open({
        title: error.title,
        message: error.message,
        code: error.code,
      });
    });
  };

  return (
    <>
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-heading-md font-bold text-black-primary">
            {mode === "create" ? "롤플레잉 자료 만들기" : "롤플레잉 자료 수정"}
          </h1>
          <p className="text-body-4 text-gray-text">상대방과 내 대사를 채팅 흐름으로 정리하세요.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="lg" onClick={cancel} disabled={isPending}>
            취소
          </Button>
          <Button type="button" size="lg" onClick={save} disabled={isPending}>
            저장
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
