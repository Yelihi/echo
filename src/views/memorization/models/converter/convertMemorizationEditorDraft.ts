// entities
import type { MemorizationMaterial } from "@/entities/memorization-material";

// views
import { getMemorizationParagraphText } from "@/views/memorization/models/converter/convertMemorizationReadyMaterial";
import type { MemorizationEditorDraft } from "@/views/memorization/models/editor";

export const MEMORIZATION_EDITOR_EMPTY_DRAFT: MemorizationEditorDraft = {
  title: "",
  tags: [],
  rawText: "",
  paragraphs: [],
  confirmed: false,
};

export function convertMemorizationMaterialToEditorDraft(
  material: MemorizationMaterial,
): MemorizationEditorDraft {
  const paragraphs = material.paragraphs
    .map(getMemorizationParagraphText)
    .filter((paragraph) => paragraph.length > 0);

  return {
    title: material.title,
    tags: material.tags.map((tag) => tag.displayName),
    rawText: paragraphs.join("\n\n"),
    paragraphs,
    confirmed: paragraphs.length > 0,
  };
}
