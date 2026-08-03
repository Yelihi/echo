"use client";

import { useMemo } from "react";
import { Check, ChevronUp, Trash } from "lucide-react";

import { Button, Textarea } from "@/shared/components";
import { EditorPanelHeader, ParagraphRow } from "@/shared/components/ui";
import { errorPopupManager } from "@/shared/lib/error-popup";
import type { MemorizationEditorDraft } from "@/views/memorization/models/editor";
import type { MemorizationEditorAction } from "@/views/memorization/models/editorReducer";

interface MemorizationParagraphReviewPanelProps {
  draft: MemorizationEditorDraft;
  onAction: (action: MemorizationEditorAction) => void;
}

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
      className="inline-flex size-7.5 cursor-pointer items-center justify-center rounded-md text-gray-text transition-colors outline-none hover:bg-gray-background focus-visible:ring-2 focus-visible:ring-accent-500/30 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.75"
    >
      {children}
    </button>
  );
}

export function MemorizationParagraphReviewPanel({
  draft,
  onAction,
}: MemorizationParagraphReviewPanelProps) {
  const validParagraphs = useMemo(
    () => draft.paragraphs.filter((paragraph) => paragraph.trim().length > 0),
    [draft.paragraphs],
  );

  const updateParagraph = (index: number, value: string) => {
    onAction({ type: "update_paragraph", index, value });
  };

  const mergeParagraph = (index: number) => {
    onAction({ type: "merge_paragraph", index });
  };

  const deleteParagraph = (index: number) => {
    onAction({ type: "delete_paragraph", index });
  };

  const confirmParagraphs = () => {
    if (validParagraphs.length === 0) {
      errorPopupManager.open({
        title: "확정할 문단이 없습니다",
        message: "본문으로 문단 초안을 만든 뒤 다시 시도해주세요.",
      });
      return;
    }

    onAction({ type: "confirm_paragraphs", paragraphs: validParagraphs });
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-card border border-card-line bg-white shadow-emphasize">
      <EditorPanelHeader
        title="문단 검수"
        meta={draft.confirmed ? "확정됨" : `${validParagraphs.length}개 문단`}
      />
      <div className="flex max-h-[720px] min-h-120 flex-col gap-3 overflow-y-auto bg-gray-background px-4 py-5 md:px-6">
        {draft.paragraphs.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center rounded-control border border-dashed border-card-line-strong bg-card-surface px-6 text-center text-body-3 text-gray-text">
            본문을 입력한 뒤 AI 문단 제안 요청을 눌러 초안을 만드세요.
          </div>
        ) : (
          draft.paragraphs.map((paragraph, index) => (
            <ParagraphRow
              key={index}
              index={index + 1}
              mode={draft.confirmed ? "confirmed" : "edit"}
              actions={
                <>
                  <ParagraphActionButton
                    label="위 문단과 합치기"
                    disabled={index === 0}
                    onClick={() => mergeParagraph(index)}
                  >
                    <ChevronUp />
                  </ParagraphActionButton>
                  <ParagraphActionButton label="문단 삭제" onClick={() => deleteParagraph(index)}>
                    <Trash />
                  </ParagraphActionButton>
                </>
              }
            >
              {draft.confirmed ? (
                <p className="py-2 text-body-4 leading-relaxed text-black-primary">{paragraph}</p>
              ) : (
                <Textarea
                  rows={3}
                  value={paragraph}
                  aria-label={`문단 ${index + 1}`}
                  onChange={(event) => updateParagraph(index, event.target.value)}
                />
              )}
            </ParagraphRow>
          ))
        )}
      </div>
      <div className="flex justify-end border-t border-card-line bg-card-surface px-4 py-3">
        <Button type="button" variant="secondary" size="lg" onClick={confirmParagraphs}>
          <Check className="size-4" />
          문단 확정
        </Button>
      </div>
    </div>
  );
}
