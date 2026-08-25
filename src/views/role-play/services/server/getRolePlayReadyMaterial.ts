// entities
import type { MaterialId } from "@/entities/value-object";

// views
import { convertRolePlayMaterialToReadyMaterial } from "@/views/role-play/models/converter/convertRolePlayReadyMaterial";
import type { RoleplayReadyMaterial } from "@/views/role-play/models/interface";
import { getRolePlayMaterial } from "@/views/role-play/services/server/getRolePlayMaterial";

export async function getRolePlayReadyMaterial(
  materialId: MaterialId,
): Promise<RoleplayReadyMaterial | null> {
  const material = await getRolePlayMaterial(materialId);

  if (!material) {
    return null;
  }

  return convertRolePlayMaterialToReadyMaterial(material);
}
