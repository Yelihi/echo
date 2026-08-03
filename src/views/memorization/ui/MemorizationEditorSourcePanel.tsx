"use client";

import { useMemo } from "react";
import { Sparkles } from "lucide-react";

import { createTagValue } from "@/entities/value-object";
import { Textarea, TitleField } from "@/shared/components";
import { DashedActionButton, TagInput } from "@/shared/components/ui";
import { useTagInputController } from "@/shared/hooks/useTagInputController";
import { errorPopupManager } from "@/shared/lib/error-popup";
import type { MemorizationEditorDraft } from "@/views/memorization/models/editor";

interface MemorizationEditorSourcePanelProps {
  draft: MemorizationEditorDraft;
  onChange: (draft: MemorizationEditorDraft) => void;
  onDirty: () => void;
}

const splitParagraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export function MemorizationEditorSourcePanel({
  draft,
  onChange,
  onDirty,
}: MemorizationEditorSourcePanelProps) {
  const wordCount = useMemo(
    () => draft.rawText.trim().split(/\s+/).filter(Boolean).length,
    [draft.rawText],
  );

  const tagInput = useTagInputController({
    tags: draft.tags,
    onChange: (tags) => onChange({ ...draft, tags }),
    getDuplicateKey: (tag) => createTagValue(tag).normalizedName,
    onInputDirty: onDirty,
  });

  const updateRawText = (rawText: string) => {
    onChange({ ...draft, rawText, confirmed: false });
  };

  const createParagraphDraft = () => {
    const paragraphs = splitParagraphs(draft.rawText);
    if (paragraphs.length === 0) {
      errorPopupManager.open({
        title: "본문을 입력해주세요",
        message: "문단 초안을 만들려면 먼저 암기할 본문이 필요합니다.",
      });
      return;
    }

    // TODO: AI 문단 제안 provider 연결 시 이 local split 을 교체합니다.
    onChange({ ...draft, paragraphs, confirmed: false });
  };

  return (
    <aside className="flex min-w-0 flex-col gap-4">
      <div className="rounded-card border border-card-line bg-white p-5 shadow-emphasize">
        <label className="flex flex-col gap-2">
          <span className="text-body-2 font-bold text-gray-text">제목</span>
          <TitleField
            value={draft.title}
            placeholder="예: Business Email Openings"
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
          />
        </label>
        <div className="mt-4 flex flex-col gap-2">
          <span className="text-body-2 font-bold text-gray-text">태그</span>
          <TagInput
            theme="memo"
            tags={draft.tags}
            placeholder="태그 입력 후 Enter"
            onRemoveTag={tagInput.removeTag}
            inputProps={{
              ...tagInput.inputProps,
              "aria-label": "태그 입력",
            }}
          />
        </div>
      </div>

      <div className="rounded-card border border-card-line bg-white p-5 shadow-emphasize">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-body-2 font-bold text-gray-text">본문</span>
          <span className="text-body-1 font-bold text-gray-text-secondary">{wordCount} words</span>
        </div>
        <Textarea
          rows={14}
          value={draft.rawText}
          placeholder="암기할 영어 본문을 입력하세요."
          onChange={(event) => updateRawText(event.target.value)}
        />
      </div>

      <DashedActionButton icon={<Sparkles className="size-4" />} onClick={createParagraphDraft}>
        AI 문단 제안 요청
      </DashedActionButton>
    </aside>
  );
}
