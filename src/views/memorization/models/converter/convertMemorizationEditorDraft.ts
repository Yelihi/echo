// entities
import type {
  CreateMemorizationMaterialInput,
  MemorizationMaterial,
} from "@/entities/memorization-material";
import { createTagValue, type UserId } from "@/entities/value-object";

// views
import type { MemorizationEditorDraftInput } from "@/views/memorization/config/schema";
import { getMemorizationParagraphText } from "@/views/memorization/models/converter/convertMemorizationReadyMaterial";
import type { MemorizationEditorDraft } from "@/views/memorization/models/editor";

export const MEMORIZATION_EDITOR_EMPTY_DRAFT: MemorizationEditorDraft = {
  title: "",
  tags: [],
  rawText: "",
  paragraphs: [],
  confirmed: false,
};

export function convertMemorizationEditorDraftToCreateInput(
  draft: MemorizationEditorDraftInput,
  ownerId: UserId,
): CreateMemorizationMaterialInput {
  return {
    ownerId,
    title: draft.title,
    tags: draft.tags.map((tag) => createTagValue(tag)),
    paragraphs: draft.paragraphs.map((text, index) => ({
      order: index,
      sentences: [{ order: 0, text, translation: null }],
    })),
  };
}

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
