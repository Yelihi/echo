// entities
import type { MemorizationMaterial } from "@/entities/memorization-material";

// widgets
import type { SourceCardProps } from "@/widgets/source-card/models/interface";

// views
import type { MemorizationSessionTheme } from "@/views/memorization/models/interface";

export const convertMemorizationSessionCard = (
  material: MemorizationMaterial,
  theme: MemorizationSessionTheme,
): Omit<SourceCardProps, "innerMenuItems" | "onMenuAction"> => {
  return {
    id: material.id,
    tags: material.tags.map((tag) => ({
      label: tag.displayName,
      value: tag.normalizedName,
    })),
    title: material.title,
    subTitle: material.paragraphs[0]?.sentences[0]?.text ?? "",
    theme,
    contentValue: material.paragraphs.length,
  };
};
