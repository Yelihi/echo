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
import type {
  MemorizationEditorDraft,
  MemorizationEditorMode,
} from "@/views/memorization/models/editor";
import { createMemorizationMaterialErrorFromCode } from "@/views/memorization/models/errors";
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";
import { createMemorizationMaterial } from "@/views/memorization/services/action/createMemorizationMaterial";
import { MemorizationEditorHeader } from "@/views/memorization/ui/editor/MemorizationEditorHeader";
import { MemorizationEditorSourcePanel } from "@/views/memorization/ui/editor/MemorizationEditorSourcePanel";
import { MemorizationParagraphReviewPanel } from "@/views/memorization/ui/editor/MemorizationParagraphReviewPanel";

interface MemorizationEditorClientProps {
  mode: MemorizationEditorMode;
  initialDraft?: MemorizationEditorDraft;
}

export function MemorizationEditorClient({ mode, initialDraft }: MemorizationEditorClientProps) {
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

    if (mode !== "create") {
      errorPopupManager.open({
        title: "아직 수정 저장을 지원하지 않습니다",
        message: "지금은 새 자료 만들기만 저장할 수 있습니다. 수정 저장은 곧 연결됩니다.",
      });
      return;
    }

    startSaveTransition(async () => {
      const result = await createMemorizationMaterial(draft);

      if (result.code === "SUCCESS") {
        router.push("/sentence-memorization");
        return;
      }

      const error = createMemorizationMaterialErrorFromCode(result.code);
      errorPopupManager.open({
        title: error.title,
        message: error.message,
        code: error.code,
      });
    });
  };

  return (
    <section
      className="flex min-h-0 w-full flex-1 flex-col gap-7 lg:h-full lg:overflow-hidden"
      data-pillar="memo"
      aria-busy={isBusy}
    >
      <MemorizationEditorHeader mode={mode} isSaving={isSaving} isBusy={isBusy} onSave={save} />
      <div className="grid min-h-0 w-full flex-1 gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
        <div
          className={cn("min-h-0 lg:h-full lg:overflow-y-auto", isBusy && "opacity-60")}
          inert={isBusy}
        >
          <MemorizationEditorSourcePanel paragraphSuggestion={paragraphSuggestion} />
        </div>
        <div
          className={cn("flex min-h-0 flex-1 flex-col lg:h-full", isSaving && "opacity-60")}
          inert={isSaving}
        >
          <MemorizationParagraphReviewPanel />
        </div>
      </div>
    </section>
  );
}
