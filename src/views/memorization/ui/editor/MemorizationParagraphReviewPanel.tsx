"use client";

import { useShallow } from "zustand/react/shallow";
import { Check } from "lucide-react";

// shared
import { Button } from "@/shared/components";
import { MemorizationParagraphItem } from "./MemorizationParagraphItem";
import { errorPopupManager } from "@/shared/lib/error-popup";

// views
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";

function MemorizationParagraphMeta() {
  const confirmed = useMemorizationEditorStore((state) => state.draft.confirmed);
  const validParagraphCount = useMemorizationEditorStore(
    (state) => state.draft.paragraphs.filter((paragraph) => paragraph.trim().length > 0).length,
  );

  return confirmed ? "확정됨" : `${validParagraphCount}개 문단`;
}

function MemorizationParagraphList() {
  const paragraphIndexes = useMemorizationEditorStore(
    useShallow((state) => state.draft.paragraphs.map((_, index) => index)),
  );

  if (paragraphIndexes.length === 0) {
    return (
      <div className="flex min-h-67.5 flex-col items-center justify-center gap-3 p-6 text-center text-[13px] leading-[1.8] text-practice-muted">
        본문을 입력한 뒤 AI 문단 제안 요청을 눌러 초안을 만드세요.
      </div>
    );
  }

  return paragraphIndexes.map((index) => <MemorizationParagraphItem key={index} index={index} />);
}

function MemorizationParagraphConfirmBar() {
  const confirm = () => {
    const validParagraphs = useMemorizationEditorStore
      .getState()
      .draft.paragraphs.filter((paragraph) => paragraph.trim().length > 0);

    if (validParagraphs.length === 0) {
      errorPopupManager.open({
        title: "확정할 문단이 없습니다",
        message: "본문으로 문단 초안을 만든 뒤 다시 시도해주세요.",
      });
      return;
    }

    useMemorizationEditorStore.getState().confirmParagraphs(validParagraphs);
  };

  return (
    <div className="mt-7 flex justify-end border-t border-practice-panel-line pt-5.5">
      <Button
        className="rounded-[7px] text-[13px]"
        type="button"
        variant="secondary"
        size="lg"
        onClick={confirm}
      >
        <Check className="size-4" />
        문단 확정
      </Button>
    </div>
  );
}

export function MemorizationParagraphReviewPanel() {
  return (
    <section
      className="min-w-0 rounded-[14px] border border-practice-panel-line bg-white p-8 shadow-practice-panel max-editor:p-6.5 max-compact:px-4.5 max-compact:py-5.5"
      aria-labelledby="memo-review-title"
    >
      <div className="mb-7 flex items-center justify-between gap-5 max-compact:items-start max-compact:gap-3">
        <h2
          className="text-[19px] font-medium text-practice-body max-compact:text-[17px]"
          id="memo-review-title"
        >
          문단 검수
        </h2>
        <span className="text-[12px] text-practice-muted">
          <MemorizationParagraphMeta />
        </span>
      </div>
      <div className="flex min-h-67.5 flex-col gap-6">
        <MemorizationParagraphList />
      </div>
      <MemorizationParagraphConfirmBar />
    </section>
  );
}
