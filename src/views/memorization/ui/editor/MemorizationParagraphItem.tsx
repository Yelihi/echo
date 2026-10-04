"use client";
import { ChevronUp, Trash } from "lucide-react";
import { Textarea } from "@/shared/components";
import { ParagraphRow } from "@/shared/components/ui";
import type {
  ParagraphActionButtonProps,
  MemorizationParagraphItemProps,
} from "@/views/memorization/models/interface";
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";
function ParagraphActionButton({ label, disabled, children, onClick }: ParagraphActionButtonProps) {
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

export function MemorizationParagraphItem({ index }: MemorizationParagraphItemProps) {
  const paragraph = useMemorizationEditorStore((state) => state.draft.paragraphs[index]);
  const confirmed = useMemorizationEditorStore((state) => state.draft.confirmed);

  if (paragraph == null) {
    return null;
  }

  return (
    <ParagraphRow
      className="gap-3 [&>span]:mt-2.5 [&>span]:bg-transparent [&>span]:text-[12px] [&>span]:font-normal [&>span]:text-practice-muted"
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
          className="field-sizing-content resize-none overflow-hidden p-3.25 leading-[1.8]"
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
