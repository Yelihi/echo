"use client";

import { useLayoutEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

// shared
import { errorPopupManager } from "@/shared/lib/error-popup";
import { cn } from "@/shared/lib/tailwind/utils";

// features
import { useSuggestMemorizationParagraphs } from "@/features/memorization-paragraph-suggestion/services/hooks/useSuggestMemorizationParagraphs";

// views
import { convertMemorizationParagraphSuggestionToEditorParagraphs } from "@/views/memorization/models/converter/convertMemorizationParagraphSuggestionToEditorParagraphs";
import type { MemorizationEditorClientProps } from "@/views/memorization/models/editor";
import {
  createMemorizationMaterialErrorFromCode,
  MemorizationMaterialSaveFailedError,
} from "@/views/memorization/models/errors";
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";
import { saveMemorizationMaterial } from "@/views/memorization/services/action/saveMemorizationMaterial";
import { MemorizationEditorHeader } from "@/views/memorization/ui/editor/MemorizationEditorHeader";
import { MemorizationEditorSourcePanel } from "@/views/memorization/ui/editor/MemorizationEditorSourcePanel";
import { MemorizationParagraphReviewPanel } from "@/views/memorization/ui/editor/MemorizationParagraphReviewPanel";

export function MemorizationEditorClient({
  mode,
  initialDraft,
  materialId,
}: MemorizationEditorClientProps) {
  const router = useRouter();
  const [isSaving, startSaveTransition] = useTransition();
  const paragraphSuggestion = useSuggestMemorizationParagraphs((suggestion) => {
    useMemorizationEditorStore
      .getState()
      .setParagraphs(convertMemorizationParagraphSuggestionToEditorParagraphs(suggestion));
  });
  const isBusy = isSaving || paragraphSuggestion.isPending;

  useLayoutEffect(() => {
    if (initialDraft) {
      useMemorizationEditorStore.getState().hydrate(initialDraft);
    } else {
      useMemorizationEditorStore.getState().reset();
    }

    return () => useMemorizationEditorStore.getState().reset();
  }, [initialDraft]);

  const save = () => {
    const draft = useMemorizationEditorStore.getState().draft;
    const hasValidParagraph = draft.paragraphs.some((paragraph) => paragraph.trim().length > 0);

    if (!draft.title.trim()) {
      errorPopupManager.open({
        title: "제목을 입력해주세요",
        message: "문장 암기 자료를 저장하려면 제목이 필요합니다.",
      });
      return;
    }

    if (!draft.rawText.trim()) {
      errorPopupManager.open({
        title: "본문을 입력해주세요",
        message: "암기할 영어 본문을 입력해주세요.",
      });
      return;
    }

    if (!draft.confirmed || !hasValidParagraph) {
      errorPopupManager.open({
        title: "문단을 확정해주세요",
        message: "문단 초안을 검수하고 확정해야 저장할 수 있습니다.",
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
        const result = await saveMemorizationMaterial(
          draft,
          mode === "edit" ? materialId : undefined,
        );

        if (result.code === "SUCCESS") {
          router.push("/sentence-memorization");
          router.refresh();
          return;
        }

        const error = createMemorizationMaterialErrorFromCode(result.code);
        errorPopupManager.open({
          title: error.title,
          message: error.message,
          code: error.code,
        });
      } catch {
        const error = createMemorizationMaterialErrorFromCode(
          MemorizationMaterialSaveFailedError.CODE,
        );
        errorPopupManager.open({
          title: error.title,
          message: error.message,
          code: error.code,
        });
      }
    });
  };

  return (
    <section className="flex w-full min-w-0 flex-col gap-7.5" data-pillar="memo" aria-busy={isBusy}>
      <MemorizationEditorHeader mode={mode} isSaving={isSaving} isBusy={isBusy} onSave={save} />
      <div className="grid grid-cols-2 items-start gap-6 max-editor:grid-cols-1">
        <div className={cn("min-w-0", isBusy && "opacity-60")} inert={isBusy}>
          <MemorizationEditorSourcePanel paragraphSuggestion={paragraphSuggestion} />
        </div>
        <div className={cn("min-w-0", isBusy && "opacity-60")} inert={isBusy}>
          <MemorizationParagraphReviewPanel />
        </div>
      </div>
    </section>
  );
}
