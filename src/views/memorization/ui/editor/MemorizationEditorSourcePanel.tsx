"use client";

import { Sparkles } from "lucide-react";

// shared
import { Textarea, Input } from "@/shared/components";
import { DashedActionButton, TagInputField } from "@/shared/components/ui";
import { errorPopupManager } from "@/shared/lib/error-popup";

// entities
import { createTagValue } from "@/entities/value-object";

// features
import type { MemorizationEditorSourcePanelProps } from "@/views/memorization/models/interface";

// views
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";

function MemorizationTitleField() {
  const title = useMemorizationEditorStore((state) => state.draft.title);
  const setTitle = useMemorizationEditorStore((state) => state.setTitle);

  return (
    <label className="flex min-w-0 flex-col gap-2.5">
      <span className="text-[13px] font-normal text-practice-muted">제목</span>
      <Input
        value={title}
        placeholder="예: Business Email Openings"
        onChange={(event) => setTitle(event.target.value)}
      />
    </label>
  );
}

function MemorizationTagsField() {
  const tags = useMemorizationEditorStore((state) => state.draft.tags);
  const setTags = useMemorizationEditorStore((state) => state.setTags);
  const markDirty = useMemorizationEditorStore((state) => state.markDirty);

  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <span className="text-[13px] font-normal text-practice-muted">태그</span>
      <TagInputField
        theme="memo"
        tags={tags}
        placeholder="태그 입력 후 Enter"
        getDuplicateKey={(tag) => createTagValue(tag).normalizedName}
        onChange={setTags}
        onInputDirty={markDirty}
      />
    </div>
  );
}

function MemorizationRawTextField() {
  const rawText = useMemorizationEditorStore((state) => state.draft.rawText);
  const setRawText = useMemorizationEditorStore((state) => state.setRawText);
  const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="mb-2.5 flex justify-between text-[12px] text-practice-muted">
        <span className="text-[13px] font-normal text-practice-muted">본문</span>
        <span className="text-body-1 font-bold text-gray-text-secondary">{wordCount} words</span>
      </div>
      <Textarea
        aria-label="암기할 영어 본문"
        rows={10}
        className="min-h-65 w-full resize-y"
        value={rawText}
        placeholder="암기할 영어 본문을 입력하세요."
        onChange={(event) => setRawText(event.target.value)}
      />
    </div>
  );
}

function MemorizationParagraphSuggestButton({
  paragraphSuggestion,
}: MemorizationEditorSourcePanelProps) {
  const requestSuggestion = () => {
    const rawText = useMemorizationEditorStore.getState().draft.rawText;

    if (!rawText.trim()) {
      errorPopupManager.open({
        title: "본문을 입력해주세요",
        message: "문단 초안을 만들려면 먼저 암기할 본문이 필요합니다.",
      });
      return;
    }

    paragraphSuggestion.suggest(rawText);
  };

  return (
    <DashedActionButton
      className="min-h-11.5 rounded-[7px] border border-solid border-practice-input-line bg-white text-[13px] text-black-secondary"
      icon={<Sparkles className="size-4" />}
      pending={paragraphSuggestion.isPending}
      disabled={paragraphSuggestion.isPending}
      onClick={requestSuggestion}
    >
      AI 문단 제안 요청
    </DashedActionButton>
  );
}

export function MemorizationEditorSourcePanel({
  paragraphSuggestion,
}: MemorizationEditorSourcePanelProps) {
  return (
    <section
      className="min-w-0 rounded-[14px] border border-practice-panel-line bg-white p-8 shadow-practice-panel max-editor:p-6.5 max-compact:px-4.5 max-compact:py-5.5"
      aria-labelledby="memo-source-title"
    >
      <div className="mb-7 flex items-center justify-between gap-5 max-compact:items-start max-compact:gap-3">
        <h2
          className="text-[19px] font-medium text-practice-body max-compact:text-[17px]"
          id="memo-source-title"
        >
          원문 입력
        </h2>
      </div>
      <div className="flex flex-col gap-6">
        <MemorizationTitleField />
        <MemorizationTagsField />
        <MemorizationRawTextField />
      </div>
      <div className="mt-6">
        <MemorizationParagraphSuggestButton paragraphSuggestion={paragraphSuggestion} />
      </div>
    </section>
  );
}
