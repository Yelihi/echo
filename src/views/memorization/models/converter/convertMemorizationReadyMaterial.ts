// entities
import type { MemorizationMaterial, MemorizationParagraph } from "@/entities/memorization-material";

// views
import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";

export function convertMemorizationMaterialToReadyMaterial(
  material: MemorizationMaterial,
): MemorizationReadyMaterial {
  const sentences = material.paragraphs.flatMap((paragraph) => paragraph.sentences);
  const wordCount = countWords(sentences.map((sentence) => sentence.text).join(" "));

  return {
    id: material.id,
    tags: material.tags.map((tag) => tag.displayName),
    title: material.title,
    description: material.paragraphs[0]?.sentences[0]?.text ?? "",
    paragraphCount: material.paragraphs.length,
    wordCount,
    estimatedMinutes: Math.max(1, Math.ceil(Math.max(sentences.length, 1) / 3)),
    difficulty: material.tags.at(-1)?.displayName ?? "기본",
  };
}

export function getMemorizationParagraphText(paragraph: MemorizationParagraph): string {
  return paragraph.sentences
    .map((sentence) => sentence.text.trim())
    .filter((text) => text.length > 0)
    .join(" ");
}

function countWords(text: string): number {
  const normalized = text.trim();

  if (normalized.length === 0) {
    return 0;
  }

  return normalized.split(/\s+/).length;
}
