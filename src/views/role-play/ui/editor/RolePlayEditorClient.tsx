"use client";

import { useLayoutEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

// shared
import { errorPopupManager } from "@/shared/lib/error-popup";
import { cn } from "@/shared/lib/tailwind/utils";

// features
import { useTransferTextFile } from "@/features/roleplay-txt-import/services/hooks/useTransferTextFile";

// views
import { convertRoleplayTxtImportToEditorLines } from "@/views/role-play/models/converter/convertRoleplayTxtImportToEditorLines";
import { createRolePlayMaterialErrorFromCode } from "@/views/role-play/models/errors";
import type { RoleplayEditorDraft, RoleplayEditorMode } from "@/views/role-play/models/interface";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";
import { createRolePlayMaterial } from "@/views/role-play/services/action/createRolePlayMaterial";
import { RolePlayEditorHeader } from "@/views/role-play/ui/editor/RolePlayEditorHeader";
import { RolePlayEditorMetaPanel } from "@/views/role-play/ui/editor/RolePlayEditorMetaPanel";
import { RolePlayScriptEditor } from "@/views/role-play/ui/editor/RolePlayScriptEditor";

interface RolePlayEditorClientProps {
  mode: RoleplayEditorMode;
  initialDraft?: RoleplayEditorDraft;
}

export function RolePlayEditorClient({ mode, initialDraft }: RolePlayEditorClientProps) {
  const router = useRouter();
  const [isSaving, startSaveTransition] = useTransition();
  const txtImport = useTransferTextFile((imported) => {
    useRolePlayEditorStore
      .getState()
      .applyImportedScript(convertRoleplayTxtImportToEditorLines(imported));
  });
  const isBusy = isSaving || txtImport.isPending;

  useLayoutEffect(() => {
    if (initialDraft) {
      useRolePlayEditorStore.getState().hydrate(initialDraft);
    } else {
      useRolePlayEditorStore.getState().reset();
    }

    return () => useRolePlayEditorStore.getState().reset();
  }, [initialDraft]);

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
      errorPopupManager.open({
        title: "아직 수정 저장을 지원하지 않습니다",
        message: "지금은 새 자료 만들기만 저장할 수 있습니다. 수정 저장은 곧 연결됩니다.",
      });
      return;
    }

    startSaveTransition(async () => {
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
    <section className="flex w-full flex-col gap-7" data-pillar="roleplay" aria-busy={isBusy}>
      <RolePlayEditorHeader mode={mode} isSaving={isSaving} isBusy={isBusy} onSave={save} />
      <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className={cn(isBusy && "opacity-60")} inert={isBusy}>
          <RolePlayEditorMetaPanel txtImport={txtImport} />
        </div>
        <div className={cn(isSaving && "opacity-60")} inert={isSaving}>
          <RolePlayScriptEditor isPending={txtImport.isPending} />
        </div>
      </div>
    </section>
  );
}
