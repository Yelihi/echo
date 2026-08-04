import { mockMemorizationSources } from "@/views/memorization/config/mock";
import type { MemorizationReadyMaterial } from "@/views/memorization/models/ready";

export const getMemorizationReadyMockMaterial = (
  materialId: string,
): MemorizationReadyMaterial | undefined => {
  const source = mockMemorizationSources.find((item) => item.id === materialId);

  if (!source) {
    return undefined;
  }

  return {
    id: source.id,
    tags: source.tags.map((tag) => tag.label),
    title: source.subTitle,
    description: source.title,
    paragraphCount: source.contentValue,
    wordCount: source.contentValue * 24,
    estimatedMinutes: Math.max(2, Math.ceil(source.contentValue / 4)),
    difficulty: source.tags.at(-1)?.label ?? "기본",
  };
};
