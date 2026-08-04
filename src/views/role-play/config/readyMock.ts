import { mockSources } from "@/views/role-play/config/mock";
import type { RoleplayReadyMaterial } from "@/views/role-play/models/ready";

export const getRoleplayReadyMockMaterial = (
  materialId: string,
): RoleplayReadyMaterial | undefined => {
  const source = mockSources.find((item) => item.id === materialId);

  if (!source) {
    return undefined;
  }

  return {
    id: source.id,
    tags: source.tags.map((tag) => tag.label),
    title: source.subTitle,
    description: source.title,
    lineCount: source.contentValue,
    learnerTurnCount: Math.ceil(source.contentValue / 2),
    estimatedMinutes: Math.max(1, Math.ceil(source.contentValue / 3)),
    difficulty: source.tags.at(-1)?.label ?? "기본",
  };
};
