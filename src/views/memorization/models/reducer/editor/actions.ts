import type { MemorizationEditorAction } from "@/views/memorization/models/reducer/editor/interface";

export const setTitle = (title: string): MemorizationEditorAction => ({
  type: "set_title",
  title,
});

export const setTags = (tags: string[]): MemorizationEditorAction => ({
  type: "set_tags",
  tags,
});

export const setRawText = (rawText: string): MemorizationEditorAction => ({
  type: "set_raw_text",
  rawText,
});

export const setParagraphs = (paragraphs: string[]): MemorizationEditorAction => ({
  type: "set_paragraphs",
  paragraphs,
});

export const updateParagraph = (index: number, value: string): MemorizationEditorAction => ({
  type: "update_paragraph",
  index,
  value,
});

export const mergeParagraph = (index: number): MemorizationEditorAction => ({
  type: "merge_paragraph",
  index,
});

export const deleteParagraph = (index: number): MemorizationEditorAction => ({
  type: "delete_paragraph",
  index,
});

export const confirmParagraphs = (paragraphs: string[]): MemorizationEditorAction => ({
  type: "confirm_paragraphs",
  paragraphs,
});
