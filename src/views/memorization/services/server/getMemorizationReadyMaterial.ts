// entities
import type { MaterialId } from "@/entities/value-object";

// views
import { convertMemorizationMaterialToReadyMaterial } from "@/views/memorization/models/converter/convertMemorizationReadyMaterial";
import type { MemorizationReadyMaterial } from "@/features/memorization-sessions/models/ready";
import { getMemorizationMaterial } from "@/views/memorization/services/server/getMemorizationMaterial";

export async function getMemorizationReadyMaterial(
  materialId: MaterialId,
): Promise<MemorizationReadyMaterial | null> {
  const material = await getMemorizationMaterial(materialId);

  if (!material) {
    return null;
  }

  return convertMemorizationMaterialToReadyMaterial(material);
}
