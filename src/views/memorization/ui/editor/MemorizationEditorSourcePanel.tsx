"use client";

import { Sparkles } from "lucide-react";

// shared
import { Textarea, TitleField } from "@/shared/components";
import { DashedActionButton, TagInputField } from "@/shared/components/ui";
import { errorPopupManager } from "@/shared/lib/error-popup";

// entities
import { createTagValue } from "@/entities/value-object";

// features
import type { MemorizationParagraphSuggestionProps } from "@/features/memorization-paragraph-suggestion/models/interface";

// views
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";

function MemorizationTitleField() {
  const title = useMemorizationEditorStore((state) => state.draft.title);
  const setTitle = useMemorizationEditorStore((state) => state.setTitle);

  return (
    <label className="flex flex-col gap-2">
      <span className="text-body-2 font-bold text-gray-text">제목</span>
      <TitleField
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
    <div className="mt-4 flex flex-col gap-2">
      <span className="text-body-2 font-bold text-gray-text">태그</span>
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
    <div className="rounded-card border border-card-line bg-white p-5 shadow-emphasize">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-body-2 font-bold text-gray-text">본문</span>
        <span className="text-body-1 font-bold text-gray-text-secondary">{wordCount} words</span>
      </div>
      <Textarea
        rows={14}
        value={rawText}
        placeholder="암기할 영어 본문을 입력하세요."
        onChange={(event) => setRawText(event.target.value)}
      />
    </div>
  );
}

function MemorizationParagraphSuggestButton({
  paragraphSuggestion,
}: {
  paragraphSuggestion: MemorizationParagraphSuggestionProps;
}) {
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
}: {
  paragraphSuggestion: MemorizationParagraphSuggestionProps;
}) {
  return (
    <aside className="flex min-w-0 flex-col gap-4">
      <div className="rounded-card border border-card-line bg-white p-5 shadow-emphasize">
        <MemorizationTitleField />
        <MemorizationTagsField />
      </div>

      <MemorizationRawTextField />
      <MemorizationParagraphSuggestButton paragraphSuggestion={paragraphSuggestion} />
    </aside>
  );
}
