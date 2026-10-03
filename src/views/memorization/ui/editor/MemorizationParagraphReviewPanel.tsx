"use client";

import { useShallow } from "zustand/react/shallow";
import { Check, ChevronUp, Trash } from "lucide-react";

// shared
import { Button, Textarea } from "@/shared/components";
import { EditorPanelHeader, ParagraphRow } from "@/shared/components/ui";
import { errorPopupManager } from "@/shared/lib/error-popup";

// views
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";

function ParagraphActionButton({
  label,
  disabled,
  children,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-gray-text transition-colors outline-none hover:bg-gray-background focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.75"
    >
      {children}
    </button>
  );
}

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
      <div className="flex min-h-48 flex-1 items-center justify-center rounded-control border border-dashed border-card-line-strong bg-card-surface px-6 text-center text-body-3 text-gray-text">
        본문을 입력한 뒤 AI 문단 제안 요청을 눌러 초안을 만드세요.
      </div>
    );
  }

  return paragraphIndexes.map((index) => <MemorizationParagraphItem key={index} index={index} />);
}

function MemorizationParagraphItem({ index }: { index: number }) {
  const paragraph = useMemorizationEditorStore((state) => state.draft.paragraphs[index]);
  const confirmed = useMemorizationEditorStore((state) => state.draft.confirmed);

  if (paragraph == null) {
    return null;
  }

  return (
    <ParagraphRow
      index={index + 1}
      mode={confirmed ? "confirmed" : "edit"}
      actions={
        <>
          <ParagraphActionButton
            label="위 문단과 합치기"
            disabled={index === 0}
            onClick={() => useMemorizationEditorStore.getState().mergeParagraphIntoPrevious(index)}
          >
            <ChevronUp />
          </ParagraphActionButton>
          <ParagraphActionButton
            label="문단 삭제"
            onClick={() => useMemorizationEditorStore.getState().deleteParagraph(index)}
          >
            <Trash />
          </ParagraphActionButton>
        </>
      }
    >
      {confirmed ? (
        <p className="py-2 text-body-4 leading-relaxed text-black-primary">{paragraph}</p>
      ) : (
        <Textarea
          rows={3}
          className="field-sizing-content resize-none overflow-hidden"
          value={paragraph}
          aria-label={`문단 ${index + 1}`}
          onChange={(event) =>
            useMemorizationEditorStore.getState().updateParagraph(index, event.target.value)
          }
        />
      )}
    </ParagraphRow>
  );
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
    <div className="flex shrink-0 justify-end border-t border-card-line bg-card-surface px-4 py-3">
      <Button type="button" variant="secondary" size="lg" onClick={confirm}>
        <Check className="size-4" />
        문단 확정
      </Button>
    </div>
  );
}

export function MemorizationParagraphReviewPanel() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-card border border-card-line bg-white">
      <EditorPanelHeader
        className="shrink-0"
        title="문단 검수"
        meta={<MemorizationParagraphMeta />}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-gray-background px-4 py-5 md:px-6">
        <MemorizationParagraphList />
      </div>
      <MemorizationParagraphConfirmBar />
    </div>
  );
}
