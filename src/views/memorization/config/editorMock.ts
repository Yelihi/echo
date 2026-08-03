import { mockMemorizationSources } from "@/views/memorization/config/mock";
import type { MemorizationEditorDraft } from "@/views/memorization/models/editor";

export const memorizationEditorEmptyDraft: MemorizationEditorDraft = {
  title: "",
  tags: [],
  rawText: "",
  paragraphs: [],
  confirmed: false,
};

export const getMemorizationEditorMockDraft = (materialId?: string): MemorizationEditorDraft => {
  const source =
    mockMemorizationSources.find((item) => item.id === materialId) ?? mockMemorizationSources[0];
  const rawText =
    "Thank you for taking the time to meet with me today.\n\nI am excited to explain how my experience can contribute to your team.";

  return {
    title: source?.title ?? "",
    tags: source?.tags.map((tag) => tag.value) ?? [],
    rawText,
    paragraphs: rawText.split("\n\n"),
    confirmed: true,
  };
};
