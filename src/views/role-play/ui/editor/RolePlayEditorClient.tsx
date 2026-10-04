"use client";
import styles from "@/shared/components/editor/Editor.module.css";

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
import type { RolePlayEditorClientProps } from "@/views/role-play/models/interface";
import { useRolePlayEditorStore } from "@/views/role-play/models/stores/rolePlayEditorStore";
import { saveRolePlayMaterial } from "@/views/role-play/services/action/saveRolePlayMaterial";
import { RolePlayEditorHeader } from "@/views/role-play/ui/editor/RolePlayEditorHeader";
import { RolePlayEditorMetaPanel } from "@/views/role-play/ui/editor/RolePlayEditorMetaPanel";
import { RolePlayScriptEditor } from "@/views/role-play/ui/editor/RolePlayScriptEditor";

export function RolePlayEditorClient({
  mode,
  initialDraft,
  materialId,
}: RolePlayEditorClientProps) {
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

    if (mode === "edit" && !materialId) {
      errorPopupManager.open({
        title: "수정할 자료를 찾지 못했습니다",
        message: "자료 목록에서 다시 열어주세요.",
      });
      return;
    }

    startSaveTransition(async () => {
      try {
        const result = await saveRolePlayMaterial(draft, mode === "edit" ? materialId : undefined);

        if (result.code === "SUCCESS") {
          router.push("/role-playing");
          router.refresh();
          return;
        }

        const error = createRolePlayMaterialErrorFromCode(result.code);
        errorPopupManager.open({
          title: error.title,
          message: error.message,
          code: error.code,
        });
      } catch {
        errorPopupManager.open({
          title: "저장에 실패했습니다",
          message: "입력 내용은 유지됩니다. 잠시 후 다시 시도해주세요.",
        });
      }
    });
  };

  return (
    <section className={styles.editor} data-pillar="roleplay" aria-busy={isBusy}>
      <RolePlayEditorHeader mode={mode} isSaving={isSaving} isBusy={isBusy} onSave={save} />
      <div className={styles.panels}>
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
