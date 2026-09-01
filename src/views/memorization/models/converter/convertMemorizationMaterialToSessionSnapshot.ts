// entities
import type { MemorizationMaterial } from "@/entities/memorization-material";
import type { CreateMemorizationSessionSnapshot } from "@/entities/memorization-session";

export function convertMemorizationMaterialToSessionSnapshot(
  material: MemorizationMaterial,
): CreateMemorizationSessionSnapshot {
  return {
    material: structuredClone(material),
  };
}
