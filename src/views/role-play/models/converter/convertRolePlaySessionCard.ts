// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material";

// widgets
import type { SourceCardProps } from "@/widgets/source-card/models/interface";

// views
import type { RolePlaySessionTheme } from "@/views/role-play/models/interface";

export const convertRolePlaySessionCard = (
  material: RoleplayMaterial,
  theme: RolePlaySessionTheme,
): Omit<SourceCardProps, "innerMenuItems" | "onMenuAction"> => {
  return {
    id: material.id,
    tags: material.tags.map((tag) => ({
      label: tag.displayName,
      value: tag.normalizedName,
    })),
    title: material.title,
    subTitle: material.situation,
    theme,
    contentValue: material.lines.length,
  };
};
