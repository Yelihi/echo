"use client";
import styles from "@/shared/components/editor/Editor.module.css";

import { Sparkles } from "lucide-react";

// shared
import { Textarea, Input } from "@/shared/components";
import { DashedActionButton, TagInputField } from "@/shared/components/ui";
import { errorPopupManager } from "@/shared/lib/error-popup";

// entities
import { createTagValue } from "@/entities/value-object";

// features
import type { MemorizationEditorSourcePanelProps } from "@/views/memorization/models/editor";

// views
import { useMemorizationEditorStore } from "@/views/memorization/models/stores/memorizationEditorStore";

function MemorizationTitleField() {
  const title = useMemorizationEditorStore((state) => state.draft.title);
  const setTitle = useMemorizationEditorStore((state) => state.setTitle);

  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>제목</span>
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
    <div className={styles.field}>
      <span className={styles.fieldLabel}>태그</span>
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
    <div className={styles.field}>
      <div className={styles.bodyHeading}>
        <span className={styles.fieldLabel}>본문</span>
        <span className="text-body-1 font-bold text-gray-text-secondary">{wordCount} words</span>
      </div>
      <Textarea
        aria-label="암기할 영어 본문"
        rows={10}
        className={styles.bodyInput}
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
    <section className={styles.panel} aria-labelledby="memo-source-title">
      <div className={styles.panelHeading}>
        <h2 id="memo-source-title">원문 입력</h2>
      </div>
      <div className={styles.sourceFields}>
        <MemorizationTitleField />
        <MemorizationTagsField />
        <MemorizationRawTextField />
      </div>
      <div className={styles.suggest}>
        <MemorizationParagraphSuggestButton paragraphSuggestion={paragraphSuggestion} />
      </div>
    </section>
  );
}
