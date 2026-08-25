// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material";

// views
import type { RoleplayReadyMaterial } from "@/views/role-play/models/interface";

export function convertRolePlayMaterialToReadyMaterial(
  material: RoleplayMaterial,
): RoleplayReadyMaterial {
  const speakerOrderById = new Map(
    material.speakers.map((speaker) => [speaker.id, speaker.order] as const),
  );
  const learnerTurnCount = material.lines.filter(
    (line) => speakerOrderById.get(line.speakerId) === 2,
  ).length;

  return {
    id: material.id,
    tags: material.tags.map((tag) => tag.displayName),
    title: material.title,
    description: material.situation,
    lineCount: material.lines.length,
    learnerTurnCount,
    estimatedMinutes: Math.max(1, Math.ceil(material.lines.length / 3)),
    difficulty: material.tags.at(-1)?.displayName ?? "기본",
  };
}
